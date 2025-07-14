
import React from 'react';
import { Button } from '@/components/ui/button';

interface EnhancedProductFormActionsProps {
  onCancel?: () => void;
  loading: boolean;
  isEditing: boolean;
}

export function EnhancedProductFormActions({ onCancel, loading, isEditing }: EnhancedProductFormActionsProps) {
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
        {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Product')}
      </Button>
    </div>
  );
}
