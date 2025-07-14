
import React from 'react';
import { useAdminProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';

interface AllProductsListProps {
  onEdit: (productId: string) => void;
  searchTerm?: string;
  brandFilter?: string;
  categoryFilter?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function AllProductsList({ 
  onEdit, 
  searchTerm = '', 
  brandFilter = '', 
  categoryFilter = '', 
  sortBy = 'created_at', 
  sortOrder = 'desc' 
}: AllProductsListProps) {
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
    );
  }

  // Filter and sort products
  let filteredProducts = products.filter((product: any) => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = brandFilter === '' || product.brand_id === brandFilter;
    
    const matchesCategory = categoryFilter === '' || product.category_id === categoryFilter;
    
    return matchesSearch && matchesBrand && matchesCategory;
  });

  // Sort products
  filteredProducts.sort((a: any, b: any) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'created_at':
      default:
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Products</CardTitle>
        <CardDescription>
          Showing {filteredProducts.length} of {products.length} products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.brands?.brand_name || 'N/A'}</TableCell>
                <TableCell>{product.categories?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={product.status === 'approved' ? 'default' : 'secondary'}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(product.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(product.id)}>
                    <Pencil className="h-4 w-4" />
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
