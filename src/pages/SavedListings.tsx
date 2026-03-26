import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bookmark, BookmarkCheck, Building2, MapPin,
  BedDouble, Trash2, ExternalLink, AlertCircle, RefreshCw, Copy, CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const SETUP_SQL = `CREATE TABLE IF NOT EXISTS saved_listings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hostel_id  UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, hostel_id)
);
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own saved listings" ON saved_listings;
CREATE POLICY "Users manage own saved listings"
  ON saved_listings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);`;

const listingTypeLabel: Record<string, string> = {
  semester: 'Per Semester',
  session: 'Per Session',
  annually: 'Annually / Yearly',
};

const SavedListings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
      if (session?.user) loadSaved(session.user.id);
      else setLoading(false);
    });
  }, []);

  const loadSaved = useCallback(async (userId: string) => {
    setLoading(true);
    setDbError(null);

    const { data: rows, error: rowsErr } = await supabase
      .from('saved_listings')
      .select('id, hostel_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (rowsErr) {
      setDbError(rowsErr.message);
      setLoading(false);
      return;
    }

    if (!rows || rows.length === 0) { setSaved([]); setLoading(false); return; }

    const hostelIds = rows.map((r: any) => r.hostel_id);
    const { data: hostels, error: hostelErr } = await supabase
      .from('hostels')
      .select('id, name, location, price, listing_type, images, rooms_available, university')
      .in('id', hostelIds);

    if (hostelErr) { setDbError(hostelErr.message); setLoading(false); return; }

    const map = Object.fromEntries((hostels || []).map((h: any) => [h.id, h]));
    setSaved(rows.map((r: any) => ({ ...r, hostel: map[r.hostel_id] || null })));
    setLoading(false);
  }, []);

  const remove = async (savedId: string, hostelId: string) => {
    setRemovingId(hostelId);
    const { error } = await supabase.from('saved_listings').delete().eq('id', savedId);
    if (error) { toast.error('Failed to remove: ' + error.message); }
    else { setSaved(prev => prev.filter(s => s.id !== savedId)); toast.success('Removed from saved listings'); }
    setRemovingId(null);
  };

  const copySQL = async () => {
    await navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Not logged in ────────────────────────────────────────────────────────
  if (authChecked && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-primary/50" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Saved Listings</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Please log in to view your saved listings.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="gradient-primary border-0 shadow-primary text-primary-foreground" asChild>
                <Link to="/login?reason=save">Log In</Link>
              </Button>
              <Button variant="outline" className="border-primary/30 text-primary" asChild>
                <Link to="/register?reason=save">Create Account</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Create a free account to save listings and access them anytime, on any device.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading your saved listings…</p>
        </div>
      </div>
    );
  }

  // ── DB Error ─────────────────────────────────────────────────────────────
  if (dbError) {
    const isTableMissing = dbError.includes('does not exist') || dbError.includes('relation') || dbError.includes('42P01');
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="flex items-center gap-2.5 mb-6">
              <Bookmark className="w-6 h-6 text-primary" />
              <h1 className="font-display text-2xl font-bold text-foreground">Saved Listings</h1>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    {isTableMissing ? 'Database table not set up yet' : 'Database error'}
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
                    {isTableMissing
                      ? 'The saved_listings table needs to be created in Supabase. Copy the SQL below and run it in your Supabase SQL Editor.'
                      : `Error: ${dbError}`}
                  </p>

                  {isTableMissing && (
                    <>
                      <div className="relative mb-4">
                        <pre className="bg-amber-100 dark:bg-amber-900/50 rounded-xl p-4 text-xs text-amber-900 dark:text-amber-200 overflow-x-auto whitespace-pre-wrap font-mono">
                          {SETUP_SQL}
                        </pre>
                        <button
                          onClick={copySQL}
                          className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:bg-amber-300 transition-colors"
                        >
                          {copied ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy SQL</>}
                        </button>
                      </div>
                      <ol className="text-sm text-amber-800 dark:text-amber-300 space-y-1 mb-4 list-decimal list-inside">
                        <li>Click "Copy SQL" above</li>
                        <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-semibold">supabase.com/dashboard</a></li>
                        <li>Open your project → SQL Editor</li>
                        <li>Paste and click Run</li>
                        <li>Come back and click "Try Again" below</li>
                      </ol>
                    </>
                  )}

                  <div className="flex gap-3">
                    <Button size="sm" className="gradient-primary border-0 text-primary-foreground"
                      onClick={() => user && loadSaved(user.id)}>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Again
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/hostels">Browse Listings</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <Bookmark className="w-6 h-6 text-primary" />
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Saved Listings</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                {saved.length} saved listing{saved.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-primary/30 text-primary self-start sm:self-auto" asChild>
              <Link to="/hostels">Browse More Listings</Link>
            </Button>
          </div>

          {/* Empty state */}
          {saved.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 sm:p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                You haven't saved any listings yet
              </h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                Browse listings and click the{' '}
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <Bookmark className="w-3.5 h-3.5" /> Save Listing
                </span>{' '}
                button on any property to bookmark it here.
              </p>
              <Button className="gradient-primary border-0 shadow-primary text-primary-foreground" asChild>
                <Link to="/hostels">Browse Listings</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {saved.map((item) => {
                const hostel = item.hostel;
                if (!hostel) return null;
                const img = hostel.images?.[0];
                const isRemoving = removingId === hostel.id;

                return (
                  <div key={item.id}
                    className={`bg-card rounded-2xl border border-border overflow-hidden hover:shadow-card-hover transition-all group ${isRemoving ? 'opacity-40 pointer-events-none' : ''}`}>

                    <Link to={`/hostels/${hostel.id}`}>
                      <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                        {img ? (
                          <img src={img} alt={hostel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-muted-foreground/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full">
                          <BookmarkCheck className="w-3 h-3" /> Saved
                        </div>
                        <div className="absolute bottom-2.5 left-3">
                          <p className="text-[10px] text-white/75 mb-0.5">{listingTypeLabel[hostel.listing_type] || ''}</p>
                          <p className="text-white font-bold text-base leading-none drop-shadow">
                            ₦{hostel.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link to={`/hostels/${hostel.id}`}>
                        <h3 className="font-display font-bold text-sm text-foreground line-clamp-1 mb-1.5 group-hover:text-primary transition-colors">
                          {hostel.name}
                        </h3>
                      </Link>
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0 text-primary/60" />
                          <span className="line-clamp-1">{hostel.location}</span>
                        </div>
                        {hostel.rooms_available > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <BedDouble className="w-3 h-3 shrink-0 text-primary/60" />
                            <span>{hostel.rooms_available} room{hostel.rooms_available !== 1 ? 's' : ''} available</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-border">
                        <Button variant="outline" size="sm"
                          className="flex-1 text-xs h-8 border-primary/30 text-primary hover:bg-primary/5" asChild>
                          <Link to={`/hostels/${hostel.id}`}>
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Listing
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm"
                          className="text-xs h-8 px-3 border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5"
                          onClick={() => remove(item.id, hostel.id)}
                          disabled={isRemoving}>
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SavedListings;
