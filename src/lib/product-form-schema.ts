
import { z } from 'zod';

export const productSchema = z.object({
  brand_id: z.string().optional(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? undefined : num;
  }),
  currency: z.string().default('USD'),
  category_id: z.string().optional(),
  vintage: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  beverage_type: z.string().optional(),
  wine_varietal: z.string().optional(),
  grape_varieties: z.string().optional(),
  is_alcohol_free: z.boolean().default(false),
  is_gluten_free: z.boolean().default(false),
  is_vegan: z.boolean().default(false),
  serving_temperature: z.string().optional(),
  shelf_duration: z.string().optional(),
  purchase_link: z.string().optional(),
  images: z.array(z.any()).optional(),
  awards: z.array(z.object({
    id: z.string().optional(), // To track existing awards on edit
    name: z.string().min(1, 'Award name is required'),
    year: z.string().optional(),
  })).optional(),
  
  // Aromatic Profile
  aromatic_body: z.string().optional(),
  aromatic_acidity: z.string().optional(),
  aromatic_tannin: z.string().optional(),
  aromatic_sweetness: z.string().optional(),
  aromatic_fruit: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
