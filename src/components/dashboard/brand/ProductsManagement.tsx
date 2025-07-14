import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star } from 'lucide-react';
import { useProductsByBrand } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalTrigger } from '@/components/ui/modal';
import { ProductForm } from '@/components/forms/ProductForm';
import { supabase } from '@/integrations/supabase/client';
import { countries } from '@/lib/countries';
import { getCurrencySymbol } from '@/lib/utils';

interface ProductsManagementProps {
  brandId: string;
}

export function ProductsManagement({ brandId }: ProductsManagementProps) {
  const { data: products, isLoading } = useProductsByBrand(brandId);
  const [activeTab, setActiveTab] = useState('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const navigate = useNavigate();

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeTab === 'all') return products;
    return products.filter((p) => p.status === activeTab);
  }, [products, activeTab]);

  const counts = useMemo(() => {
    const defaultCounts = { all: 0, approved: 0, pending: 0 };
    if (!products) return defaultCounts;
    
    return {
      all: products.length,
      approved: products.filter((p) => p.status === 'approved').length,
      pending: products.filter((p) => p.status === 'pending').length,
    };
  }, [products]);

  const getEmptyStateMessage = () => {
    switch(activeTab) {
      case 'approved':
        return 'You have no approved products.';
      case 'pending':
        return 'You have no products pending approval.';
      case 'all':
      default:
        return 'You have not added any products yet.';
    }
  }

  // Helper to fetch full product details if needed
  const handleEditClick = async (product: any) => {
    if (product.product_properties && product.product_awards && product.category_id && product.brand_id) {
      setProductToEdit(product);
      setEditModalOpen(true);
    } else {
      // Fetch full product details, including categories and brands
      const { data, error } = await supabase
        .from('products')
        .select(`*, product_properties (property_type_id, value, property_types (name)), product_awards (*), categories (*), brands (*)`)
        .eq('id', product.id)
        .single();
      if (data) {
        // Map product_properties to flat fields for the form
        const propertiesMap: Record<string, string> = {};
        if (data.product_properties) {
          data.product_properties.forEach((prop: any) => {
            const propertyName = prop.property_types?.name;
            if (propertyName) {
              propertiesMap[propertyName] = prop.value;
            }
          });
        }
        // Build a flat formData object for the form
        const allowedBeverageTypes = ['wine', 'beer', 'spirits', 'champagne', 'cocktail', 'other'];
        const rawCountry = (data as any).country || propertiesMap['Country'] || '';
        const normalizedCountry = countries.find(c => c.name === rawCountry)?.name || '';
        const rawBeverageType = (data as any).beverage_type || propertiesMap['Beverage Type'] || '';
        const normalizedBeverageType = allowedBeverageTypes.includes(rawBeverageType.toLowerCase()) ? rawBeverageType.toLowerCase() : '';
        const formData: any = {
          ...(data as any),
          brand_id: String((data as any).brand_id || (data as any).brands?.id || ''),
          category_id: String((data as any).category_id || (data as any).categories?.id || ''),
          country: normalizedCountry,
          beverage_type: normalizedBeverageType,
          purchase_link: propertiesMap['Purchase Link'] || (data as any).purchase_link || '',
          vintage: propertiesMap['Vintage'] || (data as any).vintage || '',
          region: propertiesMap['Region'] || (data as any).region || '',
          wine_varietal: propertiesMap['Wine Varietal'] || (data as any).wine_varietal || '',
          grape_varieties: propertiesMap['Grape Varieties'] || (data as any).grape_varieties || '',
          serving_temperature: propertiesMap['Serving Temperature'] || (data as any).serving_temperature || '',
          shelf_duration: propertiesMap['Shelf Duration'] || (data as any).shelf_duration || '',
          aromatic_body: propertiesMap['Aromatic - Body'] || (data as any).aromatic_body || '1',
          aromatic_acidity: propertiesMap['Aromatic - Acidity'] || (data as any).aromatic_acidity || '1',
          aromatic_tannin: propertiesMap['Aromatic - Tannin'] || (data as any).aromatic_tannin || '1',
          aromatic_sweetness: propertiesMap['Aromatic - Sweetness'] || (data as any).aromatic_sweetness || '1',
          aromatic_fruit: propertiesMap['Aromatic - Fruit'] || (data as any).aromatic_fruit || '1',
          awards: ((data as any).product_awards || []).map((a: any) => ({
            id: a.id,
            name: a.name,
            year: a.year?.toString() || ''
          })),
        };
        console.log('DEBUG: formData passed to ProductForm', formData);
        setProductToEdit(formData);
        setEditModalOpen(true);
      } else {
        alert('Failed to fetch product details for editing.');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>My Products</CardTitle>
            <CardDescription>Manage your product listings</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Modal open={editModalOpen} onOpenChange={setEditModalOpen}>
          <ModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-product-modal-desc">
            <ModalHeader>
              <ModalTitle>Edit Product</ModalTitle>
              <ModalDescription id="edit-product-modal-desc" className="sr-only">
                Edit the selected product details.
              </ModalDescription>
            </ModalHeader>
            <ProductForm
              productToEdit={productToEdit}
              onSuccess={() => {
                setEditModalOpen(false);
                setProductToEdit(null);
              }}
              onCancel={() => {
                setEditModalOpen(false);
                setProductToEdit(null);
              }}
              isAdmin={false}
              fixedBrand={{ id: brandId, brand_name: '' }}
            />
          </ModalContent>
        </Modal>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          </TabsList>
        </Tabs>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
                Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                        <TableCell><div className="flex space-x-2"><Skeleton className="h-8 w-[50px]" /><Skeleton className="h-8 w-[50px]" /></div></TableCell>
                    </TableRow>
                ))
            )}
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.categories?.name || 'N/A'}</TableCell>
                  <TableCell>{product.price ? `${getCurrencySymbol(product.currency || 'USD')} ${product.price}` : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'approved' ? 'default' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-gray-300 text-gray-300 mr-1" />
                      N/A
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={product.status !== 'approved'}
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : !isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">{getEmptyStateMessage()}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
