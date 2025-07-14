import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCategories } from '@/hooks/useCategories';

interface BrandFormFieldsProps {
  form: UseFormReturn<any>;
  brandToEdit?: any;
}

export function BrandFormFields({ form, brandToEdit }: BrandFormFieldsProps) {
  const { data: categories = [] } = useCategories();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="brand_name">Brand Name *</Label>
        <Input
          id="brand_name"
          {...form.register('brand_name')}
          placeholder="Enter brand name"
        />
        {form.formState.errors.brand_name && (
          <p className="text-sm text-red-600">
            {String(form.formState.errors.brand_name?.message || 'This field is required')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Tell us about your brand..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website_url">Website URL</Label>
        <Input
          id="website_url"
          type="url"
          {...form.register('website_url')}
          placeholder="https://www.yourbrand.com"
        />
        {form.formState.errors.website_url && (
          <p className="text-sm text-red-600">
            {String(form.formState.errors.website_url?.message || 'Please enter a valid URL')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="vat_number">VAT Number</Label>
        <Input
          id="vat_number"
          {...form.register('vat_number')}
          placeholder="Enter VAT number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="main_category_id">Main Category</Label>
        <Select onValueChange={(value) => form.setValue('main_category_id', value)} defaultValue={brandToEdit?.main_category_id}>
          <SelectTrigger>
            <SelectValue placeholder="Select main category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_women_owned"
          checked={form.watch('is_women_owned')}
          onCheckedChange={(checked) => form.setValue('is_women_owned', checked as boolean)}
        />
        <Label htmlFor="is_women_owned">This is a women-owned business</Label>
      </div>
    </>
  );
}
