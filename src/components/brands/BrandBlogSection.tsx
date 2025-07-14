import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export function BrandBlogSection({ brandId }: { brandId: string }) {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['brand_blog_posts_public', brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_blog_posts')
        .select('*')
        .eq('brand_id', brandId)
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!brandId,
  });

  if (isLoading) return <div>Loading blog posts...</div>;
  if (!posts.length) return <div className="text-muted-foreground py-8 text-center">No blog posts yet.</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Brand Blog</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: any) => (
          <Link to={`/brands/${brandId}/blog/${post.id}`} key={post.id} className="hover:no-underline">
            <div className="bg-white rounded-xl shadow border p-4 flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer">
              {post.image_url && (
                <img src={post.image_url} alt={post.title} className="w-full h-40 object-cover rounded mb-3" />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
                <div className="text-xs text-gray-500 mb-2">{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</div>
                <div className="text-sm text-muted-foreground line-clamp-3">{post.content}</div>
              </div>
              <div className="mt-2 text-right">
                <span className="text-orange-600 font-semibold hover:underline">Read More &rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 