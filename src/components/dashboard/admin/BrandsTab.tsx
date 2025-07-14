
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { BrandForm } from '@/components/forms/BrandForm';
import { BrandListManager } from './BrandListManager';

export function BrandsTab() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Brands</CardTitle>
              <CardDescription>View and manage all brands in the system</CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Brand
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]" aria-describedby="create-brand-dialog-desc">
                <DialogHeader>
                  <DialogTitle>Create New Brand</DialogTitle>
                  <DialogDescription id="create-brand-dialog-desc">
                    Add a new brand to the platform
                  </DialogDescription>
                </DialogHeader>
                <BrandForm 
                  isAdmin={true} 
                  onSuccess={handleCreateSuccess}
                  onCancel={() => setShowCreateDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>
      
      <BrandListManager />
    </div>
  );
}
