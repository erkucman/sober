
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/integrations/supabase/types';

interface FoodCardProps {
  food: Tables<'foods'>;
}

export function FoodCard({ food }: FoodCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{food.name}</CardTitle>
        <CardDescription>{food.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {food.is_vegan && <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Vegan</Badge>}
          {food.is_vegetarian && <Badge className="bg-lime-100 text-lime-800 hover:bg-lime-200">Vegetarian</Badge>}
          {food.is_halal && <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-200">Halal</Badge>}
          {food.is_gluten_free && <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Gluten-Free</Badge>}
          {food.is_keto && <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Keto</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
