import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Toaster } from '@/components/ui/toaster';

// Auth pages
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { AuthCallback } from '@/pages/auth/AuthCallback';

// Layout
import { AppLayout } from '@/components/layout/AppLayout';

// Public pages
import { Landing } from '@/pages/Landing';

// App pages
import { Dashboard } from '@/pages/app/Dashboard';
import { Carers } from '@/pages/app/Carers';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth/login" element={<LoginForm />} />
            <Route path="/auth/signup" element={<SignupForm />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected app routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="carers" element={<Carers />} />
              <Route path="documents" element={<div>Documents</div>} />
              <Route path="templates" element={<div>Templates</div>} />
              <Route path="reports" element={<div>Reports</div>} />
              <Route path="settings" element={<div>Settings</div>} />
              <Route path="billing" element={<div>Billing</div>} />
            </Route>

            {/* Super admin routes */}
            <Route path="/super" element={<AppLayout />}>
              <Route index element={<Navigate to="/super/agencies" replace />} />
              <Route path="agencies" element={<div>Super Admin Agencies</div>} />
              <Route path="subscriptions" element={<div>Subscriptions</div>} />
              <Route path="templates" element={<div>Global Templates</div>} />
              <Route path="audit" element={<div>Audit Logs</div>} />
              <Route path="health" element={<div>Health Dashboard</div>} />
            </Route>

            {/* Onboarding */}
            <Route path="/onboarding" element={<div>Onboarding</div>} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;