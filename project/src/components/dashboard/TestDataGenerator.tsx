import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Database, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Carer, ComplianceStats } from '@/types';

interface TestDataGeneratorProps {
  onDataChange?: () => void;
}

export function TestDataGenerator({ onDataChange }: TestDataGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [hasTestData, setHasTestData] = useState(false);
  const [carerCount, setCarerCount] = useState(50);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { user, impersonation } = useAuth();

  const isSuperAdmin = user?.is_super_admin && !impersonation.is_impersonating;

  // Check if test data exists
  React.useEffect(() => {
    const testData = localStorage.getItem('fellowCarerTestData');
    setHasTestData(!!testData);
  }, []);

  const generateTestData = async () => {
    setLoading(true);
    setMessage(null);

    try {
      console.log(`Generating ${carerCount} test carers...`);
      
      // Generate random names for 50 carers
      const firstNames = [
        'Sarah', 'Michael', 'Emma', 'James', 'Lisa', 'Amanda', 'Daniel', 'Rachel', 'Matthew', 'Lauren',
        'Anthony', 'Stephanie', 'Kevin', 'Michelle', 'Brian', 'Nicole', 'Ryan', 'Ashley', 'David', 'Jessica',
        'Christopher', 'Jennifer', 'Joshua', 'Amanda', 'Andrew', 'Melissa', 'Kenneth', 'Deborah', 'Paul', 'Dorothy',
        'Mark', 'Lisa', 'Donald', 'Nancy', 'Steven', 'Karen', 'Edward', 'Betty', 'Brian', 'Helen',
        'Ronald', 'Sandra', 'Anthony', 'Donna', 'Kevin', 'Carol', 'Jason', 'Ruth', 'Matthew', 'Sharon'
      ];
      
      const lastNames = [
        'Johnson', 'Brown', 'Wilson', 'Davis', 'Taylor', 'Martin', 'Garcia', 'Rodriguez', 'Lewis', 'Walker',
        'Hall', 'Allen', 'Young', 'King', 'Wright', 'Green', 'Baker', 'Nelson', 'Carter', 'Mitchell',
        'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart',
        'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera',
        'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James'
      ];

      // Document templates with varied expiry ranges
      const documentTemplates = [
        { name: 'DBS Certificate', category: 'Background Checks' },
        { name: 'First Aid Certificate', category: 'Training' },
        { name: 'Care Certificate', category: 'Training' },
        { name: 'Moving & Handling', category: 'Training' },
        { name: 'Safeguarding Adults', category: 'Training' },
        { name: 'Medication Training', category: 'Training' },
        { name: 'Food Hygiene Certificate', category: 'Training' },
        { name: 'Right to Work', category: 'Legal' },
        { name: 'Public Liability Insurance', category: 'Insurance' }
      ];

      // Generate expiry date ranges (in days from today)
      const getRandomExpiryDays = () => {
        const ranges = [
          // Expired documents (20% chance)
          { min: -180, max: -1, weight: 0.2 },
          // Expiring soon - amber (25% chance)
          { min: 1, max: 59, weight: 0.25 },
          // Valid - green (55% chance)
          { min: 60, max: 730, weight: 0.55 }
        ];
        
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (const range of ranges) {
          cumulativeWeight += range.weight;
          if (random <= cumulativeWeight) {
            return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          }
        }
        
        // Fallback to valid range
        return Math.floor(Math.random() * 670) + 60;
      };

      const getDocumentStatus = (expiryDays: number) => {
        if (expiryDays < 0) {
          return Math.random() < 0.8 ? 'expired' : 'rejected';
        } else if (expiryDays < 30) {
          return Math.random() < 0.7 ? 'pending' : 'approved';
        } else {
          return 'approved';
        }
      };
      
      // Generate the requested number of carers
      const testCarers = [];
      for (let i = 0; i < carerCount; i++) {
        const carerNumber = i + 1;
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        console.log(`Generating carer ${carerNumber}:`, firstName, lastName);
        
        // Generate 3-6 random documents per carer
        const numDocuments = Math.floor(Math.random() * 4) + 3; // 3-6 documents
        const shuffledTemplates = [...documentTemplates].sort(() => Math.random() - 0.5);
        const carerDocuments = shuffledTemplates.slice(0, numDocuments);
        
        const documents = carerDocuments.map((docTemplate, docIndex) => {
          const expiryDays = getRandomExpiryDays();
          const status = getDocumentStatus(expiryDays);
          const today = new Date();
          const expiryDate = new Date(today.getTime() + expiryDays * 24 * 60 * 60 * 1000);
          const issuedDate = new Date(today.getTime() - Math.floor(Math.random() * 90 + 30) * 24 * 60 * 60 * 1000); // 30-120 days ago
          
          return {
            id: `doc-${carerNumber}-${docIndex + 1}`,
            carer_id: `test-carer-${carerNumber}`,
            template_id: `template-${docIndex + 1}`,
            status: status,
            file_path: `documents/carer-${carerNumber}/${docTemplate.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
            file_name: `${docTemplate.name.replace(/\s+/g, '_')}_${firstName}_${lastName}.pdf`,
            file_size: Math.floor(Math.random() * 5000000) + 500000, // 0.5-5.5MB
            mime_type: Math.random() < 0.8 ? 'application/pdf' : 'image/jpeg',
            issued_on: issuedDate.toISOString().split('T')[0],
            expires_on: expiryDate.toISOString().split('T')[0],
            verified_at: status === 'approved' ? new Date().toISOString() : null,
            notes: status === 'rejected' ? 'Document quality insufficient, please resubmit' : null,
            metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            template: {
              id: `template-${docIndex + 1}`,
              name: docTemplate.name,
              category: docTemplate.category,
              description: `${docTemplate.name} for compliance`,
              is_required: true,
              validity_days: 365,
              version: 1,
              is_active: true,
              metadata: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          };
        });
        
        // Calculate carer status based on documents
        let carerStatus: 'green' | 'amber' | 'red' = 'green';
        const hasExpired = documents.some(doc => {
          const expiryDays = Math.floor((new Date(doc.expires_on).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return expiryDays < 0 || doc.status === 'expired' || doc.status === 'rejected';
        });
        const hasExpiringSoon = documents.some(doc => {
          const expiryDays = Math.floor((new Date(doc.expires_on).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return expiryDays >= 0 && expiryDays < 60 && doc.status !== 'expired' && doc.status !== 'rejected';
        });
        
        if (hasExpired) {
          carerStatus = 'red';
        } else if (hasExpiringSoon) {
          carerStatus = 'amber';
        }

        const carer = {
          id: `test-carer-${carerNumber}`,
          agency_id: 'test-agency-1',
          first_name: firstName,
          last_name: lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${carerNumber}@example.com`,
          phone: `071${Math.floor(Math.random() * 90000000) + 10000000}`,
          employee_id: `EMP${carerNumber.toString().padStart(3, '0')}`,
          status: carerStatus,
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          documents: documents
        };
        
        console.log(`Carer ${carerNumber} (${firstName} ${lastName}) - Status: ${carerStatus} - Documents: ${carer.documents.length}`);
        testCarers.push(carer);
      }

      // Store test data in localStorage for now (until database is connected)
      console.log('Storing test data with', testCarers.length, 'carers');
      localStorage.setItem('fellowCarerTestData', JSON.stringify({
        carers: testCarers,
        agency: {
          id: 'test-agency-1',
          name: 'Demo Care Agency',
          created_at: new Date().toISOString()
        }
      }));

      setHasTestData(true);
      setMessage({ type: 'success', text: `Successfully generated ${testCarers.length} test carers with sample documents!` });
      
      // Force refresh of other components
      window.dispatchEvent(new CustomEvent('testDataChanged'));
      console.log('Dispatched testDataChanged event');
      onDataChange?.();

    } catch (error) {
      console.error('Error generating test data:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to generate test data: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTestData = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const testData = localStorage.getItem('fellowCarerTestData');
      if (!testData) {
        setMessage({ type: 'error', text: 'No test data found to delete.' });
        setLoading(false);
        return;
      }

      localStorage.removeItem('fellowCarerTestData');
      setHasTestData(false);
      setMessage({ type: 'success', text: 'Test data cleared! Generate new data to continue.' });
      
      // Force refresh of other components
      window.dispatchEvent(new CustomEvent('testDataChanged'));
      onDataChange?.();

    } catch (error) {
      console.error('Error deleting test data:', error);
      setMessage({ type: 'error', text: 'Failed to delete test data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Test Data Generator
        </CardTitle>
        <CardDescription>
          Generate sample carers and documents to explore Fellow Carer's features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSuperAdmin && (
          <div className="space-y-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-orange-800">Super Admin Settings</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="carer-count" className="text-sm text-orange-700">
                Number of test carers to generate
              </Label>
              <Input
                id="carer-count"
                type="number"
                min="1"
                max="1000"
                value={carerCount}
                onChange={(e) => setCarerCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-32 bg-white border-orange-300 focus:border-orange-500"
              />
              <p className="text-xs text-orange-600">
                Recommended: 50 carers for comprehensive testing
              </p>
            </div>
          </div>
        )}

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          {!hasTestData ? (
            <Button 
              onClick={generateTestData}
              disabled={loading}
              className="bg-black text-white hover:bg-gray-800"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate Test Data
            </Button>
          ) : (
            <>
              <Button 
                onClick={generateTestData}
                disabled={loading}
                className="bg-black text-white hover:bg-gray-800"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Refresh Test Data
              </Button>
            <Button 
              onClick={deleteTestData}
              disabled={loading}
              variant="outline"
              className="bg-gray-100 text-black hover:bg-gray-200 border-gray-300"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Trash2 className="w-4 h-4 mr-2" />
                Clear Test Data
            </Button>
            </>
          )}
        </div>

        <div className="text-sm text-gray-600">
          {!hasTestData ? (
            <p>This will create {carerCount} sample carers with realistic document expiry dates - some expired, some expiring soon, and some valid for months ahead. Documents will have varied statuses and types. (Stored locally until database is connected)</p>
          ) : (
            <div className="space-y-2">
              <p>Test data is currently loaded. You can refresh to regenerate with new data or clear it completely.</p>
              <p className="text-xs text-gray-500">Only test data will be affected - your real data is safe.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}