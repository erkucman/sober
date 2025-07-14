import React from 'react';
import { useAuth } from '@/contexts/auth/context';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { BrandDashboard } from '@/components/dashboard/BrandDashboard';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Index = () => {
  const { userRole, user, loading } = useAuth();

  console.log('📄 Index page rendering:', { userRole, hasUser: !!user, loading });

  const renderDashboard = () => {
    console.log('🎯 Rendering dashboard for role:', userRole);
    
    switch (userRole) {
      case 'admin':
        console.log('👑 Rendering AdminDashboard');
        return (
          <ErrorBoundary fallback={<div className="p-6 text-center text-red-600">Admin Dashboard failed to load</div>}>
            <AdminDashboard />
          </ErrorBoundary>
        );
      case 'brand':
        console.log('🏢 Rendering BrandDashboard');
        return (
          <ErrorBoundary fallback={<div className="p-6 text-center text-red-600">Brand Dashboard failed to load</div>}>
            <BrandDashboard />
          </ErrorBoundary>
        );
      case 'end_user':
        console.log('👤 Rendering UserDashboard');
        return (
          <ErrorBoundary fallback={<div className="p-6 text-center text-red-600">User Dashboard failed to load</div>}>
            <UserDashboard />
          </ErrorBoundary>
        );
      default:
        console.log('❓ Unknown role, defaulting to UserDashboard');
        return (
          <ErrorBoundary fallback={<div className="p-6 text-center text-red-600">User Dashboard failed to load</div>}>
            <UserDashboard />
          </ErrorBoundary>
        );
    }
  };

  return renderDashboard();
};

export default Index;
