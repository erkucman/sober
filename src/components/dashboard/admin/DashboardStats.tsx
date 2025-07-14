
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Building2, FolderOpen } from 'lucide-react';

interface DashboardStatsProps {
  brandsCount: number;
  categoriesCount: number;
  brandsError: boolean;
  categoriesError: boolean;
}

export function DashboardStats({ brandsCount, categoriesCount, brandsError, categoriesError }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground">Product count not available</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Brands</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {brandsError ? '-' : brandsCount}
          </div>
          <p className="text-xs text-muted-foreground">
            {brandsError ? 'Failed to load' : 'Brands loaded'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {categoriesError ? '-' : categoriesCount}
          </div>
          <p className="text-xs text-muted-foreground">
            {categoriesError ? 'Failed to load' : 'Categories loaded'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
