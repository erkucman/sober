import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Wine, Scale } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserLists, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useUserLists';
import { useAuth } from '@/contexts/auth/context';
import { Loader2 } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { getCurrencySymbol } from '@/lib/utils';

interface ProductCardProps {
  product: any;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth();
  const { data: lists = [], isLoading: listsLoading } = useUserLists();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { compareList, addToCompare, removeFromCompare, isCompared, max } = useCompare();
  const compared = isCompared(product.id);
  const navigate = useNavigate();
  // Find the user's wishlist and check if this product is in it
  const wishlist = lists.find(l => l.name === 'Wishlist');
  const isWishlisted = !!wishlist && wishlist.product_ids?.includes(product.id);
  const loading = addToWishlist.isPending || removeFromWishlist.isPending;

  return (
    <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover rounded-lg" />
        ) : (
          <Wine className="h-12 w-12 text-gray-400" />
        )}
      </div>
      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
      <p className="text-sm text-muted-foreground mb-2">{product.brands?.brand_name || 'Unbranded'}</p>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {product.is_gluten_free && <Badge variant="outline">Gluten-Free</Badge>}
        {product.is_vegan && <Badge variant="outline">Vegan</Badge>}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold text-orange-800">{product.price ? `${getCurrencySymbol(product.currency || 'USD')} ${product.price}` : 'N/A'}</span>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading || listsLoading}
            onClick={() => {
              if (!user) return;
              if (isWishlisted) {
                removeFromWishlist.mutate(product.id);
              } else {
                addToWishlist.mutate(product.id);
              }
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className={`h-4 w-4`} stroke={isWishlisted ? '#dc2626' : 'currentColor'} fill={isWishlisted ? '#dc2626' : 'none'} />
            )}
          </Button>
          <Button
            variant={compared ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (compared) {
                removeFromCompare(product.id);
              } else if (compareList.length < max) {
                addToCompare(product);
                if (compareList.length + 1 >= 2) {
                  setTimeout(() => navigate('/compare'), 0);
                }
              }
            }}
            aria-label={compared ? 'Remove from compare' : 'Add to compare'}
          >
            <Scale className={`h-4 w-4 ${compared ? 'text-orange-600' : ''}`} />
          </Button>
          <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
            <Link to={`/product/${product.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
