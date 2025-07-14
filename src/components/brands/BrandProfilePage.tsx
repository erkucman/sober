import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Calendar, Package } from 'lucide-react';
import { useProductsByBrand } from '@/hooks/useProducts';
import { BrandBlogSection } from './BrandBlogSection';
import { getCurrencySymbol } from '@/lib/utils';

export function BrandProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: brand, isLoading } = useQuery({
    queryKey: ['brand', id],
    queryFn: async () => {
      if (!id) throw new Error('Brand ID is required');
      
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: brandProducts = [] } = useProductsByBrand(id!);
  const products = brandProducts.filter((p) => p.status === 'approved');

  if (isLoading) {
    return <div className="p-6">Loading brand profile...</div>;
  }

  if (!brand) {
    return <div className="p-6">Brand not found or not approved</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Brand Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{brand.brand_name}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                {brand.website_url && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={brand.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Since {new Date(brand.created_at).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {brand.logo_url && (
                <img src={brand.logo_url} alt="Brand Logo" className="w-20 h-20 object-contain rounded-full border" />
              )}
              <Badge variant="default">Approved</Badge>
            </div>
          </div>
        </CardHeader>
        {brand.description && (
          <CardContent>
            <p className="text-muted-foreground">{brand.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Products Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <CardTitle>Products ({products.length})</CardTitle>
          </div>
          <CardDescription>Products from this brand</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No products available from this brand yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id}>
                  <Card className="border h-full hover:bg-gray-50 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {product.price && (
                        <p className="text-lg font-semibold text-orange-600">
                          {getCurrencySymbol(product.currency || 'USD')} {product.price}
                        </p>
                      )}
                    </CardHeader>
                    {product.description && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {product.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <BrandBlogSection brandId={brand.id} />
    </div>
  );
}
