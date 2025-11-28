import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Camera, Check, ThumbsUp } from 'lucide-react';
import { useReviews, ProductReview } from '@/hooks/useReviews';
import { supabase } from '@/integrations/supabase/client';

interface ProductReviewsProps {
  productId: string;
  userOrderId?: string; // If user purchased this product
}

export const ProductReviews = ({ productId, userOrderId }: ProductReviewsProps) => {
  const { reviews, createReview, uploadReviewPhoto } = useReviews(productId);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const uploadedUrls = await Promise.all(
      Array.from(e.target.files).map(file => uploadReviewPhoto(file, user.id))
    );
    
    setPhotos([...photos, ...uploadedUrls]);
  };

  const handleSubmitReview = async () => {
    if (!userOrderId || !rating) return;
    
    setIsSubmitting(true);
    try {
      await createReview({
        productId,
        orderId: userOrderId,
        rating,
        reviewText: reviewText || undefined,
        reviewPhotos: photos.length > 0 ? photos : undefined
      });
      
      setRating(5);
      setReviewText('');
      setPhotos([]);
      setIsWritingReview(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive = false, onStarClick?: (rating: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= count 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-muted-foreground'
          } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => interactive && onStarClick?.(star)}
        />
      ))}
    </div>
  );

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">{averageRating}</span>
              <span className="text-muted-foreground">({reviews.length} reviews)</span>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Write Review (if purchased) */}
      {userOrderId && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isWritingReview ? (
              <Button onClick={() => setIsWritingReview(true)} className="w-full">
                Share Your Experience
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Rating</label>
                  {renderStars(rating, true, setRating)}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Review (Optional)</label>
                  <Textarea
                    placeholder="Tell us about your experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Add Photos (Optional)</label>
                  <div className="flex gap-2">
                    {photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Review ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                    <label className="w-20 h-20 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-muted">
                      <Camera className="w-6 h-6 text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsWritingReview(false);
                      setRating(5);
                      setReviewText('');
                      setPhotos([]);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={review.buyer?.profile_pic_url} />
                  <AvatarFallback>
                    {review.buyer?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{review.buyer?.display_name || 'Anonymous'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {review.is_verified_purchase && (
                      <Badge variant="secondary" className="gap-1">
                        <Check className="w-3 h-3" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>

                  {renderStars(review.rating)}

                  {review.review_text && (
                    <p className="text-sm leading-relaxed">{review.review_text}</p>
                  )}

                  {review.review_photos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {review.review_photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Review photo ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-80"
                        />
                      ))}
                    </div>
                  )}

                  <Separator />

                  <Button variant="ghost" size="sm" className="gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpful_count})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};