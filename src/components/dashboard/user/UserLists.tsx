import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserLists } from '@/hooks/useUserLists';
import { useUserStats } from '@/hooks/useUserStats';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateListModal } from './CreateListModal';

export const UserLists = () => {
  const { data: lists, isLoading: isLoadingLists, refetch: refetchLists } = useUserLists();
  const { refetch: refetchStats } = useUserStats();

  const handleListCreated = () => {
    refetchLists();
    refetchStats();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>My Lists</CardTitle>
            <CardDescription>Manage your saved products and wishlists</CardDescription>
          </div>
          <CreateListModal onListCreated={handleListCreated} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingLists ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        ) : lists && lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(lists as any[]).map((list) => (
              <div key={list.id} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{list.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{list.item_count} items</p>
                {list.name === 'Wishlist' ? (
                  <Button asChild variant="ghost" size="sm">
                    <a href="/wishlist">View List</a>
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" disabled>View List</Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You haven't created any lists yet.</p>
            <p className="text-sm text-muted-foreground">Click "Create New List" to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
