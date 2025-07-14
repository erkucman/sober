
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Star, MessageSquare, BarChart } from 'lucide-react';
import { useProductsByBrand } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { useBrandStats } from '@/hooks/useBrandStats';

interface DashboardOverviewProps {
  brandId: string;
}

export function DashboardOverview({ brandId }: DashboardOverviewProps) {
  const { data: products, isLoading: isLoadingProducts } = useProductsByBrand(brandId);
  const { data: stats, isLoading: isLoadingStats } = useBrandStats(brandId);

  const productCount = products?.length || 0;
  const pendingCount = products?.filter(p => p.status === 'pending').length || 0;
  
  const isLoading = isLoadingProducts || isLoadingStats;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-1/2" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-semibold">At a Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{productCount}</div>
                <p className="text-xs text-muted-foreground">{pendingCount} pending approval</p>
            </CardContent>
            </Card>
            
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.averageRating ?? 0}</div>
                <p className="text-xs text-muted-foreground">Based on {stats?.totalReviews ?? 0} reviews</p>
            </CardContent>
            </Card>

            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.totalReviews ?? 0}</div>
                <p className="text-xs text-muted-foreground">Review management coming soon</p>
            </CardContent>
            </Card>

            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wishlists</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.wishlists ?? 0}</div>
                <p className="text-xs text-muted-foreground">Times products were wishlisted</p>
            </CardContent>
            </Card>
        </div>
    </div>
  );
}
