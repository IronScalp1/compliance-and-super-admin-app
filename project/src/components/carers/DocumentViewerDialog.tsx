import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StorageService } from '@/lib/storage';
import { ComplianceEngine } from '@/lib/compliance';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  Calendar, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DocumentViewerDialogProps {
  document: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentDeleted?: () => void;
  onDocumentUploaded?: () => void;
}

export function DocumentViewerDialog({ 
  document, 
  open, 
  onOpenChange, 
  onDocumentDeleted,
  onDocumentUploaded 
}: DocumentViewerDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [pdfScale, setPdfScale] = useState(1.0);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfRotation, setPdfRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!document) return null;

  console.log('DocumentViewerDialog render:', { document: document?.id, open });

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    // Set both dates to midnight to avoid time zone issues
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatExpiryInfo = (expiryDate: string) => {
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    
    if (daysUntilExpiry < 0) {
      return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    } else if (daysUntilExpiry === 0) {
      return 'Expires today';
    } else if (daysUntilExpiry < 60) {
      return `Expires in ${daysUntilExpiry} days`;
    } else {
      return `Valid for ${daysUntilExpiry} days`;
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Validate file
      const validation = StorageService.validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        setUploading(false);
        return;
      }

      // Simulate upload progress for demo
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      // For demo purposes, simulate successful upload
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Update test data
        const testData = localStorage.getItem('fellowCarerTestData');
        if (testData) {
          const parsedData = JSON.parse(testData);
          
          // Find and update the document
          parsedData.carers.forEach((carer: any) => {
            const docIndex = carer.documents?.findIndex((d: any) => d.id === document.id);
            if (docIndex !== -1) {
              carer.documents[docIndex] = {
                ...carer.documents[docIndex],
                file_name: file.name,
                file_size: file.size,
                mime_type: file.type,
                expires_on: newExpiryDate || carer.documents[docIndex].expires_on,
                status: 'pending',
                updated_at: new Date().toISOString()
              };
              
              // Recalculate carer status based on updated documents
              const updatedCarer = parsedData.carers.find((c: any) => c.id === carer.id);
              if (updatedCarer) {
                updatedCarer.status = ComplianceEngine.calculateCarerStatus(updatedCarer, updatedCarer.documents || []);
              }
            }
          });
          
          localStorage.setItem('fellowCarerTestData', JSON.stringify(parsedData));
          window.dispatchEvent(new CustomEvent('testDataChanged'));
        }

        setSuccess(`Successfully uploaded ${file.name}`);
        setUploading(false);
        onDocumentUploaded?.();
        
        // Close dialog after success
        setTimeout(() => {
          onOpenChange(false);
        }, 1500);
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document. Please try again.');
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      // Update test data
      const testData = localStorage.getItem('fellowCarerTestData');
      if (testData) {
        const parsedData = JSON.parse(testData);
        
        // Remove the document
        parsedData.carers.forEach((carer: any) => {
          if (carer.documents) {
            carer.documents = carer.documents.filter((d: any) => d.id !== document.id);
            
            // Recalculate carer status after document deletion
            carer.status = ComplianceEngine.calculateCarerStatus(carer, carer.documents || []);
          }
        });
        
        localStorage.setItem('fellowCarerTestData', JSON.stringify(parsedData));
        window.dispatchEvent(new CustomEvent('testDataChanged'));
      }

      setSuccess('Document deleted successfully');
      onDocumentDeleted?.();
      
      // Close dialog after success
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);

    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete document. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    // For demo purposes, show a message
    setSuccess('Download would start in a real implementation');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleZoomIn = () => {
    setPdfScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setPdfScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setPdfRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePrevPage = () => {
    setPdfPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPdfPage(prev => prev + 1);
  };

  const isPdf = document.mime_type === 'application/pdf';
  const isImage = document.mime_type?.startsWith('image/');

  console.log('Document type check:', { isPdf, isImage, mimeType: document.mime_type });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-4xl max-h-[90vh]'} overflow-hidden`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Viewer
            {isFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullscreen}
                className="ml-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            View, replace, or delete this compliance document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Document Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {document.template?.name || document.template_name || 'Unknown Document'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {document.file_name}
                </p>
              </div>
              <Badge 
                variant="secondary" 
                className={getStatusColor(document.status)}
              >
                {document.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">File Size:</span>
                <p className="text-gray-900">
                  {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : 'Unknown'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">File Type:</span>
                <p className="text-gray-900">{document.mime_type || 'Unknown'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Issued:</span>
                <p className="text-gray-900">
                  {new Date(document.issued_on).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Expires:</span>
                <p className={`font-medium ${
                  getDaysUntilExpiry(document.expires_on) < 0 ? 'text-red-600' :
                  getDaysUntilExpiry(document.expires_on) <= 30 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {new Date(document.expires_on).toLocaleDateString()}
                  <span className="block text-xs">
                    {formatExpiryInfo(document.expires_on)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Document Viewer Controls - Only show for demo */}
          <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPdf && (
                <>
                  <Button variant="outline" size="sm" onClick={handlePrevPage}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium px-2">
                    Page {pdfPage}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleNextPage}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300 mx-2" />
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                {Math.round(pdfScale * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleFullscreen}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Document Preview */}
          <div className="border rounded-lg overflow-hidden h-80">
            {isPdf ? (
              /* PDF Viewer */
              <div className="h-full bg-gray-100 relative">
                {/* PDF Canvas/Viewer Area */}
                <div 
                  className="h-full flex items-center justify-center bg-white border-2 border-dashed border-gray-300"
                  style={{
                    transform: `scale(${pdfScale}) rotate(${pdfRotation}deg)`,
                    transformOrigin: 'center center'
                  }}
                >
                  <div className="text-center p-8 max-w-md">
                    <div className="w-16 h-20 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-red-600" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      PDF Document
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {document.file_name}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800 mb-1">
                          📄 <strong>PDF Viewer</strong>
                        </p>
                        <p className="text-xs text-blue-700">
                          Page {pdfPage} • {Math.round(pdfScale * 100)}% zoom • {pdfRotation}° rotation
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                          Use the controls above to navigate, zoom, and rotate this PDF document.
                        </p>
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>• Use page controls to navigate</p>
                        <p>• Zoom in/out with + and - buttons</p>
                        <p>• Rotate document with rotation button</p>
                        <p>• Download for full PDF viewing</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* PDF Status Overlay */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  Page {pdfPage} • {Math.round(pdfScale * 100)}%
                </div>
              </div>
            ) : (
              /* Non-PDF Document Viewer */
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 max-w-md">
                  <div className="mb-6">
                    {isImage ? (
                      <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-gray-600" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {document.template?.name || document.template_name || 'Document'}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {document.file_name}
                  </p>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                      {isImage ? 'Image Document' : 'Document File'}
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800 mb-2">
                        📋 <strong>Demo Mode</strong>
                      </p>
                      <p className="text-xs text-blue-700">
                        Document preview will be available when connected to Supabase Storage. 
                        For now, you can upload, replace, and manage document metadata.
                      </p>
                    </div>
                    
                    <Button variant="outline" onClick={handleDownload} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Document
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
            </div>
          </div>

          {/* Upload New Version */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Replace Document</h4>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="expiry-date">New Expiry Date (optional)</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleFileSelect}
                  disabled={uploading}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose New File
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting || uploading}
                >
                  {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                Supported formats: PDF, PNG, JPG (max 10MB)
              </p>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}