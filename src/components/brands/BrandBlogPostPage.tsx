import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/auth/context';

export function BrandBlogPostPage() {
  const { brandId, postId } = useParams<{ brandId: string; postId: string }>();
  const { user, userRole } = useAuth();
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const { data: post, isLoading, error } = useQuery<Database['public']['Tables']['brand_blog_posts']['Row']>({
    queryKey: ['brand_blog_post', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_blog_posts')
        .select('*')
        .eq('id', postId)
        .eq('is_published', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });

  const { data: comments = [], refetch: refetchComments } = useQuery<Database['public']['Tables']['brand_blog_comments']['Row'][]>({
    queryKey: ['brand_blog_comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_blog_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });

  const canComment = userRole === 'end_user';

  React.useEffect(() => {
    if (post && post.id) {
      supabase.rpc('increment_blog_post_view_count', { post_id: post.id });
    }
  }, [post?.id]);

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    await supabase.from('brand_blog_comments').insert({
      post_id: postId,
      user_id: user?.id,
      content: comment.trim(),
    });
    setComment('');
    setSubmitting(false);
    refetchComments();
  }

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error || !post) return <div className="p-8 text-center text-red-600">Blog post not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link to={`/brands/${brandId}`} className="text-orange-600 hover:underline text-sm">&larr; Back to Brand</Link>
      <div className="bg-white rounded-xl shadow border p-6 mt-4">
        {post.image_url && (
          <img src={post.image_url} alt={post.title} className="w-full h-64 object-cover rounded mb-4" />
        )}
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          {post.published_at ? <span>{new Date(post.published_at).toLocaleDateString()}</span> : null}
          {typeof post.view_count === 'number' && <span>{post.view_count} views</span>}
        </div>
        <div className="prose prose-lg max-w-none text-gray-800" style={{ whiteSpace: 'pre-line' }}>{post.content}</div>
      </div>
      {/* Comments Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        {canComment ? (
          <form onSubmit={handleCommentSubmit} className="mb-6 flex flex-col gap-2">
            <textarea
              className="border rounded p-2 min-h-[60px]"
              placeholder="Write a comment..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              disabled={submitting}
              required
            />
            <button type="submit" className="self-end bg-orange-600 text-white px-4 py-1 rounded hover:bg-orange-700" disabled={submitting || !comment.trim()}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="text-muted-foreground mb-4">You must be signed in as an end user to comment.</div>
        )}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-muted-foreground">No comments yet.</div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="border rounded p-3 bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">{new Date(c.created_at).toLocaleString()}</div>
                <div className="text-gray-800 whitespace-pre-line">{c.content}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 