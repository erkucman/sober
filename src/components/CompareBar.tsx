import React from 'react';
import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  if (compareList.length < 2) return null;
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-50 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4 overflow-x-auto">
        {compareList.map(product => (
          <div key={product.id} className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
            <img src={product.images?.[0] || ''} alt={product.name} className="h-10 w-10 object-cover rounded" />
            <span className="font-medium text-sm max-w-[100px] truncate">{product.name}</span>
            <button onClick={() => removeFromCompare(product.id)} className="ml-1 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button asChild className="bg-orange-600 hover:bg-orange-700">
          <Link to="/compare">Compare</Link>
        </Button>
        <Button variant="outline" onClick={clearCompare}>Clear</Button>
      </div>
    </div>
  );
} 