import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductHeader } from './ProductHeader';
import { ProductDetails } from './ProductDetails';
import { AromaticProfileChart } from './AromaticProfileChart';
import { FoodPairings } from './FoodPairings';
import { MoreFromBrand } from './MoreFromBrand';
import { Award, Thermometer, Star, Heart, Scale } from 'lucide-react';
import { useAuth } from '@/contexts/auth/context';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose, ModalDescription } from '@/components/ui/modal';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { getCurrencySymbol } from '@/lib/utils';
import { useUserLists, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useUserLists';
import { Loader2 } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { user, userRole } = useAuth();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editReview, setEditReview] = useState<any | null>(null);
  const [showUserAromatic, setShowUserAromatic] = useState(false);
  const { data: lists = [], isLoading: listsLoading } = useUserLists();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      
      console.log('Fetching product details for ID:', id);
      
      // First try the RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_product_details', { p_id: id });
      
      if (rpcError) {
        console.error('RPC error:', rpcError);
        // Fallback to direct query
        const { data: directData, error: directError } = await supabase
          .from('products')
          .select(`
            *,
            brands (*),
            categories (*),
            product_properties (
              property_type_id,
              value,
              property_types (name)
            ),
            product_awards (*)
          `)
          .eq('id', id)
          .single();
          
        if (directError) {
          console.error('Direct query error:', directError);
          throw directError;
        }
        
        console.log('Direct query result:', directData);
        return directData;
      }
      
      console.log('RPC result:', rpcData);
      
      const productData = rpcData?.[0] || null;
      
      if (!productData) {
        console.error('No product data found for ID:', id);
        throw new Error('Product not found');
      }
      
      return productData;
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      console.log('Retrying product fetch, attempt:', failureCount + 1, 'error:', error);
      return failureCount < 3;
    },
  });

  // Only compute wishlist state if product is loaded
  const wishlist = lists.find(l => l.name === 'Wishlist');
  const isWishlisted = product && wishlist && wishlist.product_ids?.includes(product.id);
  const wishlistLoading = addToWishlist.isPending || removeFromWishlist.isPending;

  // Helper: check if user is eligible to review
  const isEligible = user && userRole === 'end_user' && user.email && (user.email_confirmed_at || user.confirmed_at);

  // Review form logic
  const reviewForm = useForm({
    defaultValues: {
      rating: 5,
      content: '',
      rating_body: undefined,
      rating_acidity: undefined,
      rating_tannin: undefined,
      rating_sweetness: undefined,
      rating_fruity: undefined,
    },
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews for this product
  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: product ? ['product_reviews', product.id] : [],
    queryFn: async () => {
      if (!product?.id) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles: user_id (full_name)')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!product?.id,
  });

  // Fetch review responses for these reviews
  const reviewIds = Array.isArray(reviews) ? reviews.map((r: any) => r.id) : [];
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

  // Edit form logic
  const editForm = useForm({
    defaultValues: {
      rating: 5,
      content: '',
      rating_body: undefined,
      rating_acidity: undefined,
      rating_tannin: undefined,
      rating_sweetness: undefined,
      rating_fruity: undefined,
    },
  });
  useEffect(() => {
    if (editReview) {
      editForm.reset({
        rating: editReview.rating,
        content: editReview.content,
        rating_body: editReview.rating_body,
        rating_acidity: editReview.rating_acidity,
        rating_tannin: editReview.rating_tannin,
        rating_sweetness: editReview.rating_sweetness,
        rating_fruity: editReview.rating_fruity,
      });
    }
  }, [editReview]);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Compute average rating and user-generated aromatic profile
  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(2) : null;
  const userAromaticProfile = (() => {
    if (!reviews.length) return null;
    const keys = ['rating_body', 'rating_acidity', 'rating_tannin', 'rating_sweetness', 'rating_fruity'];
    const result: { subject: string; value: number }[] = [];
    keys.forEach((key, idx) => {
      const label = ['Body', 'Acidity', 'Tannin', 'Sweetness', 'Fruit'][idx];
      const values = reviews.map(r => Number(r[key])).filter(v => !isNaN(v));
      if (values.length) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        result.push({ subject: label, value: Number(avg.toFixed(2)) });
      } else {
        result.push({ subject: label, value: 1 });
      }
    });
    return result;
  })();

  // Helper to render stars for average rating
  function renderStars(rating: number) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400 inline-block" />);
    }
    if (halfStar) {
      stars.push(<Star key="half" className="w-5 h-5 text-yellow-400 fill-yellow-400 inline-block opacity-50" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i + 5} className="w-5 h-5 text-gray-300 inline-block" />);
    }
    return stars;
  }

  async function onSubmitReview(values) {
    setSubmitting(true);
    try {
      if (!product?.id) throw new Error('Product not loaded');
      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        product_id: product.id,
        rating: values.rating,
        content: values.content,
        rating_body: values.rating_body,
        rating_acidity: values.rating_acidity,
        rating_tannin: values.rating_tannin,
        rating_sweetness: values.rating_sweetness,
        rating_fruity: values.rating_fruity,
        status: 'approved',
      });
      if (error) throw error;
      setReviewModalOpen(false);
      reviewForm.reset();
      await refetchReviews();
    } catch (e) {
      alert('Failed to submit review: ' + (e.message || e));
    } finally {
      setSubmitting(false);
    }
  }

  async function onEditReviewSubmit(values: any) {
    setEditSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').update({
        rating: values.rating,
        content: values.content,
        rating_body: values.rating_body,
        rating_acidity: values.rating_acidity,
        rating_tannin: values.rating_tannin,
        rating_sweetness: values.rating_sweetness,
        rating_fruity: values.rating_fruity,
      }).eq('id', editReview.id);
      if (error) throw error;
      setEditReview(null);
      await refetchReviews();
    } catch (e) {
      alert('Failed to update review: ' + (e.message || e));
    } finally {
      setEditSubmitting(false);
    }
  }

  // Compare context logic (after product is defined)
  const { compareList, addToCompare, removeFromCompare, isCompared, max } = useCompare();
  const compared = product && isCompared(product.id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('ProductPage error:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'The requested product could not be found.'}
          </p>
          <p className="text-sm text-gray-500">Product ID: {id}</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Product Not Found</h1>
          <p className="text-gray-600">The requested product could not be found.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Map product_properties to a flat object for purchase link
  let purchaseLink = (product as any)?.purchase_link;
  if (!purchaseLink && 'product_properties' in product && Array.isArray(product.product_properties)) {
    const propertiesMap: { [key: string]: string } = {};
    product.product_properties.forEach((prop: any) => {
      const propertyName = prop.property_types?.name;
      if (propertyName) {
        propertiesMap[propertyName] = prop.value;
      }
    });
    purchaseLink = propertiesMap['Purchase Link'];
    console.log('DEBUG: product_properties', product.product_properties);
    console.log('DEBUG: purchaseLink', purchaseLink);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Product image */}
        <div className="flex flex-col h-full">
          <ProductHeader product={product} />
        </div>
        {/* Right: All info */}
        <div className="flex flex-col h-full gap-4">
          {/* Header row: name, awards, tags, price, purchase (only once) */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold mr-2">{product.name}</h1>
                {averageRating && (
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-semibold text-orange-700">{averageRating}</span>
                    {renderStars(Number(averageRating))}
                    <span className="text-xs text-gray-500 ml-1">({reviews.length})</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {'product_awards' in product && Array.isArray(product.product_awards) && product.product_awards.map((award: any, idx: number) => (
                  <span key={idx} className="flex items-center bg-yellow-100 text-yellow-800 rounded px-2 py-1 text-xs font-semibold"><Award className="w-4 h-4 mr-1" />{award.name} {award.year && <span>({award.year})</span>}</span>
                ))}
                {'is_vegan' in product && product.is_vegan && <span className="bg-gray-100 rounded px-2 py-1 text-xs">Vegan</span>}
                {'is_gluten_free' in product && product.is_gluten_free && <span className="bg-gray-100 rounded px-2 py-1 text-xs">Gluten Free</span>}
                {'is_alcohol_free' in product && product.is_alcohol_free && <span className="bg-gray-100 rounded px-2 py-1 text-xs">Alcohol Free</span>}
              </div>
              {/* Wishlist and Compare Buttons */}
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={wishlistLoading || listsLoading}
                  onClick={() => {
                    if (!user) return;
                    if (isWishlisted) {
                      removeFromWishlist.mutate(product.id);
                    } else {
                      addToWishlist.mutate(product.id);
                    }
                  }}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {wishlistLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className="h-5 w-5" stroke={isWishlisted ? '#dc2626' : 'currentColor'} fill={isWishlisted ? '#dc2626' : 'none'} />
                  )}
                </Button>
                <Button
                  variant={compared ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (!product) return;
                    if (compared) {
                      removeFromCompare(product.id);
                    } else if (compareList.length < max) {
                      addToCompare(product);
                    }
                  }}
                  aria-label={compared ? 'Remove from compare' : 'Add to compare'}
                >
                  <Scale className={`h-5 w-5 ${compared ? 'text-orange-600' : ''}`} />
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 min-w-[180px]">
              {'price' in product && product.price && (
                <span className="text-2xl font-bold">{getCurrencySymbol(product.currency || 'USD')} {product.price}</span>
              )}
              {purchaseLink && (
                <a href={purchaseLink} target="_blank" rel="noopener noreferrer">
                  <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 rounded shadow">BUY NOW</button>
                </a>
              )}
            </div>
          </div>
          {/* Aromatic Profile at top, Product Details below, both full width */}
          <div className="flex flex-col gap-4 h-full justify-between">
            <div className="bg-white rounded-lg border p-6 relative">
              <AromaticProfileChart product={showUserAromatic ? undefined : product} data={showUserAromatic ? userAromaticProfile : undefined} />
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 px-3 py-1 rounded shadow border">
                <span className="text-xs text-muted-foreground">Aromatic Profile:</span>
                <Switch checked={showUserAromatic} onCheckedChange={setShowUserAromatic} />
                <span className="text-xs text-muted-foreground">{showUserAromatic ? 'User' : 'Brand'}</span>
              </div>
            </div>
            <ProductDetails product={product} />
          </div>
        </div>
      </div>
      {/* Full width Food Pairings */}
      <div className="mt-8">
        <FoodPairings productId={product.id} />
      </div>
      {/* Full width Description, only once, same width as right column */}
      {product.description && (
        <div className="bg-white rounded-lg border p-6 mt-8 max-w-5xl mx-auto">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">{product.description}</p>
        </div>
      )}
      <MoreFromBrand brandId={product.brand_id} currentProductId={product.id} />
      {/* Product Reviews Section */}
      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-muted-foreground">No reviews yet. Be the first to leave one!</div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review: any) => (
              <div key={review.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{review.profiles?.full_name || 'User'}</span>
                  <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleString()}</span>
                  <span className="font-semibold ml-4">Rating:</span>
                  <span className="text-orange-600 font-bold">{review.rating} / 5</span>
                </div>
                <div className="mb-2 text-gray-800 whitespace-pre-line">{review.content}</div>
                {(review.rating_body || review.rating_acidity || review.rating_tannin || review.rating_sweetness || review.rating_fruity) && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold">Aromatic Profile:</span>
                    <ul className="ml-4 list-disc">
                      {review.rating_body && <li>Body: {review.rating_body}/10</li>}
                      {review.rating_acidity && <li>Acidity: {review.rating_acidity}/10</li>}
                      {review.rating_tannin && <li>Tannin: {review.rating_tannin}/10</li>}
                      {review.rating_sweetness && <li>Sweetness: {review.rating_sweetness}/10</li>}
                      {review.rating_fruity && <li>Fruity: {review.rating_fruity}/10</li>}
                    </ul>
                  </div>
                )}
                {/* Brand Response */}
                {(() => {
                  const resp = responses.find((r: any) => r.review_id === review.id);
                  return resp ? (
                    <div className="mt-4 bg-gray-50 border-l-4 border-orange-400 p-3">
                      <div className="font-semibold text-orange-700 mb-1">Brand Response:</div>
                      <div className="text-gray-800 whitespace-pre-line">{resp.content}</div>
                      <div className="text-xs text-gray-500 mt-1">{resp.updated_at ? `Updated: ${new Date(resp.updated_at).toLocaleString()}` : `Created: ${new Date(resp.created_at).toLocaleString()}`}</div>
                    </div>
                  ) : null;
                })()}
                {/* Edit button for user's own review */}
                {user && review.user_id === user.id && (
                  <button
                    className="text-xs text-blue-600 underline ml-2"
                    onClick={() => setEditReview(review)}
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Add review button and modal */}
      {isEligible && (
        <div className="my-6 flex justify-end">
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setReviewModalOpen(true)}>
            Leave a Review
          </Button>
        </div>
      )}
      <Modal open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <ModalContent aria-describedby="review-modal-desc">
          <ModalHeader>
            <ModalTitle>Leave a Review</ModalTitle>
            <ModalDescription id="review-modal-desc" className="sr-only">
              Leave a review for this product.
            </ModalDescription>
          </ModalHeader>
          <Form {...reviewForm}>
            <form onSubmit={reviewForm.handleSubmit(onSubmitReview)} className="space-y-4">
              <FormField
                control={reviewForm.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5)</FormLabel>
                    <FormControl>
                      <Slider min={1} max={5} step={1} value={[field.value]} onValueChange={v => field.onChange(v[0])} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={reviewForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Write your review..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="border-t pt-4 mt-4">
                <div className="font-semibold mb-2">Aromatic Profile (optional, 1-10)</div>
                {[
                  { key: 'rating_body', label: 'Body' },
                  { key: 'rating_acidity', label: 'Acidity' },
                  { key: 'rating_tannin', label: 'Tannin' },
                  { key: 'rating_sweetness', label: 'Sweetness' },
                  { key: 'rating_fruity', label: 'Fruity' },
                ].map(({ key, label }) => (
                  <FormField
                    key={key}
                    control={reviewForm.control}
                    name={key as 'rating_body' | 'rating_acidity' | 'rating_tannin' | 'rating_sweetness' | 'rating_fruity'}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Slider min={1} max={10} step={1} value={[field.value || 1]} onValueChange={v => field.onChange(v[0])} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <ModalFooter>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
                <ModalClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </ModalClose>
              </ModalFooter>
            </form>
          </Form>
        </ModalContent>
      </Modal>
      {/* Edit Review Modal */}
      <Modal open={!!editReview} onOpenChange={open => { if (!open) setEditReview(null); }}>
        <ModalContent aria-describedby="edit-review-modal-desc">
          <ModalHeader>
            <ModalTitle>Edit Your Review</ModalTitle>
            <ModalDescription id="edit-review-modal-desc" className="sr-only">
              Edit your review for this product.
            </ModalDescription>
          </ModalHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditReviewSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5)</FormLabel>
                    <FormControl>
                      <Slider min={1} max={5} step={1} value={[field.value]} onValueChange={v => field.onChange(v[0])} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Write your review..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="border-t pt-4 mt-4">
                <div className="font-semibold mb-2">Aromatic Profile (optional, 1-10)</div>
                {[
                  { key: 'rating_body', label: 'Body' },
                  { key: 'rating_acidity', label: 'Acidity' },
                  { key: 'rating_tannin', label: 'Tannin' },
                  { key: 'rating_sweetness', label: 'Sweetness' },
                  { key: 'rating_fruity', label: 'Fruity' },
                ].map(({ key, label }) => (
                  <FormField
                    key={key}
                    control={editForm.control}
                    name={key as 'rating_body' | 'rating_acidity' | 'rating_tannin' | 'rating_sweetness' | 'rating_fruity'}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Slider min={1} max={10} step={1} value={[field.value || 1]} onValueChange={v => field.onChange(v[0])} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <ModalFooter>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={editSubmitting}>
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <ModalClose asChild>
                  <Button type="button" variant="outline" onClick={() => setEditReview(null)}>Cancel</Button>
                </ModalClose>
              </ModalFooter>
            </form>
          </Form>
        </ModalContent>
      </Modal>
    </div>
  );
}
