
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { BrandApplicationCard } from '../BrandApplicationCard';
import { ProductApplicationCard } from '../ProductApplicationCard';

interface PendingApplicationsProps {
  pendingBrands: any[];
  pendingProducts: any[];
  pendingBrandsError: any;
  pendingProductsError: any;
  onRefreshBrands: () => void;
  onRefreshProducts: () => void;
}

export function PendingApplications({
  pendingBrands,
  pendingProducts,
  pendingBrandsError,
  pendingProductsError,
  onRefreshBrands,
  onRefreshProducts
}: PendingApplicationsProps) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold mb-2">Brand Applications</h2>
        <p className="text-sm text-muted-foreground mb-4">Review and approve or reject new brand submissions.</p>
        <div className="grid gap-6">
          {pendingBrandsError ? (
            <Card>
              <CardContent className="text-center py-12">
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Failed to load pending applications</p>
                <Button onClick={onRefreshBrands} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : pendingBrands.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">All caught up!</p>
                <p className="text-muted-foreground">No pending brand applications at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            pendingBrands.map((brand) => (
              <BrandApplicationCard
                key={brand.id}
                application={brand}
              />
            ))
          )}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Product Submissions</h2>
        <p className="text-sm text-muted-foreground mb-4">Review and approve or reject new product submissions.</p>
        <div className="grid gap-6">
          {pendingProductsError ? (
            <Card>
              <CardContent className="text-center py-12">
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Failed to load pending products</p>
                <Button onClick={onRefreshProducts} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : pendingProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">All caught up!</p>
                <p className="text-muted-foreground">No pending products at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            pendingProducts.map((product) => (
              <ProductApplicationCard
                key={product.id}
                application={product as any}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
