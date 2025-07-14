
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Globe, Calendar, User } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface BrandApplication {
  id: string;
  brand_name: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_id: string;
}

interface BrandApplicationCardProps {
  application: BrandApplication;
}

export function BrandApplicationCard({ application }: BrandApplicationCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateBrandStatus = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('brands')
        .update({ status })
        .eq('id', application.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Brand ${status} successfully!`,
      });

      queryClient.invalidateQueries({ queryKey: ['pending-brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['all-brands'] });
    } catch (error) {
      console.error('Error updating brand status:', error);
      toast({
        title: "Error",
        description: "Failed to update brand status. Please try again.",
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
            <CardTitle className="text-lg">{application.brand_name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              Applied {new Date(application.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant={application.status === 'pending' ? 'secondary' : 'default'}>
            {application.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {application.description && (
            <p className="text-sm text-muted-foreground">{application.description}</p>
          )}
          
          {application.website_url && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a 
                href={application.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {application.website_url}
              </a>
            </div>
          )}

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">ID: {application.user_id}</span>
          </div>

          {application.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                onClick={() => updateBrandStatus('approved')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Processing...' : 'Approve'}
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => updateBrandStatus('rejected')}
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
