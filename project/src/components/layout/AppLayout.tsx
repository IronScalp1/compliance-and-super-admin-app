import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ImpersonationBanner } from './ImpersonationBanner';
import { Loader2 } from 'lucide-react';

export function AppLayout() {
  const { user, currentAgency, loading, impersonation } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading Fellow Carer...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Super admins go to super admin panel
  if (user.is_super_admin && !impersonation.is_impersonating) {
    if (location.pathname.startsWith('/app') && !location.pathname.startsWith('/super')) {
      return <Navigate to="/super" replace />;
    }
  }

  // Regular users need an agency
  // Allow users without agencies to access the app (they can create one later)
  // if (!user.is_super_admin && !currentAgency && !impersonation.is_impersonating) {
  //   return <Navigate to="/onboarding" replace />;
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {impersonation.is_impersonating && <ImpersonationBanner />}
      
      <div className="flex h-screen pt-0">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto">
            <div className="w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}