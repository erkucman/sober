
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { ProductImageUploader } from './ProductImageUploader';
import { ProductFormInputs } from './product-form/ProductFormInputs';
import { AromaticProfileInput } from './product-form/AromaticProfileInput';
import { ProductAwardsInput } from './product-form/ProductAwardsInput';
import { FoodPairingInput } from './product-form/FoodPairingInput';
import { EnhancedProductFormHeader } from './enhanced-product-form/EnhancedProductFormHeader';
import { EnhancedProductFormActions } from './enhanced-product-form/EnhancedProductFormActions';
import { useProductForm } from '@/hooks/useProductForm';

interface EnhancedProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isAdmin?: boolean;
  productToEdit?: any;
}

export function EnhancedProductForm({ onSuccess, onCancel, isAdmin = false, productToEdit }: EnhancedProductFormProps) {
  const {
    form,
    loading,
    handleSubmit,
    imagePreviews,
    handleImageDrop,
    handleImageRemove,
  } = useProductForm({
    productToEdit,
    isAdmin,
    onSuccess,
  });

  const isEditing = !!productToEdit;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <EnhancedProductFormHeader isEditing={isEditing} />
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ProductImageUploader
              label="Product Images"
              previews={imagePreviews}
              onDrop={handleImageDrop}
              onRemove={handleImageRemove}
            />
            <ProductFormInputs form={form} isAdmin={isAdmin} />
            <AromaticProfileInput form={form} />
            <ProductAwardsInput form={form} />
            
            {isEditing && productToEdit?.id && (
              <FoodPairingInput productId={productToEdit.id} />
            )}

            <EnhancedProductFormActions 
              onCancel={onCancel}
              loading={loading}
              isEditing={isEditing}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
