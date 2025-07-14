import React, { useState } from 'react';
import { useUserBrand } from '@/hooks/useBrands';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { BrandProfileEditor } from './brand/BrandProfileEditor';
import { ProductsManagement } from './brand/ProductsManagement';
import { DashboardOverview } from './brand/DashboardOverview';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalTrigger } from '@/components/ui/modal';
import { ProductForm } from '../forms/ProductForm';
import { BrandBlogManager } from './brand/BrandBlogManager';
import { ReviewsManager } from './brand/ReviewsManager';

export function BrandDashboard() {
  const { data: brand, isLoading, error } = useUserBrand();
  const [productModalOpen, setProductModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-5 w-2/5" />
        <div className="border-b">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="pt-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
       <div className="p-6">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Loading Brand Data</AlertTitle>
            <AlertDescription>
              There was a problem fetching your brand information. Please try refreshing the page.
            </AlertDescription>
          </Alert>
       </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">No Brand Found</h2>
        <p className="text-muted-foreground">Your account is not associated with a brand. Please create one or contact support.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-orange-800">{brand.brand_name} Dashboard</h1>
          <p className="text-muted-foreground">Manage your products and brand presence</p>
        </div>
        <Modal open={productModalOpen} onOpenChange={setProductModalOpen}>
            <ModalTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </ModalTrigger>
            <ModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <ModalHeader>
                <ModalTitle>Add New Product</ModalTitle>
              </ModalHeader>
              <ProductForm 
                onSuccess={() => setProductModalOpen(false)}
                onCancel={() => setProductModalOpen(false)}
                fixedBrand={{ id: brand.id, brand_name: brand.brand_name }}
              />
            </ModalContent>
          </Modal>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="profile">Brand Profile</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-6">
          <DashboardOverview brandId={brand.id} />
        </TabsContent>
        <TabsContent value="products" className="pt-6">
          <ProductsManagement brandId={brand.id} />
        </TabsContent>
        <TabsContent value="reviews" className="pt-6">
          <ReviewsManager brandId={brand.id} />
        </TabsContent>
        <TabsContent value="profile" className="pt-6">
          <BrandProfileEditor brand={brand} />
        </TabsContent>
        <TabsContent value="blog" className="pt-6">
          <BrandBlogManager brandId={brand.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
