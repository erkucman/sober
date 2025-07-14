
import React from 'react';
import { useBrands, useUpdateBrandFeaturedStatus } from '@/hooks/useBrands';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function BrandListManager() {
  const { data: brands, isLoading, isError } = useBrands();
  const { mutate: updateFeaturedStatus, isPending } = useUpdateBrandFeaturedStatus();
  
  const handleFeaturedChange = (brandId: string, is_featured: boolean) => {
    updateFeaturedStatus({ brandId, is_featured });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-500">Error loading brands.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Brands</CardTitle>
        <CardDescription>Feature or unfeature brands on the homepage.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand Name</TableHead>
              <TableHead className="text-right">Is Featured</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands?.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.brand_name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Switch
                      id={`featured-switch-${brand.id}`}
                      checked={brand.is_featured}
                      onCheckedChange={(checked) => handleFeaturedChange(brand.id, checked)}
                      disabled={isPending}
                      aria-label={`Feature toggle for ${brand.brand_name}`}
                    />
                    <Label htmlFor={`featured-switch-${brand.id}`}>Featured</Label>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
