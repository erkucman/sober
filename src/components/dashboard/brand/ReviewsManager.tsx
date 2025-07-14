import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

export function ReviewsManager({ brandId }: { brandId: string }) {
  // Fetch all products for the brand
  const { data: products = [] } = useQuery({
    queryKey: ['brand_products', brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('brand_id', brandId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!brandId,
  });
  const productIds = useMemo(() => Array.isArray(products) ? products.map(p => p.id) : [], [products]);

  // Fetch all reviews for those products
  const { data: reviews = [] } = useQuery({
    queryKey: ['product_reviews', productIds],
    queryFn: async () => {
      if (!productIds.length) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .in('product_id', productIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!productIds.length,
  });

  // Fetch all blog posts for the brand
  const { data: blogPosts = [] } = useQuery({
    queryKey: ['brand_blog_posts', brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_blog_posts')
        .select('*')
        .eq('brand_id', brandId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!brandId,
  });
  const blogPostIds = useMemo(() => Array.isArray(blogPosts) ? blogPosts.map(p => p.id) : [], [blogPosts]);

  // Fetch all comments for those blog posts
  const { data: blogComments = [] } = useQuery({
    queryKey: ['blog_comments', blogPostIds],
    queryFn: async () => {
      if (!blogPostIds.length) return [];
      const { data, error } = await supabase
        .from('brand_blog_comments')
        .select('*')
        .in('post_id', blogPostIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!blogPostIds.length,
  });

  // Fetch all review responses for these reviews
  const reviewIds = useMemo(() => Array.isArray(reviews) ? reviews.map(r => r.id) : [], [reviews]);
  const { data: responses = [] } = useQuery({
    queryKey: ['review_responses', reviewIds],
    queryFn: async () => {
      if (!reviewIds.length) return [];
      const { data, error } = await supabase
        .from('review_responses')
        .select('*')
        .in('review_id', reviewIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!reviewIds.length,
  });

  // Mutation for saving a response
  const queryClient = useQueryClient();
  const { mutate: saveResponse, status: saveResponseStatus } = useMutation({
    mutationFn: async ({ reviewId, content }: { reviewId: string; content: string }) => {
      // Check if response exists
      const existing = responses.find((r: any) => r.review_id === reviewId);
      if (existing) {
        const { error } = await supabase
          .from('review_responses')
          .update({ content })
          .eq('review_id', reviewId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('review_responses')
          .insert({ review_id: reviewId, brand_id: brandId, content });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review_responses', reviewIds] });
    },
  });

  // State for sorting/filtering
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'blog'>('all');
  const [sort, setSort] = useState<'recent' | 'rating-high' | 'rating-low'>('recent');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  // State for responded/not responded filter
  const [responseFilter, setResponseFilter] = useState<'all' | 'responded' | 'not_responded'>('all');
  // State for editing response
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [draftResponse, setDraftResponse] = useState<string>('');

  // Unified list (add response info)
  const unified = useMemo(() => {
    let items: any[] = [];
    if ((typeFilter === 'all' || typeFilter === 'product') && Array.isArray(reviews)) {
      items = items.concat(reviews.map(r => {
        const response = responses.find((resp: any) => resp.review_id === r.id);
        return {
          type: 'product',
          id: r.id,
          date: r.created_at,
          rating: r.rating,
          content: r.content,
          productId: r.product_id,
          productName: Array.isArray(products) ? products.find(p => p.id === r.product_id)?.name || 'Unknown Product' : 'Unknown Product',
          response,
        };
      }));
    }
    if ((typeFilter === 'all' || typeFilter === 'blog') && Array.isArray(blogComments)) {
      items = items.concat(blogComments.map(c => ({
        type: 'blog',
        id: c.id,
        date: c.created_at,
        content: c.content,
        postId: c.post_id,
        postTitle: Array.isArray(blogPosts) ? blogPosts.find(p => p.id === c.post_id)?.title || 'Unknown Blog Post' : 'Unknown Blog Post',
      })));
    }
    if (ratingFilter !== null) {
      items = items.filter(i => i.type === 'product' && i.rating === ratingFilter);
    }
    // Responded/not responded filter
    if (responseFilter === 'responded') {
      items = items.filter(i => i.type === 'product' && i.response);
    } else if (responseFilter === 'not_responded') {
      items = items.filter(i => i.type === 'product' && !i.response);
    }
    if (sort === 'recent') {
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sort === 'rating-high') {
      items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'rating-low') {
      items.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    }
    return items;
  }, [reviews, blogComments, products, blogPosts, typeFilter, sort, ratingFilter, responses, responseFilter]);

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <label>
          <span className="mr-2">Type:</span>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="border rounded px-2 py-1">
            <option value="all">All</option>
            <option value="product">Products</option>
            <option value="blog">Blog</option>
          </select>
        </label>
        <label>
          <span className="mr-2">Sort:</span>
          <select value={sort} onChange={e => setSort(e.target.value as any)} className="border rounded px-2 py-1">
            <option value="recent">Most Recent</option>
            <option value="rating-high">Rating High-Low</option>
            <option value="rating-low">Rating Low-High</option>
          </select>
        </label>
        <label>
          <span className="mr-2">Rating:</span>
          <select value={ratingFilter ?? ''} onChange={e => setRatingFilter(e.target.value ? Number(e.target.value) : null)} className="border rounded px-2 py-1">
            <option value="">All</option>
            {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} stars</option>)}
          </select>
        </label>
        <label>
          <span className="mr-2">Response:</span>
          <select value={responseFilter} onChange={e => setResponseFilter(e.target.value as any)} className="border rounded px-2 py-1">
            <option value="all">All</option>
            <option value="responded">Responded</option>
            <option value="not_responded">Not Responded</option>
          </select>
        </label>
      </div>
      <div className="space-y-4">
        {unified.length === 0 ? (
          <div className="text-muted-foreground">No reviews or comments yet.</div>
        ) : (
          unified.map(item => (
            <Card key={item.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{new Date(item.date).toLocaleString()}</span>
                {item.type === 'product' && <span>Product: <b>{item.productName}</b></span>}
                {item.type === 'blog' && <span>Blog: <b>{item.postTitle}</b></span>}
                {item.rating && <span>Rating: <b>{item.rating}</b></span>}
              </div>
              <div className="text-gray-800 whitespace-pre-line">{item.content}</div>
              {/* Brand response UI */}
              {item.type === 'product' && (
                <div className="mt-2 border-t pt-2">
                  <div className="font-semibold mb-1">Brand Response:</div>
                  {editingResponseId === item.id ? (
                    <>
                      <textarea
                        className="w-full border rounded p-2 mb-2"
                        rows={2}
                        value={draftResponse}
                        onChange={e => setDraftResponse(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1 rounded"
                          disabled={saveResponseStatus === 'pending'}
                          onClick={() => {
                            saveResponse({ reviewId: item.id, content: draftResponse });
                            setEditingResponseId(null);
                          }}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1 rounded"
                          onClick={() => setEditingResponseId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : item.response ? (
                    <>
                      <div className="bg-gray-50 border rounded p-2 mb-1 text-gray-800 whitespace-pre-line">{item.response.content}</div>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs text-blue-600 underline"
                          onClick={() => {
                            setEditingResponseId(item.id);
                            setDraftResponse(item.response.content || '');
                          }}
                        >
                          Edit Response
                        </button>
                        <span className="text-xs text-gray-500">Last updated: {new Date(item.response.updated_at || item.response.created_at).toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <button
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1 rounded"
                      onClick={() => {
                        setEditingResponseId(item.id);
                        setDraftResponse('');
                      }}
                    >
                      Respond
                    </button>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 