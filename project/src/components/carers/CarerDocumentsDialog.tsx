import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ComplianceEngine } from '@/lib/compliance';
import { FileText, Calendar, User, Download, Eye, ChevronDown, ChevronRight, AlertTriangle, Clock } from 'lucide-react';
import type { Carer, CarerDocument } from '@/types';

interface CarerDocumentsDialogProps {
  carer: Carer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentChange?: () => void;
  onViewDocument?: (document: any) => void;
}

export function CarerDocumentsDialog({ carer, open, onOpenChange, onDocumentChange, onViewDocument }: CarerDocumentsDialogProps) {
  if (!carer) return null;
  const [expandedCarers, setExpandedCarers] = React.useState<Set<string>>(new Set());

  const documents = carer.documents || [];
  
  console.log('CarerDocumentsDialog - Carer:', carer.first_name, carer.last_name);
  console.log('CarerDocumentsDialog - Documents:', documents.length, documents);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  // Sort documents by urgency (most urgent first)
  const sortDocumentsByUrgency = (docs: any[]) => {
    return [...docs].sort((a, b) => {
      const aDays = getDaysUntilExpiry(a.expires_on);
      const bDays = getDaysUntilExpiry(b.expires_on);
      
      // Expired documents first (negative days)
      if (aDays < 0 && bDays >= 0) return -1;
      if (bDays < 0 && aDays >= 0) return 1;
      
      // Among expired, most recently expired first
      if (aDays < 0 && bDays < 0) return bDays - aDays;
      
      // Among non-expired, soonest expiry first
      return aDays - bDays;
    });
  };

  const getUrgencyIcon = (expiryDate: string) => {
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    
    if (daysUntilExpiry < 0) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    } else if (daysUntilExpiry < 60) {
      return <Clock className="w-4 h-4 text-yellow-600" />;
    } else {
      return <FileText className="w-4 h-4 text-green-600" />;
    }
  };

  const toggleExpanded = (carerId: string) => {
    const newExpanded = new Set(expandedCarers);
    if (newExpanded.has(carerId)) {
      newExpanded.delete(carerId);
    } else {
      newExpanded.add(carerId);
    }
    setExpandedCarers(newExpanded);
  };

  const handleViewDocument = (document: any) => {
    console.log('Opening document viewer for:', document);
    console.log('onViewDocument callback:', typeof onViewDocument);
    onViewDocument?.(document);
  };

  const handleDownloadDocument = (document: any) => {
    console.log('Downloading document:', document);
    alert(`Download would start for: ${document.file_name}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Documents - {carer.first_name} {carer.last_name}
          </DialogTitle>
          <DialogDescription>
            View and manage compliance documents for this carer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          {/* Carer Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Employee ID:</span>
                <p className="text-gray-900">{carer.employee_id || '—'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p className="text-gray-900">{carer.email || '—'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phone:</span>
                <p className="text-gray-900">{carer.phone || '—'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <Badge 
                  variant="secondary" 
                  className={ComplianceEngine.getStatusColor(carer.status)}
                >
                  {ComplianceEngine.getStatusIcon(carer.status)} {carer.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Documents ({documents.length})
              {documents.length > 1 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (sorted by urgency)
                </span>
              )}
            </h3>
            
            {documents.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No documents uploaded</p>
                <p className="text-sm text-gray-500">
                  Upload compliance documents to improve this carer's status
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Upload Document
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {(() => {
                  const sortedDocs = sortDocumentsByUrgency(documents);
                  const isExpanded = expandedCarers.has(carer.id);
                  const visibleDocs = sortedDocs.slice(0, isExpanded ? sortedDocs.length : 1);
                  const hiddenCount = sortedDocs.length - 1;

                  return (
                    <>
                      {/* Show visible documents */}
                      {visibleDocs.map((doc: any, index: number) => (
                        <div key={doc.id} className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                          index === 0 ? 'border-l-4 border-l-blue-500' : ''
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getUrgencyIcon(doc.expires_on)}
                                <h4 className="font-medium text-gray-900">
                                  {doc.template?.name || doc.template_name || 'Unknown Document'}
                                </h4>
                                <Badge 
                                  variant="secondary" 
                                  className={getStatusColor(doc.status)}
                                >
                                  {doc.status}
                                </Badge>
                                {index === 0 && hiddenCount > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    Most Urgent
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">
                                {doc.file_name}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Expires: {new Date(doc.expires_on).toLocaleDateString()}</span>
                                </div>
                                <div className={`font-medium ${
                                  getDaysUntilExpiry(doc.expires_on) < 0 ? 'text-red-600' :
                                  getDaysUntilExpiry(doc.expires_on) <= 30 ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                  {formatExpiryInfo(doc.expires_on)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <Button variant="ghost" size="sm" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Collapsible section for additional documents */}
                      {hiddenCount > 0 && (
                        <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(carer.id)}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start p-3 h-auto border border-dashed bg-white text-gray-600 hover:bg-gray-50">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 mr-2 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                              )}
                              <span className="text-sm">
                                {isExpanded ? 'Hide' : 'Show'} {hiddenCount} more document{hiddenCount !== 1 ? 's' : ''}
                              </span>
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-2">
                            {sortedDocs.slice(1).map((doc: any, index: number) => (
                              <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      {getUrgencyIcon(doc.expires_on)}
                                      <h4 className="font-medium text-gray-900">
                                        {doc.template?.name || doc.template_name || 'Unknown Document'}
                                      </h4>
                                      <Badge 
                                        variant="secondary" 
                                        className={getStatusColor(doc.status)}
                                        onClick={() => handleViewDocument(doc)}
                                      >
                                        {doc.status}
                                      </Badge>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mb-2">
                                      {doc.file_name}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>Expires: {new Date(doc.expires_on).toLocaleDateString()}</span>
                                      </div>
                                      <div className={`font-medium ${
                                        getDaysUntilExpiry(doc.expires_on) < 0 ? 'text-red-600' :
                                        getDaysUntilExpiry(doc.expires_on) <= 30 ? 'text-yellow-600' :
                                        'text-green-600'
                                      }`}>
                                        {formatExpiryInfo(doc.expires_on)}
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                                        onClick={() => handleViewDocument(doc)}
                                        onClick={() => handleDownloadDocument(doc)}
                                      >
                                        <Download className="w-3 h-3 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 ml-4">
                                        onClick={() => handleDownloadDocument(doc)}
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                                      onClick={() => handleViewDocument(doc)}
                                      onClick={() => handleViewDocument(doc)}
                                    >
                                     View
                                      View
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                                      onClick={() => handleDownloadDocument(doc)}
                                    >
                                      <Download className="w-3 h-3 mr-1" />
                                      Download
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                                      onClick={() => handleDownloadDocument(doc)}
                                    >
                                      <Download className="w-4 h-4 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}