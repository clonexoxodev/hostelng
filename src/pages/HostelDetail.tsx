import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Star, MapPin, CheckCircle, ChevronLeft,
  Users, Phone, Mail, ChevronRight, X, Building2, MessageSquare
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

const HostelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    loadHostel();
  }, [id]);

  useEffect(() => {
    if (id) loadReviewStats(id);
  }, [id]);

  const loadReviewStats = async (hostelId: string) => {
    const { data } = await supabase
      .from('reviews')
      .select('rating')
      .eq('listing_id', hostelId);
    if (data && data.length > 0) {
      const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;
      setReviewStats({ avg, count: data.length });
    }
  };

  const loadHostel = async () => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setHostel(data);
    } catch (error: any) {
      console.error('Failed to load hostel:', error);
      toast.error('Failed to load hostel details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Hostel not found</h2>
            <p className="text-muted-foreground mb-4">The hostel you're looking for doesn't exist.</p>
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
        <div className="fixed inset-0 z-[100] bg-foreground/95 flex items-center justify-center p-4">
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-primary-foreground p-2 hover:bg-primary-foreground/10 rounded-lg">
            <X className="w-6 h-6" />
          </button>
          {hostel.images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImage((p) => (p === 0 ? hostel.images.length - 1 : p - 1))}
                className="absolute left-4 text-primary-foreground p-2 hover:bg-primary-foreground/10 rounded-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setSelectedImage((p) => (p === hostel.images.length - 1 ? 0 : p + 1))}
                className="absolute right-4 text-primary-foreground p-2 hover:bg-primary-foreground/10 rounded-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <img src={hostel.images[selectedImage]} alt="" className="max-h-[80vh] max-w-full rounded-xl object-contain" />
          <div className="absolute bottom-4 text-primary-foreground text-sm">{selectedImage + 1} / {hostel.images.length}</div>
        </div>
      )}

      <div className="pt-20">
        {/* Back */}
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to listings
          </button>
        </div>

        {/* Image Gallery */}
        {hasImages && (
          <div className="container mx-auto px-4 mb-8">
            {/* Desktop: hero + side grid */}
            <div className="hidden md:grid grid-cols-[2fr_1fr] gap-2 rounded-2xl overflow-hidden h-[420px]">
              {/* Main image */}
              <div
                className="cursor-pointer overflow-hidden bg-muted"
                onClick={() => { setSelectedImage(0); setLightboxOpen(true); }}
              >
                <img
                  src={hostel.images[0]}
                  alt={hostel.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Side thumbnails */}
              {hostel.images.length > 1 && (
                <div className="grid grid-rows-2 gap-2">
                  {hostel.images.slice(1, 3).map((img: string, i: number) => (
                    <div
                      key={i}
                      className="relative cursor-pointer overflow-hidden bg-muted"
                      onClick={() => { setSelectedImage(i + 1); setLightboxOpen(true); }}
                    >
                      <img
                        src={img}
                        alt={`View ${i + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {i === 1 && hostel.images.length > 3 && (
                        <div
                          className="absolute inset-0 bg-foreground/60 flex items-center justify-center cursor-pointer"
                          onClick={() => { setSelectedImage(i + 1); setLightboxOpen(true); }}
                        >
                          <span className="text-white font-semibold text-sm">+{hostel.images.length - 3} more</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop thumbnail strip (if more than 3 images) */}
            {hostel.images.length > 3 && (
              <div className="hidden md:flex gap-2 mt-2 overflow-x-auto pb-1">
                {hostel.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedImage(i); setLightboxOpen(true); }}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* Mobile: carousel */}
            <div className="md:hidden relative rounded-2xl overflow-hidden bg-muted">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={hostel.images[selectedImage]}
                  alt={hostel.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  loading="lazy"
                  onClick={() => setLightboxOpen(true)}
                />
              </div>

              {/* Carousel arrows */}
              {hostel.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((p) => (p === 0 ? hostel.images.length - 1 : p - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((p) => (p === hostel.images.length - 1 ? 0 : p + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {hostel.images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {hostel.images.map((_: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`rounded-full transition-all ${
                        selectedImage === i ? "w-4 h-2 bg-white" : "w-2 h-2 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Image counter */}
              <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {selectedImage + 1} / {hostel.images.length}
              </div>
            </div>

            {/* Mobile thumbnail strip */}
            {hostel.images.length > 1 && (
              <div className="md:hidden flex gap-2 mt-2 overflow-x-auto pb-1">
                {hostel.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            {/* Left Column */}
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {hostel.featured && (
                    <span className="badge-verified" title="Recommended by our agent network">
                      <CheckCircle className="w-3 h-3" />
                      Top Pick
                    </span>
                  )}
                </div>
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  {hostel.name}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{hostel.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    <span>{hostel.university}</span>
                  </div>
                </div>
                {reviewStats.count > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <StarRating rating={reviewStats.avg} size="sm" />
                    <span className="font-semibold text-foreground text-sm">{reviewStats.avg.toFixed(1)}</span>
                    <span className="text-muted-foreground text-sm">({reviewStats.count} review{reviewStats.count !== 1 ? 's' : ''})</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="font-display font-bold text-xl text-foreground mb-3">About This Hostel</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {hostel.description}
                </p>
              </div>

              {/* Amenities */}
              {hostel.amenities && hostel.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-display font-bold text-xl text-foreground mb-4">Amenities & Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {hostel.amenities.map((amenity: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms Available */}
              {hostel.rooms_available > 0 && (
                <div className="mb-8">
                  <h2 className="font-display font-bold text-xl text-foreground mb-3">Availability</h2>
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">
                        {hostel.rooms_available} rooms currently available
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews */}
              <ReviewList
                listingId={hostel.id}
                listingName={hostel.name}
                agentId={hostel.owner_id}
              />
            </div>

            {/* Right Column - Booking Card */}
            <div>
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <div className="mb-5">
                  <p className="text-muted-foreground text-xs mb-1">
                    Price per {hostel.listing_type === 'semester' ? 'Semester' : 'Session'}
                  </p>
                  <p className="price-tag text-3xl">
                    ₦{hostel.price?.toLocaleString()}
                    <span className="text-muted-foreground text-sm font-normal">
                      /{hostel.listing_type || 'year'}
                    </span>
                  </p>
                </div>

                {/* Primary CTA - Contact Agent */}
                <Button
                  onClick={() => setInquiryOpen(true)}
                  size="lg"
                  className="w-full gradient-primary border-0 shadow-primary text-primary-foreground font-bold text-base mb-3"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Contact Agent
                </Button>

                <div className="grid grid-cols-2 gap-2 mb-5">
                  <a
                    href={`tel:${hostel.contact_phone}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                    Call
                  </a>
                  <a
                    href={`mailto:${hostel.contact_email}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </a>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <h3 className="font-display font-bold text-sm text-foreground mb-3">Contact Information</h3>
                  {hostel.contact_phone && (
                    <a href={`tel:${hostel.contact_phone}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="w-4 h-4" />
                      <span>{hostel.contact_phone}</span>
                    </a>
                  )}
                  {hostel.contact_email && (
                    <a href={`mailto:${hostel.contact_email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="w-4 h-4" />
                      <span>{hostel.contact_email}</span>
                    </a>
                  )}
                  <div className="pt-2 border-t border-border">
                    <ReportDialog
                      hostelId={hostel.id}
                      hostelName={hostel.name}
                      open={reportOpen}
                      onOpenChange={setReportOpen}
                      triggerButton={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Inquiry Form Modal */}
      {inquiryOpen && hostel && (
        <InquiryForm
          hostel={{
            id: hostel.id,
            name: hostel.name,
            owner_id: hostel.owner_id,
            contact_phone: hostel.contact_phone,
            contact_email: hostel.contact_email,
          }}
          onClose={() => setInquiryOpen(false)}
        />
      )}

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card border-t border-border p-4 shadow-lg">
        <Button
          onClick={() => setInquiryOpen(true)}
          size="lg"
          className="w-full gradient-primary border-0 shadow-primary text-primary-foreground font-bold text-base"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Contact Agent
        </Button>
      </div>
    </div>
  );
};

export default HostelDetail;
