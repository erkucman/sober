
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Building2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AromaticProfileChart } from '@/components/products/AromaticProfileChart';

type ProductApplication = {
  id: string;
  name: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  brands: { brand_name: string } | null;
  price: number | null;
  currency: string | null;
  brand_id: string;
  product_awards: { id: string; name: string; year: number | null }[] | null;
};

interface ProductApplicationCardProps {
  application: ProductApplication;
}

export function ProductApplicationCard({ application }: ProductApplicationCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productDetails } = useQuery({
    queryKey: ['productDetailsForCard', application.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('is_vegan, is_gluten_free, product_properties(value, property_types(name))')
        .eq('id', application.id)
        .single();
      if (error) {
        console.error("Error fetching product details", error);
        return null;
      };
      return data;
    },
    enabled: !!application.id,
  });

  const aromaticProfileData = productDetails?.product_properties
    ? productDetails.product_properties
        .filter((prop: any) => prop.property_types?.name.startsWith('Aromatic - '))
        .map((prop: any) => ({
          subject: prop.property_types!.name.replace('Aromatic - ', ''),
          value: Number(prop.value),
        }))
    : [];

  const updateProductStatus = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', application.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Product ${status} successfully!`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productsByBrand', application.brand_id] });
      queryClient.invalidateQueries({ queryKey: ['productsByCategory'] });
      queryClient.invalidateQueries({ queryKey: ['productDetailsForCard', application.id] });
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{application.name}</CardTitle>
            <CardDescription className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Applied {new Date(application.created_at).toLocaleDateString()}
              </span>
              {application.brands && (
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {application.brands.brand_name}
                </span>
              )}
            </CardDescription>
          </div>
          <Badge variant={application.status === 'pending' ? 'secondary' : 'default'}>
            {application.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {application.description && (
            <p className="text-sm text-muted-foreground">{application.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {application.price && application.currency && (
               <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: application.currency }).format(application.price)}</span>
              </div>
            )}
             {productDetails?.is_gluten_free && <Badge variant="outline">Gluten-Free</Badge>}
             {productDetails?.is_vegan && <Badge variant="outline">Vegan</Badge>}
          </div>

          {aromaticProfileData.length > 0 && (
             <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Aromatic Profile</h4>
              <AromaticProfileChart data={aromaticProfileData} />
            </div>
          )}
          
          {application.product_awards && application.product_awards.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Awards & Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {application.product_awards.map((award) => (
                  <Badge key={award.id} variant="secondary">
                    {award.name} {award.year && `(${award.year})`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {application.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                onClick={() => updateProductStatus('approved')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Processing...' : 'Approve'}
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => updateProductStatus('rejected')}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Reject'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
