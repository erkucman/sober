
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalTrigger, ModalDescription } from '@/components/ui/modal';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/context';
import { Plus } from 'lucide-react';

interface CreateListModalProps {
  onListCreated: () => void;
}

export const CreateListModal = ({ onListCreated }: CreateListModalProps) => {
  const [open, setOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateList = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create lists",
        variant: "destructive",
      });
      return;
    }

    if (!listName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a list name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_lists')
        .insert({
          user_id: user.id,
          name: listName.trim(),
          description: listDescription.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "List created successfully!",
      });

      setListName('');
      setListDescription('');
      setOpen(false);
      onListCreated();
    } catch (error) {
      console.error('Error creating list:', error);
      toast({
        title: "Error",
        description: "Failed to create list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Create New List
        </Button>
      </ModalTrigger>
      <ModalContent aria-describedby="create-list-modal-desc">
        <ModalHeader>
          <ModalTitle>Create New List</ModalTitle>
          <ModalDescription id="create-list-modal-desc" className="sr-only">
            Create a new list for your account.
          </ModalDescription>
        </ModalHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="listName">List Name *</Label>
            <Input
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g., Weekend Selections"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="listDescription">Description</Label>
            <Textarea
              id="listDescription"
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              placeholder="Describe your list..."
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateList}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Creating...' : 'Create List'}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
