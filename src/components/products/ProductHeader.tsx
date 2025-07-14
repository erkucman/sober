import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ProductHeaderProps {
  product: any;
}

export function ProductHeader({ product }: ProductHeaderProps) {
  return (
    <div className="space-y-4">
      {product.images && product.images.length > 0 && (
        <div className="aspect-square overflow-hidden rounded-lg">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {product.images && product.images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {product.images.slice(1, 5).map((image: string, index: number) => (
            <div key={index} className="aspect-square overflow-hidden rounded">
              <img
                src={image}
                alt={`${product.name} ${index + 2}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
