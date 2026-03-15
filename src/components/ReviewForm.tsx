import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StarRating from '@/components/StarRating';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ReviewFormProps {
  listingId: string;
  listingName: string;
  agentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_CHARS = 300;

const ReviewForm = ({ listingId, listingName, agentId, onClose, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const charsLeft = MAX_CHARS - reviewText.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (!reviewText.trim()) {
      toast.error('Please write a short review');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('reviews').insert([{
        listing_id: listingId,
        agent_id: agentId,
        student_name: isAnonymous ? null : (studentName.trim() || null),
        rating,
        review_text: reviewText.trim(),
        is_anonymous: isAnonymous,
      }]);

      if (error) throw error;

      toast.success('Review submitted — thank you!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Write a Review</h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[260px]">{listingName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Star Rating */}
          <div>
            <Label className="mb-2 block">Your Rating *</Label>
            <div className="flex items-center gap-3">
              <StarRating rating={rating} interactive size="lg" onChange={setRating} />
              {rating > 0 && (
                <span className="text-sm text-muted-foreground">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="reviewer-name" className="mb-1.5 block">Your Name</Label>
            <Input
              id="reviewer-name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Chidi O."
              disabled={isAnonymous}
              className={isAnonymous ? 'opacity-40' : ''}
            />
          </div>

          {/* Anonymous toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-9 h-5 rounded-full transition-colors relative ${isAnonymous ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isAnonymous ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-foreground">Post anonymously</span>
          </label>

          {/* Review Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="review-text">Review *</Label>
              <span className={`text-xs ${charsLeft < 30 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {charsLeft} chars left
              </span>
            </div>
            <Textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Share your experience with this hostel..."
              rows={3}
              className="resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 gradient-primary border-0 shadow-primary text-primary-foreground font-semibold"
            >
              {loading ? 'Submitting...' : (
                <><Send className="w-4 h-4 mr-2" />Submit Review</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
