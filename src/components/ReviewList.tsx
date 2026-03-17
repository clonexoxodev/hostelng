import { useState, useEffect, useCallback } from 'react';
import { Star, PenLine, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/StarRating';
import ReviewForm from '@/components/ReviewForm';
import { supabase } from '@/lib/supabase';

interface ReviewListProps {
  listingId: string;
  listingName: string;
  agentId: string;
}

const PREVIEW_COUNT = 4;

const ReviewList = ({ listingId, listingName, agentId }: ReviewListProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    // Fetch ALL reviews for this agent across all their listings
    const { data } = await supabase
      .from('reviews')
      .select('*, hostels(name)')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    const normalized = (data || []).map((r: any) => ({
      ...r,
      hostel_title: r.hostels?.name || null,
    }));
    setReviews(normalized);
    setLoading(false);
  }, [agentId]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const displayed = showAll ? reviews : reviews.slice(0, PREVIEW_COUNT);

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-bold text-xl text-foreground">Agent Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5">
              <StarRating rating={avgRating} size="sm" />
              <span className="text-sm font-semibold text-foreground">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({reviews.length})</span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormOpen(true)}
          className="border-primary/30 text-primary hover:bg-primary/5"
        >
          <PenLine className="w-3.5 h-3.5 mr-1.5" />
          Write a Review
        </Button>
      </div>

      {/* Rating breakdown bar */}
      {reviews.length > 0 && (
        <div className="bg-secondary rounded-xl p-4 mb-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-center shrink-0">
            <p className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
            <StarRating rating={avgRating} size="sm" />
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 w-full space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground text-right">{star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-4 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-secondary rounded-xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-secondary rounded-xl p-6 text-center">
          <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No reviews yet for this agent.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((review) => (
            <div key={review.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs font-bold">
                      {review.is_anonymous || !review.student_name
                        ? 'A'
                        : review.student_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {review.is_anonymous || !review.student_name ? 'Anonymous' : review.student_name}
                    </p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-muted-foreground block">
                    {new Date(review.created_at).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                  {review.hostel_title && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground justify-end mt-0.5">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[120px]">{review.hostel_title}</span>
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.review_text}</p>
            </div>
          ))}

          {reviews.length > PREVIEW_COUNT && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2.5 text-sm font-medium text-primary hover:underline"
            >
              {showAll ? 'Show less' : `See all ${reviews.length} reviews`}
            </button>
          )}
        </div>
      )}

      {formOpen && (
        <ReviewForm
          listingId={listingId}
          listingName={listingName}
          agentId={agentId}
          onClose={() => setFormOpen(false)}
          onSuccess={loadReviews}
        />
      )}
    </div>
  );
};

export default ReviewList;
