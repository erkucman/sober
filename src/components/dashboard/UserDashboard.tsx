
import React from 'react';
import { useUserStats } from '@/hooks/useUserStats';
import { useUserLists } from '@/hooks/useUserLists';
import { useProducts } from '@/hooks/useProducts';
import { PageSkeleton } from './user/PageSkeleton';
import { DashboardHeader } from './user/DashboardHeader';
import { DashboardStats } from './user/DashboardStats';
import { FeaturedProducts } from './user/FeaturedProducts';
import { UserLists } from './user/UserLists';

export function UserDashboard() {
  const { isLoading: isLoadingStats } = useUserStats();
  const { isLoading: isLoadingLists } = useUserLists();
  const { isLoading: isLoadingProducts } = useProducts();

  if (isLoadingStats || isLoadingLists || isLoadingProducts) {
    return <PageSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader />
      <DashboardStats />
      <FeaturedProducts />
      <UserLists />
    </div>
  );
}
