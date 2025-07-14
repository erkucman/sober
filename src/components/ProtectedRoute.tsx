import React from 'react';
import { useAuth } from '@/contexts/auth/context';
import { AuthForm } from '@/components/auth/AuthForm';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type UserRole = Database['public']['Enums']['user_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userRole, loading, error, authReady } = useAuth();

  console.log('🛡️ ProtectedRoute state:', { 
    hasUser: !!user, 
    userRole, 
    loading, 
    error,
    authReady,
    allowedRoles 
  });

  // Show loading only if auth is not ready and we're still loading
  if (!authReady && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-4" />
            <p className="text-lg font-medium text-gray-900">Loading...</p>
            <p className="text-sm text-gray-600 mt-2">Checking authentication status</p>
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>If this takes too long, try refreshing the page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">Authentication Error</CardTitle>
            </div>
            <CardDescription>
              There was a problem with authentication. You can try refreshing or continue with limited access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Refresh Page
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                Continue Anyway
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    console.log('🔒 No user found, rendering Auth Form');
    return <AuthForm />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    console.log('🚫 User role not allowed:', userRole, 'Required:', allowedRoles);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-800">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Your role:</strong> {userRole}</p>
              <p><strong>Required roles:</strong> {allowedRoles.join(', ')}</p>
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full mt-4"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('✅ ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
}
