import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { CarersTable } from '@/components/carers/CarersTable';
import { CarerDocumentsDialog } from '@/components/carers/CarerDocumentsDialog';
import { EditCarerDialog } from '@/components/carers/EditCarerDialog';
import { DocumentViewerDialog } from '@/components/carers/DocumentViewerDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import type { Carer, CarerDocument } from '@/types';

export function Carers() {
  const { currentAgency } = useAuth();
  const [carers, setCarers] = useState<Carer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCarer, setSelectedCarer] = useState<Carer | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  console.log('Carers component mounted, currentAgency:', currentAgency);

  useEffect(() => {
    console.log('Carers useEffect triggered, currentAgency:', currentAgency);
    if (currentAgency) {
      loadCarers();
    } else {
      // If no current agency, show empty state
      console.log('No current agency, checking for test data...');
      loadCarers(); // Still try to load test data even without agency
      setLoading(false);
    }
    
    // Listen for test data changes
    const handleTestDataChange = () => {
      console.log('Test data changed, reloading carers...');
      loadCarers();
    };
    
    window.addEventListener('testDataChanged', handleTestDataChange);
    
    return () => {
      window.removeEventListener('testDataChanged', handleTestDataChange);
    };
  }, [currentAgency]);

  const loadCarers = async () => {
    console.log('loadCarers called');
    try {
      setLoading(true);
      setError(null);

      // Check for test data in localStorage first
      const testData = localStorage.getItem('fellowCarerTestData');
      console.log('Test data from localStorage:', testData ? 'Found' : 'Not found');
      if (testData) {
        const parsedData = JSON.parse(testData);
        console.log('Parsed test data:', parsedData);
        const carers = parsedData.carers || [];
        console.log('Loading test carers:', carers.length);
        setCarers(carers);
        setLoading(false);
        return;
      }

      // If no current agency, return empty data
      if (!currentAgency?.id) {
        console.log('No current agency, showing empty state');
        setCarers([]);
        setLoading(false);
        return;
      }

      console.log('Attempting to load from Supabase...');
      const { data, error: fetchError } = await supabase
        .from('carers')
        .select(`
          *,
          documents:carer_documents(
            *,
            template:document_templates(*)
          )
        `)
        .eq('agency_id', currentAgency?.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error loading carers:', fetchError);
        // Set empty data instead of throwing
        setCarers([]);
        setLoading(false);
        return;
      }

      console.log('Loaded carers from Supabase:', data?.length || 0);
      setCarers(data || []);
    } catch (err) {
      console.error('Error loading carers:', err);
      // Show empty state instead of error for now
      setCarers([]);
    } finally {
      console.log('loadCarers completed, carers count:', carers.length);
      setLoading(false);
    }
  };

  const handleViewDocuments = (carer: Carer) => {
    console.log('View documents for carer:', carer);
    console.log('Carer documents:', carer.documents?.length || 0, carer.documents);
    setSelectedCarer(carer);
    setDocumentsDialogOpen(true);
  };

  const handleEdit = (carer: Carer) => {
    console.log('Edit carer:', carer);
    setSelectedCarer(carer);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedCarer: Carer) => {
    console.log('Save edited carer:', updatedCarer);
    setCarers(prevCarers => 
      prevCarers.map(c => c.id === updatedCarer.id ? updatedCarer : c)
    );
  };

  const handleViewDocument = (document: any) => {
    console.log('View document:', document);
    setSelectedDocument(document);
    setDocumentViewerOpen(true);
  };

  const handleDocumentDeleted = () => {
    // Refresh carers data after document deletion
    loadCarers();
  };

  const handleDocumentUploaded = () => {
    // Refresh carers data after document upload
    loadCarers();
  };
  const handleDelete = async (carer: Carer) => {
    if (!confirm(`Are you sure you want to delete ${carer.first_name} ${carer.last_name}?`)) {
      return;
    }

    try {
      console.log('Deleting carer:', carer);
      
      // Handle test data deletion
      const testData = localStorage.getItem('fellowCarerTestData');
      if (testData) {
        const parsedData = JSON.parse(testData);
        parsedData.carers = parsedData.carers.filter((c: Carer) => c.id !== carer.id);
        localStorage.setItem('fellowCarerTestData', JSON.stringify(parsedData));
        
        // Update local state
        setCarers(carers.filter(c => c.id !== carer.id));
        
        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('testDataChanged'));
        return;
      }

      // Handle database deletion (when connected)
      const { error } = await supabase
        .from('carers')
        .delete()
        .eq('id', carer.id);

      if (error) throw error;
      setCarers(carers.filter(c => c.id !== carer.id));
    } catch (err) {
      console.error('Error deleting carer:', err);
      setError('Failed to delete carer');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
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
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Carers</h1>
        <p className="text-gray-600">
          Manage your care team and track their compliance status.
        </p>
      </div>

      <CarersTable 
        carers={carers}
        onViewDocuments={handleViewDocuments}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDocument={handleViewDocument}
      />

      <CarerDocumentsDialog
        carer={selectedCarer}
        open={documentsDialogOpen}
        onOpenChange={setDocumentsDialogOpen}
        onDocumentChange={loadCarers}
        onViewDocument={handleViewDocument}
        onViewDocument={handleViewDocument}
      />

      <EditCarerDialog
        carer={selectedCarer}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveEdit}
      />

      <DocumentViewerDialog
        document={selectedDocument}
        open={documentViewerOpen}
        onOpenChange={setDocumentViewerOpen}
        onDocumentDeleted={handleDocumentDeleted}
        onDocumentUploaded={handleDocumentUploaded}
      />
    </div>
  );
}