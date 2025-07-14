import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

export function AdminBlogManager() {
  const queryClient = useQueryClient();
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [form, setForm] = useState({
    id: undefined,
    title: '',
    content: '',
    image_url: '',
    is_published: true,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin_blog_posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_blog_posts')
        .select('*')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (post: any) => {
      if (post.id) {
        // Update
        // If publishing and published_at is null, set published_at to now
        let published_at = post.published_at;
        if (post.is_published && !post.published_at) {
          published_at = new Date().toISOString();
        }
        const { data, error } = await supabase
          .from('admin_blog_posts')
          .update({
            title: post.title,
            content: post.content,
            image_url: post.image_url,
            is_published: post.is_published,
            updated_at: new Date().toISOString(),
            published_at,
          })
          .eq('id', post.id)
          .select(); // <-- Ensure updated data is returned
        if (error) throw error;
        return data?.[0];
      } else {
        // Create
        const { data, error } = await supabase
          .from('admin_blog_posts')
          .insert({
            title: post.title,
            content: post.content,
            image_url: post.image_url,
            is_published: post.is_published,
            published_at: post.is_published ? new Date().toISOString() : null,
          })
          .select(); // <-- Ensure created data is returned
        if (error) throw error;
        return data?.[0];
      }
    },
    onSuccess: (_, variables) => {
      setEditingPost(null);
      setForm({ id: undefined, title: '', content: '', image_url: '', is_published: true });
      toast({ title: variables.id ? 'Post updated' : 'Post created', description: 'Your changes have been saved.' });
      queryClient.invalidateQueries({ queryKey: ['admin_blog_posts'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || error, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('admin_blog_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_blog_posts'] });
    },
  });

  const startEdit = (post: any) => {
    setEditingPost(post);
    setForm({
      id: post.id,
      title: post.title,
      content: post.content,
      image_url: post.image_url || '',
      is_published: post.is_published,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(editingPost ? { ...editingPost, ...form } : form);
  };

  async function handleImageUpload(file: File) {
    setUploading(true);
    const filePath = `admin/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await supabase.storage
      .from('admin-blog-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });
    setUploading(false);
    if (error) {
      alert('Image upload failed');
      return;
    }
    const { data: urlData } = supabase.storage.from('admin-blog-images').getPublicUrl(data.path);
    setForm(f => ({ ...f, image_url: urlData.publicUrl }));
  }

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Admin Blog Posts</CardTitle>
        <Button onClick={() => { setEditingPost(null); setForm({ id: undefined, title: '', content: '', image_url: '', is_published: true }); setShowModal(true); }}>
          Add Post
        </Button>
      </CardHeader>
      <CardContent>
        <Dialog open={showModal || !!editingPost} onOpenChange={open => { if (!open) { setEditingPost(null); setForm({ id: undefined, title: '', content: '', image_url: '', is_published: true }); setShowModal(false); } }}>
          <DialogContent aria-describedby="admin-blog-dialog-desc">
            <DialogDescription id="admin-blog-dialog-desc">
              {editingPost ? 'Edit the selected blog post.' : 'Create a new blog post.'}
            </DialogDescription>
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Create Post'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
              <Textarea
                placeholder="Content"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={5}
                required
              />
              <div className="space-y-2">
                <label className="block font-medium">Blog Image (optional)</label>
                {form.image_url && (
                  <img src={form.image_url} alt="Blog" className="w-32 h-20 object-cover rounded mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await handleImageUpload(file);
                  }}
                  disabled={uploading}
                />
                {uploading && <div className="text-xs text-gray-500">Uploading...</div>}
                {form.image_url && (
                  <Button type="button" variant="secondary" size="sm" onClick={() => setForm(f => ({ ...f, image_url: '' }))}>Remove Image</Button>
                )}
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
                />
                Published
              </label>
              <div className="flex gap-2">
                <Button type="submit" disabled={mutation.isPending}>
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setEditingPost(null); setForm({ id: undefined, title: '', content: '', image_url: '', is_published: true }); setShowModal(false); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <div>
          {isLoading ? (
            <div>Loading posts...</div>
          ) : posts.length === 0 ? (
            <div>No blog posts yet.</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post: any) => (
                <Card key={post.id} className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-lg">{post.title}</div>
                      <div className="text-xs text-gray-500">{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</div>
                      {!post.is_published && <span className="text-xs text-red-500 ml-2">Unpublished</span>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => { startEdit(post); setShowModal(true); }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(post.id)}>Delete</Button>
                    </div>
                  </div>
                  {post.image_url && <img src={post.image_url} alt="Blog" className="w-32 h-20 object-cover rounded" />}
                  <div className="text-sm line-clamp-3">{post.content}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 