
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface SystemStatusProps {
  isOnline: boolean;
  hasErrors: boolean;
}

export function SystemStatus({ isOnline, hasErrors }: SystemStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Current status of dashboard components</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                Network Status: {isOnline ? 'Connected' : 'Disconnected'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isOnline ? 'All systems operational' : 'Check your connection'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!hasErrors ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                Data Loading: {!hasErrors ? 'Successful' : 'Partial'}
              </p>
              <p className="text-xs text-muted-foreground">
                {!hasErrors ? 'All data loaded successfully' : 'Some components failed to load'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
