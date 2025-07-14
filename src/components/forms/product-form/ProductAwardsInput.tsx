
import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductFormData } from '@/lib/product-form-schema';

interface ProductAwardsInputProps {
  form: UseFormReturn<ProductFormData>;
}

export function ProductAwardsInput({ form }: ProductAwardsInputProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "awards",
  });

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <Label className="text-base font-medium">Awards & Certifications</Label>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <Input
            {...form.register(`awards.${index}.name`)}
            placeholder="e.g., Best Wine 2024"
            className="flex-grow"
          />
          <Input
            {...form.register(`awards.${index}.year`)}
            placeholder="Year"
            type="number"
            className="w-24"
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ name: '', year: '' })}
      >
        Add Award
      </Button>
    </div>
  );
}

