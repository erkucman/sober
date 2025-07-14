import React from 'react';
import { useCompare } from '@/contexts/CompareContext';
import { getCurrencySymbol } from '@/lib/utils';
import { AromaticProfileChart } from '@/components/products/AromaticProfileChart';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ComparePage() {
  const { compareList, clearCompare } = useCompare();
  const productIds = compareList.map(p => p.id);
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['compare-products', productIds],
    queryFn: async () => {
      if (!productIds.length) return [];
      const { data, error } = await supabase
        .from('products')
        .select(`*, brands(*), categories(*), product_properties(*, property_types(*)), product_awards(*)`)
        .in('id', productIds);
      if (error) throw error;
      return data || [];
    },
    enabled: productIds.length > 0,
  });
  if (compareList.length < 2) {
    return <div className="container mx-auto px-4 py-8 text-center">Select at least 2 products to compare.</div>;
  }
  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading comparison...</div>;
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Compare Products</h1>
        <button className="text-sm text-blue-600 underline" onClick={clearCompare}>Clear All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => {
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
          const varietal = propertiesMap['Wine Varietal'];
          const grape = propertiesMap['Grape Varieties'];
          const shelfDuration = propertiesMap['Shelf Duration'];
          const servingTemp = propertiesMap['Serving Temperature'];
          const country = propertiesMap['Country'];
          const region = propertiesMap['Region'];
          const alcohol = propertiesMap['Alcohol %'];
          const closure = propertiesMap['Closure Type'];
          const volume = propertiesMap['Volume'];
          return (
            <div key={product.id} className="border rounded-lg p-4 bg-white flex flex-col items-center">
              <Link to={`/product/${product.id}`} className="hover:opacity-80">
                <img src={product.images?.[0] || ''} alt={product.name} className="h-32 w-32 object-cover rounded mb-2" />
              </Link>
              <Link to={`/product/${product.id}`} className="hover:underline">
                <h2 className="font-semibold text-lg mb-1 text-center">{product.name}</h2>
              </Link>
              <div className="text-sm text-gray-500 mb-2">{product.brands?.brand_name || 'Unbranded'}</div>
              <div className="text-xs text-gray-400 mb-2">{product.categories?.name}</div>
              <div className="text-xl font-bold text-orange-800 mb-2">{getCurrencySymbol(product.currency || 'USD')} {product.price}</div>
              <div className="mb-2 flex flex-wrap gap-2">
                {product.is_vegan && <span className="bg-gray-100 rounded px-2 py-1 text-xs">Vegan</span>}
                {product.is_gluten_free && <span className="bg-gray-100 rounded px-2 py-1 text-xs">Gluten-Free</span>}
                {product.is_alcohol_free && <span className="bg-gray-100 rounded px-2 py-1 text-xs">Alcohol-Free</span>}
              </div>
              {product.product_awards && product.product_awards.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {product.product_awards.map((award: any, idx: number) => (
                    <span key={idx} className="flex items-center bg-yellow-100 text-yellow-800 rounded px-2 py-1 text-xs font-semibold">
                      🏆 {award.name} {award.year && <span>({award.year})</span>}
                    </span>
                  ))}
                </div>
              )}
              <div className="w-full mt-4 space-y-2 text-sm text-gray-700">
                {country && <div className="flex justify-between"><span className="font-medium">Country:</span><span className="text-muted-foreground">{country}</span></div>}
                {region && <div className="flex justify-between"><span className="font-medium">Region:</span><span className="text-muted-foreground">{region}</span></div>}
                {varietal && <div className="flex justify-between"><span className="font-medium">Varietal:</span><span className="text-muted-foreground">{varietal}</span></div>}
                {grape && <div className="flex justify-between"><span className="font-medium">Grape:</span><span className="text-muted-foreground">{grape}</span></div>}
                {alcohol && <div className="flex justify-between"><span className="font-medium">Alcohol %:</span><span className="text-muted-foreground">{alcohol}</span></div>}
                {volume && <div className="flex justify-between"><span className="font-medium">Volume:</span><span className="text-muted-foreground">{volume}</span></div>}
                {shelfDuration && <div className="flex justify-between"><span className="font-medium">Shelf Duration:</span><span className="text-muted-foreground">{shelfDuration} months</span></div>}
                {servingTemp && <div className="flex justify-between items-center"><span className="font-medium flex items-center gap-1">Serving Temp:</span><span className="text-muted-foreground">{servingTemp}°C</span></div>}
                {closure && <div className="flex justify-between"><span className="font-medium">Closure:</span><span className="text-muted-foreground">{closure}</span></div>}
              </div>
              <div className="w-full mt-4">
                <AromaticProfileChart product={product} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 