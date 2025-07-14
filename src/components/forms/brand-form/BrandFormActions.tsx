
import React from 'react';
import { Button } from '@/components/ui/button';

interface BrandFormActionsProps {
  onCancel?: () => void;
  loading: boolean;
  brandToEdit?: any;
}

export function BrandFormActions({ onCancel, loading, brandToEdit }: BrandFormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
      <Button 
        type="submit" 
        disabled={loading}
        className="bg-orange-600 hover:bg-orange-700"
      >
        {loading 
          ? (brandToEdit?.id ? 'Updating...' : 'Creating...') 
          : (brandToEdit?.id ? 'Update Brand' : 'Create Brand')
        }
      </Button>
    </div>
  );
}
