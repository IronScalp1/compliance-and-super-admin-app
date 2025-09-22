import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ComplianceEngine } from '@/lib/compliance';
import { Search, MoreHorizontal, Eye, Edit, Trash2, Plus, ChevronDown, ChevronRight, Calendar, FileText, AlertTriangle, Clock } from 'lucide-react';
import { Users } from 'lucide-react';
import type { Carer } from '@/types';

interface CarersTableProps {
  carers: Carer[];
  onViewDocuments?: (carer: Carer) => void;
  onEdit?: (carer: Carer) => void;
  onDelete?: (carer: Carer) => void;
  onViewDocument?: (document: any) => void;
}

export function CarersTable({ carers, onViewDocuments, onEdit, onDelete, onViewDocument }: CarersTableProps) {
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredCarers = carers.filter(carer =>
    `${carer.first_name} ${carer.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    carer.email?.toLowerCase().includes(search.toLowerCase()) ||
    carer.employee_id?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRowExpansion = (carerId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(carerId)) {
      newExpanded.delete(carerId);
    } else {
      newExpanded.add(carerId);
    }
    setExpandedRows(newExpanded);
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

  const getUrgencyIcon = (expiryDate: string) => {
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    
    if (daysUntilExpiry < 0) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    } else if (daysUntilExpiry <= 30) {
      return <Clock className="w-4 h-4 text-yellow-600" />;
    } else {
      return <FileText className="w-4 h-4 text-green-600" />;
    }
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

  const sortDocumentsByUrgency = (docs: any[]) => {
    const expired = [];
    const dueSoon = [];
    const compliant = [];
    
    // Group documents by status
    docs.forEach(doc => {
      const daysUntilExpiry = getDaysUntilExpiry(doc.expires_on);
      
      if (daysUntilExpiry < 0 || doc.status === 'expired' || doc.status === 'rejected') {
        expired.push(doc);
      } else if (daysUntilExpiry <= 30 || doc.status === 'pending') {
        dueSoon.push(doc);
      } else {
        compliant.push(doc);
      }
    });
    
    // Sort within each group
    expired.sort((a, b) => getDaysUntilExpiry(b.expires_on) - getDaysUntilExpiry(a.expires_on)); // Most recently expired first
    dueSoon.sort((a, b) => getDaysUntilExpiry(a.expires_on) - getDaysUntilExpiry(b.expires_on)); // Soonest expiry first
    compliant.sort((a, b) => getDaysUntilExpiry(a.expires_on) - getDaysUntilExpiry(b.expires_on)); // Soonest expiry first
    
    return [...expired, ...dueSoon, ...compliant];
  };

  const handleViewDocument = (document: any) => {
    onViewDocument?.(document);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search carers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild>
          <Link to="/app/carers/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Carer
          </Link>
        </Button>
      </div>

      {filteredCarers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No carers found</h3>
          <p className="text-gray-500 mb-4">
            Start building your Fellow Carer compliance record by adding your first care worker.
          </p>
          <Button asChild>
            <Link to="/app/carers/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Carer
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead className="min-w-[200px]">Name</TableHead>
                <TableHead className="min-w-[120px]">Employee ID</TableHead>
                <TableHead className="min-w-[250px]">Email</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Documents</TableHead>
                <TableHead className="text-right min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCarers.map((carer) => (
                <React.Fragment key={carer.id}>
                  <TableRow>
                    <TableCell className="w-8">
                      {(carer.documents?.length || 0) > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0 bg-white border-gray-200 hover:bg-gray-50"
                          onClick={() => toggleRowExpansion(carer.id)}
                        >
                          {expandedRows.has(carer.id) ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="font-medium min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 bg-transparent hover:bg-transparent border-0 shadow-none"
                            onClick={() => onEdit?.(carer)}
                            title="Edit carer details"
                          >
                            <Edit className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 bg-transparent hover:bg-transparent border-0 shadow-none"
                            onClick={() => onDelete?.(carer)}
                            title="Delete carer"
                          >
                            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                          </Button>
                        </div>
                        <span>{carer.first_name} {carer.last_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[120px]">{carer.employee_id || '—'}</TableCell>
                    <TableCell className="min-w-[250px]">{carer.email || '—'}</TableCell>
                    <TableCell className="min-w-[120px]">
                      <Badge 
                        variant="secondary" 
                        className={`${ComplianceEngine.getStatusColor(carer.status)} cursor-default pointer-events-none`}
                      >
                        {ComplianceEngine.getStatusIcon(carer.status)} {carer.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <span className="text-sm text-gray-600">
                        {carer.documents?.length || 0} files
                      </span>
                    </TableCell>
                    <TableCell className="text-right min-w-[100px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-8 w-8 p-0 bg-white border-gray-200 hover:bg-gray-50">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onViewDocuments?.(carer)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expandable Documents Row */}
                  {expandedRows.has(carer.id) && (carer.documents?.length || 0) > 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <div className="bg-gray-50 border-t">
                          <div className="p-4 space-y-3">
                            <h4 className="font-medium text-sm text-gray-700 mb-3">
                              Documents ({carer.documents?.length || 0}) - Grouped by status
                            </h4>
                            <div className="space-y-4">
                              {(() => {
                                const sortedDocs = sortDocumentsByUrgency(carer.documents || []);
                                const expired = sortedDocs.filter(doc => {
                                  const days = getDaysUntilExpiry(doc.expires_on);
                                  return days < 0 || doc.status === 'expired' || doc.status === 'rejected';
                                });
                                const dueSoon = sortedDocs.filter(doc => {
                                  const days = getDaysUntilExpiry(doc.expires_on);
                                  return days >= 0 && days < 60 && doc.status !== 'expired' && doc.status !== 'rejected';
                                });
                                const compliant = sortedDocs.filter(doc => {
                                  const days = getDaysUntilExpiry(doc.expires_on);
                                  return days >= 60 && doc.status !== 'expired' && doc.status !== 'rejected';
                                });
                                
                                return (
                                  <>
                                    {/* Expired Documents */}
                                    {expired.length > 0 && (
                                      <div className="space-y-2">
                                        <h5 className="text-xs font-semibold text-red-700 uppercase tracking-wide flex items-center gap-2">
                                          <AlertTriangle className="w-3 h-3" />
                                          Expired ({expired.length})
                                        </h5>
                                        {expired.map((doc: any) => (
                                          <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                              <AlertTriangle className="w-4 h-4 text-red-600" />
                                              <div className="flex-1 min-w-0">
                                                <div className="space-y-2">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                      <span className="font-medium text-sm text-gray-900">
                                                        {doc.template?.name || doc.template_name || 'Unknown Document'}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                      <Calendar className="w-3 h-3" />
                                                      <span>Expired: {new Date(doc.expires_on).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="font-medium text-red-600">
                                                      {(() => {
                                                        const days = getDaysUntilExpiry(doc.expires_on);
                                                        return `Expired ${Math.abs(days)} days ago`;
                                                      })()}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                                                onClick={() => handleViewDocument?.(doc)}
                                              >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* Due Soon Documents */}
                                    {dueSoon.length > 0 && (
                                      <div className="space-y-2">
                                        <h5 className="text-xs font-semibold text-yellow-700 uppercase tracking-wide flex items-center gap-2">
                                          <Clock className="w-3 h-3" />
                                          Due Soon ({dueSoon.length})
                                        </h5>
                                        {dueSoon.map((doc: any) => (
                                          <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors">
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                              <Clock className="w-4 h-4 text-yellow-600" />
                                              <div className="flex-1 min-w-0">
                                                <div className="space-y-2">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                      <span className="font-medium text-sm text-gray-900">
                                                        {doc.template?.name || doc.template_name || 'Unknown Document'}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                      <Calendar className="w-3 h-3" />
                                                      <span>Expires: {new Date(doc.expires_on).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="font-medium text-yellow-600">
                                                      {(() => {
                                                        const days = getDaysUntilExpiry(doc.expires_on);
                                                        if (days === 0) return 'Expires today';
                                                        return `Expires in ${days} days`;
                                                      })()}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                                                onClick={() => handleViewDocument?.(doc)}
                                              >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* Compliant Documents */}
                                    {compliant.length > 0 && (
                                      <div className="space-y-2">
                                        <h5 className="text-xs font-semibold text-green-700 uppercase tracking-wide flex items-center gap-2">
                                          <FileText className="w-3 h-3" />
                                          Compliant ({compliant.length})
                                        </h5>
                                        {compliant.map((doc: any) => (
                                          <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                              <FileText className="w-4 h-4 text-green-600" />
                                              <div className="flex-1 min-w-0">
                                                <div className="space-y-2">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                      <span className="font-medium text-sm text-gray-900">
                                                        {doc.template?.name || doc.template_name || 'Unknown Document'}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                      <Calendar className="w-3 h-3" />
                                                      <span>Expires: {new Date(doc.expires_on).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="font-medium text-green-600">
                                                      Valid for {getDaysUntilExpiry(doc.expires_on)} days
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                                                onClick={() => handleViewDocument?.(doc)}
                                              >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}