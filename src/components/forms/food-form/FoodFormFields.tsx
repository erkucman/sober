
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUploader } from '@/components/ui/FileUploader';
import { FoodFormData } from './useFoodForm';

interface FoodFormFieldsProps {
  form: UseFormReturn<FoodFormData>;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
}

export function FoodFormFields({ form, onImageUpload, onImageRemove }: FoodFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Food Name</Label>
        <Input
          id="name"
          placeholder="Enter food name"
          {...form.register('name')}
        />
        {form.formState.errors.name && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Enter food description"
          {...form.register('description')}
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Food Image</Label>
        <FileUploader
          onFileUpload={onImageUpload}
          currentImageUrl={form.watch('image_url')}
          onFileRemove={onImageRemove}
          label=""
        />
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">Dietary Attributes</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_vegan"
              checked={form.watch('is_vegan')}
              onCheckedChange={(checked) => form.setValue('is_vegan', !!checked)}
            />
            <Label htmlFor="is_vegan" className="font-normal">Vegan</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_vegetarian"
              checked={form.watch('is_vegetarian')}
              onCheckedChange={(checked) => form.setValue('is_vegetarian', !!checked)}
            />
            <Label htmlFor="is_vegetarian" className="font-normal">Vegetarian</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_halal"
              checked={form.watch('is_halal')}
              onCheckedChange={(checked) => form.setValue('is_halal', !!checked)}
            />
            <Label htmlFor="is_halal" className="font-normal">Halal</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_gluten_free"
              checked={form.watch('is_gluten_free')}
              onCheckedChange={(checked) => form.setValue('is_gluten_free', !!checked)}
            />
            <Label htmlFor="is_gluten_free" className="font-normal">Gluten-Free</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_keto"
              checked={form.watch('is_keto')}
              onCheckedChange={(checked) => form.setValue('is_keto', !!checked)}
            />
            <Label htmlFor="is_keto" className="font-normal">Keto</Label>
          </div>
        </div>
      </div>
    </>
  );
}
