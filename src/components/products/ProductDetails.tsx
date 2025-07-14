import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer } from 'lucide-react';

interface ProductDetailsProps {
  product: any;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  // Map product_properties to a flat object
  const propertiesMap: { [key: string]: string } = {};
  if (product.product_properties) {
    product.product_properties.forEach((prop: any) => {
      const propertyName = prop.property_types?.name;
      if (propertyName) {
        propertiesMap[propertyName] = prop.value;
      }
    });
  }
  // Reordered and relabeled properties
  const varietal = propertiesMap['Wine Varietal'];
  const grape = propertiesMap['Grape Varieties'];
  const shelfDuration = propertiesMap['Shelf Duration'];
  const servingTemp = propertiesMap['Serving Temperature'];

  return (
    <div className="bg-white rounded-2xl shadow-md border p-6 space-y-3 w-full">
      {varietal && (
        <div className="flex justify-between"><span className="font-medium">Varietal:</span><span className="text-muted-foreground">{varietal}</span></div>
      )}
      {grape && (
        <div className="flex justify-between"><span className="font-medium">Grape:</span><span className="text-muted-foreground">{grape}</span></div>
      )}
      {shelfDuration && (
        <div className="flex justify-between"><span className="font-medium">Shelf Duration:</span><span className="text-muted-foreground">{shelfDuration} months</span></div>
      )}
      {servingTemp && (
        <div className="flex justify-between items-center">
          <span className="font-medium flex items-center gap-1"><Thermometer className="w-4 h-4 text-orange-600" /> Serving Temp:</span>
          <span className="text-muted-foreground">{servingTemp}°C</span>
        </div>
      )}
    </div>
  );
}
