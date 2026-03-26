import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  MapPin, CheckCircle, ChevronLeft, BedDouble,
  Phone, Mail, ChevronRight, X, Building2, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import InquiryForm from "@/components/InquiryForm";
import ReviewList from "@/components/ReviewList";
import StarRating from "@/components/StarRating";
import ReportDialog from "@/components/ReportDialog";
import SaveButton from "@/components/SaveButton";

const genderLabel: Record<string, string> = {
  male_only: "Male Only",
  female_only: "Female Only",
  mixed: "Mixed",
};

const HostelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [hostel, setHostel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => { loadHostel(); }, [id]);
  useEffect(() => { if (id) loadReviewStats(id); }, [id]);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const requireAuth = (): boolean => {
    if (user) return true;
    const returnTo = encodeURIComponent(location.pathname);
    navigate(`/register?returnTo=${returnTo}`);
    return false;
  };

  // Only used for reviews and reports — contact/inquiry is open to all
  const requireAuthForAction = (reason: string): boolean => {
    if (user) return true;
    const returnTo = encodeURIComponent(location.pathname);
    navigate(`/register?returnTo=${returnTo}&reason=${reason}`);
    return false;
  };

  const loadReviewStats = async (hostelId: string) => {
    const { data: hostelData } = await supabase
      .from('hostels').select('owner_id').eq('id', hostelId).single();
    if (!hostelData?.owner_id) return;
    const { data } = await supabase
      .from('reviews').select('rating').eq('agent_id', hostelData.owner_id);
    if (data && data.length > 0) {
      const avg = data.reduce((s: number, r: any) => s + r.rating, 0) / data.length;
      setReviewStats({ avg, count: data.length });
    }
  };

  const loadHostel = async () => {
    try {
      const { data, error } = await supabase.from('hostels').select('*').eq('id', id).single();
      if (error) throw error;
      setHostel(data);
    } catch {
      toast.error('Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Listing not found</h2>
            <p className="text-muted-foreground mb-4">This listing may have been removed.</p>
            <Button asChild><Link to="/hostels">Back to Listings</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  const hasImages = hostel.images && hostel.images.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Lightbox */}
      {lightboxOpen && hasImages && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <button onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
          {hostel.images.length > 1 && (
            <>
              <button onClick={() => setSelectedImage((p: number) => p === 0 ? hostel.images.length - 1 : p - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-xl">
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button onClick={() => setSelectedImage((p: number) => p === hostel.images.length - 1 ? 0 : p + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-xl">
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}
          <img src={hostel.images[selectedImage]} alt="" className="max-h-[85vh] max-w-full rounded-2xl object-contain" />
          <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-1.5">
            {hostel.images.map((_: string, i: number) => (
              <button key={i} onClick={() => setSelectedImage(i)}
                className={`rounded-full transition-all ${selectedImage === i ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`} />
            ))}
          </div>
        </div>
      )}

      <div className="pt-20 pb-28 lg:pb-16">
        <div className="container mx-auto px-4">

          {/* Back nav */}
          <div className="py-4">
            <button onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              <ChevronLeft className="w-4 h-4" /> Back to listings
            </button>
          </div>

          {/* ══ TITLE — always above images ══ */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {hostel.featured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-accent/15 text-accent border border-accent/25"
                  title="Recommended by our network">
                  <CheckCircle className="w-3 h-3" /> Top Pick
                </span>
              )}
              {hostel.listing_type && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  Per {hostel.listing_type === 'semester' ? 'Semester' : hostel.listing_type === 'annually' ? 'Year (Annually)' : 'Session'}
                </span>
              )}
              {genderLabel[hostel.gender] && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
                  {genderLabel[hostel.gender]}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-3">
              {hostel.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                {hostel.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary/70 shrink-0" />
                {hostel.university}
              </span>
              {hostel.rooms_available > 0 && (
                <span className="flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-primary/70 shrink-0" />
                  {hostel.rooms_available} room{hostel.rooms_available !== 1 ? 's' : ''} available
                </span>
              )}
            </div>

            {reviewStats.count > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={reviewStats.avg} size="sm" />
                <span className="font-bold text-foreground text-sm">{reviewStats.avg.toFixed(1)}</span>
                <span className="text-muted-foreground text-sm">
                  ({reviewStats.count} review{reviewStats.count !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {/* Save button — visible on mobile, desktop has it in sidebar */}
            <div className="lg:hidden mt-3">
              <SaveButton hostelId={hostel.id} user={user} variant="full" />
            </div>
          </div>

          {/* ══ IMAGE GALLERY — below title ══ */}
          {hasImages && (
            <div className="mb-8">
              {/* Desktop */}
              <div className="hidden md:grid grid-cols-[2fr_1fr] gap-2 rounded-2xl overflow-hidden h-[440px]">
                <div className="cursor-pointer overflow-hidden bg-muted group"
                  onClick={() => { setSelectedImage(0); setLightboxOpen(true); }}>
                  <img src={hostel.images[0]} alt={hostel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                {hostel.images.length > 1 && (
                  <div className="grid grid-rows-2 gap-2">
                    {hostel.images.slice(1, 3).map((img: string, i: number) => (
                      <div key={i} className="relative cursor-pointer overflow-hidden bg-muted group"
                        onClick={() => { setSelectedImage(i + 1); setLightboxOpen(true); }}>
                        <img src={img} alt={`View ${i + 2}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        {i === 1 && hostel.images.length > 3 && (
                          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">+{hostel.images.length - 3} more</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {hostel.images.length > 3 && (
                <div className="hidden md:flex gap-2 mt-2 overflow-x-auto pb-1">
                  {hostel.images.map((img: string, i: number) => (
                    <button key={i} onClick={() => { setSelectedImage(i); setLightboxOpen(true); }}
                      className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}>
                      <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              {/* Mobile carousel */}
              <div className="md:hidden relative rounded-2xl overflow-hidden bg-muted">
                <div className="aspect-[4/3]">
                  <img src={hostel.images[selectedImage]} alt={hostel.name}
                    className="w-full h-full object-cover" loading="lazy"
                    onClick={() => setLightboxOpen(true)} />
                </div>
                {hostel.images.length > 1 && (
                  <>
                    <button onClick={() => setSelectedImage((p: number) => p === 0 ? hostel.images.length - 1 : p - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setSelectedImage((p: number) => p === hostel.images.length - 1 ? 0 : p + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                      {hostel.images.map((_: string, i: number) => (
                        <button key={i} onClick={() => setSelectedImage(i)}
                          className={`rounded-full transition-all ${selectedImage === i ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`} />
                      ))}
                    </div>
                  </>
                )}
                <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {selectedImage + 1} / {hostel.images.length}
                </div>
              </div>

              {hostel.images.length > 1 && (
                <div className="md:hidden flex gap-2 mt-2 overflow-x-auto pb-1">
                  {hostel.images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}>
                      <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ MAIN CONTENT ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

            {/* Left */}
            <div className="space-y-6">

              {/* Mobile price + CTA */}
              <div className="lg:hidden bg-card rounded-2xl border border-border p-5">
                <p className="text-xs text-muted-foreground mb-1">
                  Price per {hostel.listing_type === 'semester' ? 'Semester' : hostel.listing_type === 'annually' ? 'Year (Annually)' : 'Session'}
                </p>
                <p className="font-display font-bold text-3xl text-primary mb-4">
                  ₦{hostel.price?.toLocaleString()}
                </p>

                {contactRevealed ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      <p className="text-sm font-semibold text-foreground">Owner Contact Details</p>
                    </div>
                    {hostel.contact_phone && (
                      <a href={`tel:${hostel.contact_phone}`}
                        className="flex items-center gap-3 text-sm p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                        <Phone className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-semibold text-foreground">{hostel.contact_phone}</p>
                        </div>
                      </a>
                    )}
                    {hostel.contact_email && (
                      <a href={`mailto:${hostel.contact_email}`}
                        className="flex items-center gap-3 text-sm p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                        <Mail className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-semibold text-foreground truncate">{hostel.contact_email}</p>
                        </div>
                      </a>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {hostel.contact_phone && (
                        <a href={`tel:${hostel.contact_phone}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
                          <Phone className="w-3.5 h-3.5 text-primary" /> Call
                        </a>
                      )}
                      {hostel.contact_email && (
                        <a href={`mailto:${hostel.contact_email}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
                          <Mail className="w-3.5 h-3.5 text-primary" /> Email
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setInquiryOpen(true)} size="lg"
                    className="w-full gradient-primary border-0 shadow-primary text-primary-foreground font-bold">
                    <MessageSquare className="w-5 h-5 mr-2" /> Contact Owner
                  </Button>
                )}
              </div>

              {/* Description */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display font-bold text-lg text-foreground mb-3">About This Property</h2>
                <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                  {hostel.description}
                </p>
              </div>

              {/* Key details */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display font-bold text-lg text-foreground mb-4">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Price", value: `₦${hostel.price?.toLocaleString()}` },
                    { label: "Payment", value: hostel.listing_type === 'semester' ? 'Per Semester' : hostel.listing_type === 'annually' ? 'Annually / Yearly' : 'Per Session' },
                    { label: "Rooms Available", value: hostel.rooms_available || '—' },
                    { label: "Gender", value: genderLabel[hostel.gender] || 'Not specified' },
                    { label: "University", value: hostel.university?.split('(')[0]?.trim() || '—' },
                    { label: "Location", value: hostel.location || '—' },
                  ].map((item, i) => (
                    <div key={i} className="bg-secondary/50 rounded-xl p-3">
                      <p className="text-[11px] text-muted-foreground mb-0.5">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground leading-snug">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <ReviewList listingId={hostel.id} listingName={hostel.name} agentId={hostel.owner_id} requireAuth={() => requireAuthForAction('review')} />
            </div>

            {/* Right sidebar */}
            <div className="hidden lg:block">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 space-y-5">

                <div className="pb-4 border-b border-border">
                  <p className="text-xs text-muted-foreground mb-1">
                    Price per {hostel.listing_type === 'semester' ? 'Semester' : hostel.listing_type === 'annually' ? 'Year (Annually)' : 'Session'}
                  </p>
                  <p className="font-display font-bold text-3xl text-primary">
                    ₦{hostel.price?.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2.5 pb-4 border-b border-border">
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary/60 shrink-0" />
                    <span className="line-clamp-1">{hostel.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4 text-primary/60 shrink-0" />
                    <span className="line-clamp-2">{hostel.university}</span>
                  </div>
                  {hostel.rooms_available > 0 && (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <BedDouble className="w-4 h-4 text-primary/60 shrink-0" />
                      <span>{hostel.rooms_available} room{hostel.rooms_available !== 1 ? 's' : ''} available</span>
                    </div>
                  )}
                  {reviewStats.count > 0 && (
                    <div className="flex items-center gap-2">
                      <StarRating rating={reviewStats.avg} size="sm" />
                      <span className="text-sm font-semibold text-foreground">{reviewStats.avg.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({reviewStats.count})</span>
                    </div>
                  )}
                </div>

                <Button onClick={() => setInquiryOpen(true)} size="lg"
                  className="w-full gradient-primary border-0 shadow-primary text-primary-foreground font-bold text-base">
                  <MessageSquare className="w-5 h-5 mr-2" /> Contact Owner
                </Button>

                {contactRevealed ? (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      <p className="text-sm font-semibold text-foreground">Owner Contact Details</p>
                    </div>
                    {hostel.contact_phone && (
                      <a href={`tel:${hostel.contact_phone}`}
                        className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors font-medium">
                        <Phone className="w-4 h-4 text-primary shrink-0" />
                        {hostel.contact_phone}
                      </a>
                    )}
                    {hostel.contact_email && (
                      <a href={`mailto:${hostel.contact_email}`}
                        className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors font-medium">
                        <Mail className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{hostel.contact_email}</span>
                      </a>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {hostel.contact_phone && (
                        <a href={`tel:${hostel.contact_phone}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
                          <Phone className="w-3.5 h-3.5 text-primary" /> Call
                        </a>
                      )}
                      {hostel.contact_email && (
                        <a href={`mailto:${hostel.contact_email}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
                          <Mail className="w-3.5 h-3.5 text-primary" /> Email
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center">
                    Submit an inquiry to view owner contact details
                  </p>
                )}

                {/* Save listing */}
                <div className="pt-1">
                  <SaveButton hostelId={hostel.id} user={user} variant="full" className="w-full justify-center" />
                  {!user && (
                    <p className="text-xs text-muted-foreground text-center mt-1.5">
                      Sign in to save this listing
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-border">
                  <ReportDialog hostelId={hostel.id} hostelName={hostel.name}
                    open={reportOpen} onOpenChange={(v) => { if (v && !requireAuthForAction('report')) return; setReportOpen(v); }} triggerButton={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {inquiryOpen && hostel && (
        <InquiryForm
          hostel={{ id: hostel.id, name: hostel.name, owner_id: hostel.owner_id,
            contact_phone: hostel.contact_phone, contact_email: hostel.contact_email }}
          onClose={() => setInquiryOpen(false)}
          onSuccess={() => setContactRevealed(true)}
        />
      )}

      {/* Sticky mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card/95 backdrop-blur-sm border-t border-border px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground leading-none mb-0.5">
              Per {hostel.listing_type === 'semester' ? 'Semester' : hostel.listing_type === 'annually' ? 'Year (Annually)' : 'Session'}
            </p>
            <p className="font-display font-bold text-lg text-primary leading-none">
              ₦{hostel.price?.toLocaleString()}
            </p>
          </div>
          {contactRevealed && hostel.contact_phone ? (
            <a href={`tel:${hostel.contact_phone}`} className="shrink-0">
              <Button size="lg" className="gradient-primary border-0 shadow-primary text-primary-foreground font-bold px-6">
                <Phone className="w-4 h-4 mr-2" /> Call Owner
              </Button>
            </a>
          ) : (
            <Button onClick={() => setInquiryOpen(true)} size="lg"
              className="shrink-0 gradient-primary border-0 shadow-primary text-primary-foreground font-bold px-6">
              <MessageSquare className="w-4 h-4 mr-2" /> Contact Owner
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostelDetail;
