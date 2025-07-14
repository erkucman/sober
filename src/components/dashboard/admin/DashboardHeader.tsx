
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { WifiOff } from 'lucide-react';

interface DashboardHeaderProps {
  isOnline: boolean;
}

export function DashboardHeader({ isOnline }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-orange-800">Admin Dashboard</h1>
      <div className="flex items-center space-x-2">
        {!isOnline && (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        )}
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          Administrator
        </Badge>
      </div>
    </div>
  );
}
