
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface EnhancedProductFormHeaderProps {
  isEditing: boolean;
}

export function EnhancedProductFormHeader({ isEditing }: EnhancedProductFormHeaderProps) {
  return (
    <CardHeader>
      <CardTitle>
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </CardTitle>
      <CardDescription>
        {isEditing 
          ? 'Update your product information and details.' 
          : 'Create a new product listing with detailed information.'
        }
      </CardDescription>
    </CardHeader>
  );
}
