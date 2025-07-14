
import { Outlet } from 'react-router-dom';
import { Navigation } from '@/components/layout/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const AppLayout = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
};
