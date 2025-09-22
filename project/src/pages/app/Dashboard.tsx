import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { ComplianceEngine } from '@/lib/compliance';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { TestDataGenerator } from '@/components/dashboard/TestDataGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import type { Carer, CarerDocument, ComplianceStats } from '@/types';

export function Dashboard() {
  const { currentAgency } = useAuth();
  const [stats, setStats] = useState<ComplianceStats>({
    overall_score: 0,
    green_count: 0,
    amber_count: 0,
    red_count: 0,
    total_carers: 0,
    expiring_soon: 0,
    overdue: 0
  });
  const [recentDocuments, setRecentDocuments] = useState<CarerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Listen for test data changes
    const handleTestDataChange = () => {
      loadDashboardData();
    };
    
    window.addEventListener('testDataChanged', handleTestDataChange);
    
    return () => {
      window.removeEventListener('testDataChanged', handleTestDataChange);
    };
  }, [currentAgency]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for test data in localStorage first
      const testData = localStorage.getItem('fellowCarerTestData');
      if (testData) {
        const { carers } = JSON.parse(testData);
        
        // Calculate compliance status for each carer based on their documents
        const carersWithStatus = carers.map((carer: any) => ({
          ...carer,
          status: ComplianceEngine.calculateCarerStatus(carer, carer.documents || [])
        }));
        
        const calculatedStats = ComplianceEngine.calculateAgencyStats(carersWithStatus);
        setStats(calculatedStats);
        
        // Get recent documents from test data
        const allDocuments = carersWithStatus.flatMap((carer: any) => 
          (carer.documents || []).map((doc: any) => ({
            ...doc,
            created_at: doc.created_at || carer.created_at,
            template: doc.template || { name: doc.template_name || 'Unknown Document' }
          }))
        ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setRecentDocuments(allDocuments.slice(0, 5));
        setLoading(false);
        return;
      }

      // If no current agency, return empty data
      if (!currentAgency?.id) {
        setStats({
          overall_score: 0,
          green_count: 0,
          amber_count: 0,
          red_count: 0,
          total_carers: 0,
          expiring_soon: 0,
          overdue: 0
        });
        setRecentDocuments([]);
        setLoading(false);
        return;
      }

      // Load carers with their documents
      const { data: carersData, error: carersError } = await supabase
        .from('carers')
        .select(`
          *,
          documents:carer_documents(
            *,
            template:document_templates(*)
          )
        `)
        .eq('agency_id', currentAgency?.id);

      if (carersError) {
        console.error('Error loading carers:', carersError);
        // Set empty data instead of throwing
        setStats({
          overall_score: 0,
          green_count: 0,
          amber_count: 0,
          red_count: 0,
          total_carers: 0,
          expiring_soon: 0,
          overdue: 0
        });
        setRecentDocuments([]);
        setLoading(false);
        return;
      }

      const carers = carersData as Carer[];
      
      // Calculate compliance stats
      const calculatedStats = ComplianceEngine.calculateAgencyStats(carers);
      setStats(calculatedStats);

      // Get recent documents
      const allDocuments = carers.flatMap(carer => carer.documents || []);
      const sortedDocuments = allDocuments
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      
      setRecentDocuments(sortedDocuments);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      // Show empty state instead of error for now
      setStats({
        overall_score: 0,
        green_count: 0,
        amber_count: 0,
        red_count: 0,
        total_carers: 0,
        expiring_soon: 0,
        overdue: 0
      });
      setRecentDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6 w-full">
      <div>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Dashboard</h1>
        <p className="text-gray-600">
          Monitor your compliance status and manage your care team effectively.
        </p>
      </div>

      <DashboardStats stats={stats} />

      <TestDataGenerator onDataChange={loadDashboardData} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Expiring Documents
            </CardTitle>
            <CardDescription>
              Documents that expire within the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.expiring_soon === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">All documents are up to date!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocuments
                  .filter(doc => {
                    const today = new Date();
                    const expiryDate = new Date(doc.expires_on);
                    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilExpiry < 60 && daysUntilExpiry > 0;
                  })
                  .slice(0, 5)
                  .map(doc => {
                    const daysUntilExpiry = Math.floor(
                      (new Date(doc.expires_on).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{doc.template?.name}</p>
                          <p className="text-xs text-gray-600">{doc.file_name}</p>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {daysUntilExpiry}d
                        </Badge>
                      </div>
                    );
                  })}
                <Button variant="outline" className="w-full" size="sm">
                  View All Expiring
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest document uploads and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 mb-3">No documents uploaded yet</p>
                <Button variant="outline" size="sm">
                  Upload First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{doc.template?.name}</p>
                      <p className="text-xs text-gray-600">
                        Added {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={ComplianceEngine.getStatusColor(
                        doc.status === 'expired' ? 'red' : 
                        doc.status === 'approved' ? 'green' : 'amber'
                      )}
                    >
                      {doc.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full" size="sm">
                  View All Documents
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Compliance Insights
          </CardTitle>
          <CardDescription>
            Your Fellow Carer compliance journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-[#0A0A0A]">Overall Score</h4>
                <p className="text-sm text-gray-600">
                  {stats.overall_score >= 80 ? 'Excellent compliance level' :
                   stats.overall_score >= 60 ? 'Good progress, room for improvement' :
                   'Action needed to improve compliance'}
                </p>
              </div>
              <div className={`text-3xl font-bold ${ComplianceEngine.getScoreColor(stats.overall_score)}`}>
                {stats.overall_score}%
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.green_count}</div>
                <div className="text-sm text-green-700">Compliant</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.amber_count}</div>
                <div className="text-sm text-yellow-700">Attention Needed</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.red_count}</div>
                <div className="text-sm text-red-700">Action Required</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}