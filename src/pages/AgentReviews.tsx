import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, ArrowUpDown, Building2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarRating from '@/components/StarRating';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type SortKey = 'newest' | 'highest' | 'lowest';

const AgentReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>('newest');
  const [filterListing, setFilterListing] = useState('all');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }
    loadReviews(session.user.id);
  };

  const loadReviews = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('agent_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Unique listings for filter dropdown
  const listings = Array.from(
    new Map(reviews.map((r) => [r.listing_id, r.hostel_title || r.listing_id])).entries()
  );

  const filtered = filterListing === 'all'
    ? reviews
    : reviews.filter((r) => r.listing_id === filterListing);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'highest') return b.rating - a.rating;
    if (sort === 'lowest') return a.rating - b.rating;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                My Reviews
              </h1>
              <p className="text-muted-foreground text-sm">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''} across your listings
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/dashboard">My Listings</Link>
            </Button>
          </div>

          {/* Summary card */}
          {reviews.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center gap-5">
              <div className="text-center shrink-0">
                <p className="text-5xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
                <StarRating rating={avgRating} size="md" />
                <p className="text-xs text-muted-foreground mt-1">Overall rating</p>
              </div>
              <div className="flex-1 w-full space-y-1.5">
                {ratingCounts.map(({ star, count }) => {
                  const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-right text-muted-foreground">{star}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-5 text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Controls */}
          {reviews.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-5">
              {/* Listing filter */}
              <select
                value={filterListing}
                onChange={(e) => setFilterListing(e.target.value)}
                className="text-sm px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Listings ({reviews.length})</option>
                {listings.map(([id, title]) => (
                  <option key={id} value={id}>{title}</option>
                ))}
              </select>

              {/* Sort */}
              <div className="flex gap-1.5">
                {(['newest', 'highest', 'lowest'] as SortKey[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      sort === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Review list */}
          {sorted.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Star className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-foreground mb-2">No reviews yet</h3>
              <p className="text-muted-foreground text-sm">
                Reviews from students will appear here once they rate your listings.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((review) => (
                <div key={review.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-sm">
                          {review.is_anonymous || !review.student_name
                            ? 'A'
                            : review.student_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {review.is_anonymous || !review.student_name ? 'Anonymous' : review.student_name}
                        </p>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.created_at).toLocaleDateString('en-NG', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </div>
                      {review.hostel_title && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end mt-0.5">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate max-w-[140px]">{review.hostel_title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.review_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AgentReviews;
