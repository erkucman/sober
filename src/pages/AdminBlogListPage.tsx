import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export function AdminBlogListPage() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin_blog_posts_public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading blog posts...</div>;
  if (!posts.length) return <div className="text-muted-foreground py-8 text-center">No admin blog posts yet.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-4xl font-extrabold mb-10 text-center">Blog</h2>
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: any) => (
          <Link to={`/admin-blog/${post.id}`} key={post.id} className="hover:no-underline group">
            <div className="bg-white rounded-2xl shadow-lg border overflow-hidden flex flex-col h-full transition-transform group-hover:-translate-y-1 cursor-pointer">
              {post.image_url ? (
                <img src={post.image_url} alt={post.title} className="w-full h-56 object-cover" />
              ) : (
                <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-4xl text-gray-300">📝</div>
              )}
              <div className="flex-1 flex flex-col p-6">
                <h3 className="text-2xl font-bold mb-2 text-gray-900 group-hover:text-orange-700 transition-colors">{post.title}</h3>
                <div className="text-xs text-gray-500 mb-4">{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</div>
                <div className="text-base text-gray-700 mb-4 line-clamp-4">{post.content}</div>
                <div className="mt-auto text-right">
                  <span className="text-orange-600 font-semibold hover:underline">Read More &rarr;</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 