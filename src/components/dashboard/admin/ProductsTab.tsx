
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, SortAsc, SortDesc, Plus } from 'lucide-react';
import { AllProductsList } from './AllProductsList';
import { EditProductModal } from './EditProductModal';
import { EnhancedProductForm } from '@/components/forms/EnhancedProductForm';
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';

export function ProductsTab() {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
  };

  const handleCloseEditModal = () => {
    setEditingProductId(null);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setBrandFilter('');
    setCategoryFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  if (showCreateForm) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New Product</CardTitle>
              <CardDescription>Add a new product to the platform</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Back to Products
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <EnhancedProductForm
            isAdmin={true}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Products</CardTitle>
              <CardDescription>View and manage all products in the system</CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Submit a Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Brand Filter */}
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.brand_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Sort by:</span>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date submitted</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2"
              >
                {sortOrder === 'asc' ? (
                  <>
                    <SortAsc className="w-4 h-4" />
                    Ascending
                  </>
                ) : (
                  <>
                    <SortDesc className="w-4 h-4" />
                    Descending
                  </>
                )}
              </Button>

              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AllProductsList 
        onEdit={handleEditProduct}
        searchTerm={searchTerm}
        brandFilter={brandFilter === 'all' ? '' : brandFilter}
        categoryFilter={categoryFilter === 'all' ? '' : categoryFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />

      <EditProductModal
        productId={editingProductId}
        isOpen={!!editingProductId}
        onClose={handleCloseEditModal}
      />
    </div>
  );
}
