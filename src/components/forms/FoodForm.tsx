
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FoodFormFields } from './food-form/FoodFormFields';
import { useFoodForm } from './food-form/useFoodForm';

interface FoodFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FoodForm({ onSuccess, onCancel }: FoodFormProps) {
  const {
    form,
    createFoodMutation,
    handleImageUpload,
    handleImageRemove,
    onSubmit,
  } = useFoodForm(onSuccess);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Food Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FoodFormFields
            form={form}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />

          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={createFoodMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {createFoodMutation.isPending ? 'Creating...' : 'Create Food Item'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
