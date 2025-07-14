
import React from 'react';
import { useAdminProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';

interface EditableProductsListProps {
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
}

export function EditableProductsList({ onEdit, onDelete }: EditableProductsListProps) {
  const { data: products, isLoading, error } = useAdminProducts({ includeBrand: true, includeCategory: true });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
          <h3 className="text-lg font-semibold">Error Loading Products</h3>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!products || products.length === 0) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>All Products</CardTitle>
                  <CardDescription>No products found.</CardDescription>
              </CardHeader>
          </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Products</CardTitle>
        <CardDescription>Manage all products in the catalog.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.brands?.brand_name || 'N/A'}</TableCell>
                <TableCell>{product.categories?.name || 'N/A'}</TableCell>
                <TableCell>
                    <Badge variant={product.status === 'approved' ? 'default' : 'secondary'}>
                        {product.status}
                    </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(product.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
