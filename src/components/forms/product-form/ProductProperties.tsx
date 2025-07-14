import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/countries';

interface ProductPropertiesProps {
  form: UseFormReturn<any>;
}

export function ProductProperties({ form }: ProductPropertiesProps) {
  if (!countries || countries.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Product Properties</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="vintage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vintage</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2020" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Bordeaux" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="beverage_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beverage Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select beverage type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="wine">Wine</SelectItem>
                  <SelectItem value="beer">Beer</SelectItem>
                  <SelectItem value="spirits">Spirits</SelectItem>
                  <SelectItem value="champagne">Champagne</SelectItem>
                  <SelectItem value="cocktail">Cocktail</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="wine_varietal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wine Varietal</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chardonnay" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grape_varieties"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grape Varieties</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Cabernet Sauvignon, Merlot" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serving_temperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serving Temperature</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 16-18°C" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shelf_duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shelf Duration</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 5-10 years" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purchase_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Link</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://..." value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
