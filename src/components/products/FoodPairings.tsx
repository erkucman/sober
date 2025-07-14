
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFoodPairings } from '@/hooks/useFoodPairings';
import { Skeleton } from '@/components/ui/skeleton';

interface FoodPairingsProps {
  productId: string;
}

export function FoodPairings({ productId }: FoodPairingsProps) {
  const { data: pairings = [], isLoading } = useFoodPairings(productId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Food Pairings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-28" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pairings.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfect Food Pairings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pairings.map((pairing) => (
            <div key={pairing.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{pairing.foods.name}</span>
                <Badge variant="secondary">
                  {pairing.pairing_strength}/10
                </Badge>
              </div>
              {pairing.foods.description && (
                <p className="text-sm text-muted-foreground">{pairing.foods.description}</p>
              )}
              {pairing.notes && (
                <p className="text-sm italic text-muted-foreground">"{pairing.notes}"</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
