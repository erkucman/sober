
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { usePendingBrands, useBrands } from '@/hooks/useBrands';
import { usePendingProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { usePropertyTypes } from '@/hooks/usePropertyTypes';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { ProductsTab } from './admin/ProductsTab';
import { BrandsTab } from './admin/BrandsTab';
import { FoodsTab } from './admin/FoodsTab';
import { DashboardHeader } from './admin/DashboardHeader';
import { DashboardStats } from './admin/DashboardStats';
import { SystemStatus } from './admin/SystemStatus';
import { ErrorAlert } from './admin/ErrorAlert';
import { OfflineAlert } from './admin/OfflineAlert';
import { PendingApplications } from './admin/PendingApplications';
import { AdminBlogManager } from './admin/AdminBlogManager';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { isOnline } = useNetworkStatus();
  
  const { data: pendingBrands = [], refetch: refetchPending, isLoading: loadingPendingBrands, error: pendingBrandsError } = usePendingBrands();
  const { data: pendingProducts = [], refetch: refetchPendingProducts, isLoading: loadingPendingProducts, error: pendingProductsError } = usePendingProducts();
  const { data: allBrands, error: brandsError, isLoading: loadingBrands, refetch: refetchBrands } = useBrands();
  const { data: categories, error: categoriesError, isLoading: loadingCategories, refetch: refetchCategories } = useCategories();
  const { data: propertyTypes, error: propertyTypesError, isLoading: loadingPropertyTypes, refetch: refetchPropertyTypes } = usePropertyTypes();

  // Debug output for development
  (window as any).DEBUG_DASHBOARD = {
    categories, categoriesError,
    allBrands, brandsError,
    propertyTypes, propertyTypesError,
    pendingBrands, pendingBrandsError,
    pendingProducts, pendingProductsError,
    isOnline
  };

  const handleRetryAll = () => {
    refetchPending();
    refetchPendingProducts();
    refetchBrands();
    refetchCategories();
    refetchPropertyTypes();
  };

  const anyLoading = loadingPendingBrands || loadingPendingProducts || loadingBrands || loadingCategories || loadingPropertyTypes;
  const anyError = pendingBrandsError || pendingProductsError || brandsError || categoriesError || propertyTypesError;

  // Show skeleton loader for initial load
  if (anyLoading && !allBrands && !categories && !propertyTypes) {
    return <DashboardSkeleton />;
  }

  // Show error state with recovery options
  if (anyError && !isOnline) {
    return (
      <div className="p-6 space-y-6">
        <DashboardHeader isOnline={isOnline} />
        <OfflineAlert />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader isOnline={isOnline} />

      {anyError && <ErrorAlert onRetry={handleRetryAll} />}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="foods">Foods</TabsTrigger>
          <TabsTrigger value="pending">
            Approvals {pendingBrands?.length + pendingProducts?.length > 0 && `(${pendingBrands.length + pendingProducts.length})`}
          </TabsTrigger>
          <TabsTrigger value="admin-blog">Admin Blog</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DashboardStats
            brandsCount={allBrands?.length ?? 0}
            categoriesCount={categories?.length ?? 0}
            brandsError={!!brandsError}
            categoriesError={!!categoriesError}
          />
          <SystemStatus isOnline={isOnline} hasErrors={!!anyError} />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductsTab />
        </TabsContent>

        <TabsContent value="brands" className="space-y-6">
          <BrandsTab />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Category</CardTitle>
              <CardDescription>Add a new product category</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="foods" className="space-y-6">
          <FoodsTab />
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <PendingApplications
            pendingBrands={pendingBrands}
            pendingProducts={pendingProducts}
            pendingBrandsError={pendingBrandsError}
            pendingProductsError={pendingProductsError}
            onRefreshBrands={refetchPending}
            onRefreshProducts={refetchPendingProducts}
          />
        </TabsContent>

        <TabsContent value="admin-blog" className="space-y-6">
          <AdminBlogManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
