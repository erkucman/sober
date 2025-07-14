import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Plus } from 'lucide-react';
import { useFoods } from '@/hooks/useFoods';
import { useFoodPairings, useAddFoodPairing, useRemoveFoodPairing } from '@/hooks/useFoodPairings';

interface FoodPairingInputProps {
  productId?: string;
}

export function FoodPairingInput({ productId }: FoodPairingInputProps) {
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [pairingStrength, setPairingStrength] = useState([5]);
  const [notes, setNotes] = useState('');

  const { data: foods = [] } = useFoods();
  const { data: pairings = [] } = useFoodPairings(productId);
  const addPairing = useAddFoodPairing();
  const removePairing = useRemoveFoodPairing();

  const handleAddPairing = () => {
    if (!selectedFoodId || !productId) return;

    addPairing.mutate({
      product_id: productId,
      food_id: selectedFoodId,
      pairing_strength: pairingStrength[0],
      notes: notes || undefined,
    });

    setSelectedFoodId('');
    setPairingStrength([5]);
    setNotes('');
  };

  const availableFoods = foods.filter(
    food => !pairings.some(pairing => pairing.food_id === food.id)
  );

  if (!productId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Food Pairings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Save the product first to add food pairings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Food Pairings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Pairings */}
        {pairings.length > 0 && (
          <div className="space-y-2">
            <Label>Current Pairings</Label>
            <div className="flex flex-wrap gap-2">
              {pairings.map((pairing) => (
                <Badge key={pairing.id} variant="secondary" className="flex items-center gap-2">
                  {pairing.foods.name} ({pairing.pairing_strength}/10)
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removePairing.mutate(pairing.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add New Pairing */}
        <div className="space-y-4 border-t pt-4">
          <Label>Add Food Pairing</Label>
          
          <div className="space-y-2">
            <Label htmlFor="food-select">Food Item</Label>
            <Select value={selectedFoodId} onValueChange={setSelectedFoodId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a food item" />
              </SelectTrigger>
              <SelectContent>
                {availableFoods.map((food) => (
                  <SelectItem key={food.id} value={food.id}>
                    {food.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Pairing Strength: {pairingStrength[0]}/10</Label>
            <Slider
              value={pairingStrength}
              onValueChange={setPairingStrength}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pairing-notes">Notes (optional)</Label>
            <Textarea
              id="pairing-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this pairing..."
              rows={2}
            />
          </div>

          <Button
            onClick={handleAddPairing}
            disabled={!selectedFoodId || addPairing.isPending}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addPairing.isPending ? 'Adding...' : 'Add Pairing'}
          </Button>
        </div>

        {availableFoods.length === 0 && pairings.length > 0 && (
          <p className="text-sm text-muted-foreground">All available foods have been paired with this product.</p>
        )}
      </CardContent>
    </Card>
  );
}
