
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from './ProductCard';

export const FeaturedProducts = () => {
  const { data: products } = useProducts();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Featured Products</CardTitle>
        <CardDescription>Discover trending and highly-rated products</CardDescription>
      </CardHeader>
      <CardContent>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 3).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No featured products available right now.</p>
        )}
      </CardContent>
    </Card>
  );
};
