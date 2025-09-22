import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, X, Eye } from 'lucide-react';

export function ImpersonationBanner() {
  const { impersonation, stopImpersonation } = useAuth();

  if (!impersonation.is_impersonating) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 rounded-none border-b">
      <Crown className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-orange-600" />
          <span className="text-orange-800 font-medium">
            Super Admin (Fellow Carer HQ) Mode: 
          </span>
          <span className="text-orange-700">
            Viewing as {impersonation.target_agency?.name}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => stopImpersonation()}
          className="text-orange-700 hover:text-orange-800 hover:bg-orange-100 -mr-2"
        >
          <X className="w-4 h-4 mr-1" />
          Exit
        </Button>
      </AlertDescription>
    </Alert>
  );
}