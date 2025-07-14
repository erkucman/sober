import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductImageUploader } from './ProductImageUploader';
import { ProductAwardsInput } from './product-form/ProductAwardsInput';
import { ProductFormInputs } from './product-form/ProductFormInputs';
import { AromaticProfileInput } from './product-form/AromaticProfileInput';
import { FoodPairingInput } from './product-form/FoodPairingInput';
import { useProductForm } from '@/hooks/useProductForm';
import { Form } from '@/components/ui/form';

interface ProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isAdmin?: boolean;
  productToEdit?: any;
  fixedBrand?: { id: string; brand_name: string } | null;
}

export function ProductForm({ onSuccess, onCancel, isAdmin = false, productToEdit, fixedBrand }: ProductFormProps) {
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
    <Card className="w-full max-w-4xl mx-auto border-none shadow-none">
      <CardContent className="pt-6 space-y-6">
        <Form {...form}>
          <form onSubmit={e => { console.log('DEBUG: form values on submit', form.getValues()); handleSubmit(e); }} className="space-y-6">
            <ProductImageUploader
              label="Product Images"
              previews={imagePreviews}
              onDrop={handleImageDrop}
              onRemove={handleImageRemove}
            />
            <ProductFormInputs form={form} isAdmin={isAdmin} fixedBrand={fixedBrand} />
            <AromaticProfileInput form={form} />
            <ProductAwardsInput form={form} />
            
            {isEditing && productToEdit?.id && (
              <FoodPairingInput productId={productToEdit.id} />
            )}

            <div className="flex justify-end space-x-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Product')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
