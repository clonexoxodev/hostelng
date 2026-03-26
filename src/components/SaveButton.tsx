import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

interface SaveButtonProps {
  hostelId: string;
  user: any;
  className?: string;
  variant?: 'icon' | 'full';
}

const SaveButton = ({ hostelId, user, className = '', variant = 'full' }: SaveButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) checkSaved();
  }, [user, hostelId]);

  const checkSaved = async () => {
    const { data } = await supabase
      .from('saved_listings')
      .select('id')
      .eq('user_id', user.id)
      .eq('hostel_id', hostelId)
      .maybeSingle();
    setSaved(!!data);
  };

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      const returnTo = encodeURIComponent(location.pathname);
      navigate(`/login?returnTo=${returnTo}&reason=save`);
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        const { error } = await supabase
          .from('saved_listings')
          .delete()
          .eq('user_id', user.id)
          .eq('hostel_id', hostelId);
        if (error) throw error;
        setSaved(false);
        toast.success('Removed from saved listings');
      } else {
        const { error } = await supabase
          .from('saved_listings')
          .insert([{ user_id: user.id, hostel_id: hostelId }]);
        if (error) throw error;
        setSaved(true);
        toast.success('Saved! View in Saved Listings →', {
          action: { label: 'View', onClick: () => navigate('/saved') },
        });
      }
    } catch (err: any) {
      console.error('SaveButton error:', err);
      if (err?.code === '42P01' || err?.message?.includes('does not exist')) {
        toast.error('Saved listings table not set up. Please run the database migration.');
      } else {
        toast.error(err?.message || 'Failed to save. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        title={saved ? 'Remove from saved' : 'Save listing'}
        aria-label={saved ? 'Remove from saved' : 'Save listing'}
        className={`p-1.5 rounded-lg transition-all shadow-sm ${
          saved
            ? 'bg-primary text-primary-foreground'
            : 'bg-background/90 text-muted-foreground hover:bg-primary hover:text-primary-foreground'
        } ${loading ? 'opacity-60' : ''} ${className}`}
      >
        {loading
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : saved
            ? <BookmarkCheck className="w-3.5 h-3.5" />
            : <Bookmark className="w-3.5 h-3.5" />
        }
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? 'Remove from saved' : 'Save listing'}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
        saved
          ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/15'
          : 'bg-background border-border text-foreground hover:border-primary/40 hover:bg-secondary'
      } ${loading ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : saved
          ? <BookmarkCheck className="w-4 h-4 shrink-0" />
          : <Bookmark className="w-4 h-4 shrink-0" />
      }
      {saved ? 'Saved' : 'Save Listing'}
    </button>
  );
};

export default SaveButton;
