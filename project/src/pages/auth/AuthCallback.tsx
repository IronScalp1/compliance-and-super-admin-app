import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          setSuccess(true);
          setLoading(false);
          
          // Redirect to app after a brief success message
          setTimeout(() => {
            navigate('/app');
          }, 2000);
        } else {
          setError('No session found. Please try signing in again.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img 
              src="/Fellow Carer Logo.png" 
              alt="Fellow Carer" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl text-[#0A0A0A]">
              {loading ? 'Confirming your account...' : success ? 'Welcome to Fellow Carer!' : 'Authentication Error'}
            </CardTitle>
            <CardDescription>
              {loading ? 'Please wait while we verify your email' : 
               success ? 'Your account has been confirmed successfully' :
               'There was a problem confirming your account'}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          {loading && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-gray-600">
                Verifying your email confirmation...
              </p>
            </div>
          )}

          {success && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Your email has been confirmed successfully!
                </p>
                <p className="text-xs text-gray-500">
                  Redirecting you to your dashboard...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  You can try:
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Going back to the <a href="/auth/login" className="text-primary hover:underline">login page</a></li>
                  <li>• Requesting a new confirmation email</li>
                  <li>• Contacting support if the problem persists</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}