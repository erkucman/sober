
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '@/lib/product-form-schema';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface AromaticProfileInputProps {
  form: UseFormReturn<ProductFormData>;
}

type AromaticFieldNames = 'aromatic_body' | 'aromatic_acidity' | 'aromatic_tannin' | 'aromatic_sweetness' | 'aromatic_fruit';

const aromaticFields: { name: AromaticFieldNames; label: string }[] = [
  { name: 'aromatic_body', label: 'Body' },
  { name: 'aromatic_acidity', label: 'Acidity' },
  { name: 'aromatic_tannin', label: 'Tannin' },
  { name: 'aromatic_sweetness', label: 'Sweetness' },
  { name: 'aromatic_fruit', label: 'Fruit' },
];

export function AromaticProfileInput({ form }: AromaticProfileInputProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <Label className="text-base font-medium">Aromatic Profile (1-10)</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {aromaticFields.map(({ name, label }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>{label}</FormLabel>
                  <span className="text-sm font-medium text-muted-foreground">
                    {Number(field.value) || 1}
                  </span>
                </div>
                <FormControl>
                  <Slider
                    value={[Number(field.value) || 1]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => field.onChange(String(value[0]))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
}
