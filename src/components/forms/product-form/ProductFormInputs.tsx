import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BasicProductInfo } from './BasicProductInfo';
import { ProductAttributes } from './ProductAttributes';
import { ProductProperties } from './ProductProperties';

interface ProductFormInputsProps {
  form: UseFormReturn<any>;
  isAdmin: boolean;
  fixedBrand?: { id: string; brand_name: string } | null;
}

export function ProductFormInputs({ form, isAdmin, fixedBrand }: ProductFormInputsProps) {
  return (
    <div className="space-y-8">
      <BasicProductInfo form={form} isAdmin={isAdmin} fixedBrand={fixedBrand} />
      <ProductAttributes form={form} />
      <ProductProperties form={form} />
    </div>
  );
}
