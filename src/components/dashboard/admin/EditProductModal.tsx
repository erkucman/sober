
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedProductForm } from '@/components/forms/EnhancedProductForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface EditProductModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProductModal({ productId, isOpen, onClose }: EditProductModalProps) {
  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ['product-details', productId],
    queryFn: async () => {
      if (!productId) return null;
      
      console.log('Fetching product details for ID:', productId);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brands (*),
          categories (*),
          product_properties (
            property_type_id,
            value,
            property_types (name)
          ),
          product_awards (*)
        `)
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      console.log('Fetched product data:', data);
      return data;
    },
    enabled: !!productId && isOpen,
  });

  useEffect(() => {
    if (isOpen && productId) {
      refetch();
    }
  }, [isOpen, productId, refetch]);

  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-product-dialog-desc">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription id="edit-product-dialog-desc" className="sr-only">
            Edit the selected product details.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load product details. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {product && (
          <EnhancedProductForm
            productToEdit={product}
            onSuccess={handleSuccess}
            onCancel={onClose}
            isAdmin={true}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
