import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Star, MapPin, CheckCircle, ChevronLeft, Wifi, Zap, Shield, Car,
  Droplets, Tv, Dumbbell, UtensilsCrossed, BookOpen, Shirt, Camera,
  Users, Phone, MessageCircle, ChevronRight, X, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hostels, formatPrice, roomTypeLabel } from "@/data/hostels";

const amenityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Wi-Fi": Wifi,
  "Solar Power": Zap,
  "24/7 Security": Shield,
  "Security": Shield,
  "Parking": Car,
  "Borehole Water": Droplets,
  "Smart TV": Tv,
  "Gym": Dumbbell,
  "Kitchen": UtensilsCrossed,
  "Study Room": BookOpen,
  "Laundry": Shirt,
  "CCTV": Camera,
  "Generator": Zap,
  "Backup Generator": Zap,
  "Swimming Pool": Droplets,
};

const genderLabel = {
  male: "Males Only",
  female: "Females Only",
  mixed: "Mixed (Male & Female)",
};

const HostelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const hostel = hostels.find((h) => h.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  if (!hostel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Hostel not found</h2>
          <Button asChild><Link to="/hostels">Back to Listings</Link></Button>
        </div>
      </div>
    );
  }

  const similarHostels = hostels.filter((h) => h.id !== hostel.id && h.university === hostel.university).slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-foreground/95 flex items-center justify-center p-4">
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-primary-foreground p-2 hover:bg-primary-foreground/10 rounded-lg">
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={() => setSelectedImage((p) => (p === 0 ? hostel.images.length - 1 : p - 1))}
            className="absolute left-4 text-primary-foreground p-2 hover:bg-primary-foreground/10 rounded-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img src={hostel.images[selectedImage]} alt="" className="max-h-[80vh] max-w-full rounded-xl object-contain" />
          <button
            onClick={() => setSelectedImage((p) => (p === hostel.images.length - 1 ? 0 : p + 1))}
            className="absolute right-4 text-primary-foreground p-2 hover:bg-primary-foreground/10 rounded-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
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
        <div className="container mx-auto px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-2 rounded-2xl overflow-hidden">
            <div
              className="aspect-[4/3] md:aspect-[3/2] cursor-pointer overflow-hidden"
              onClick={() => { setSelectedImage(0); setLightboxOpen(true); }}
            >
              <img src={hostel.images[0]} alt={hostel.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="hidden md:grid grid-rows-2 gap-2">
              {hostel.images.slice(1, 3).map((img, i) => (
                <div
                  key={i}
                  className="relative cursor-pointer overflow-hidden"
                  onClick={() => { setSelectedImage(i + 1); setLightboxOpen(true); }}
                >
                  <img src={img} alt={`View ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  {i === 1 && hostel.images.length > 3 && (
                    <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold text-sm">+{hostel.images.length - 3} more</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
            {/* Left column */}
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {hostel.verified && (
                    <span className="badge-verified">
                      <CheckCircle className="w-3 h-3" /> Verified Hostel
                    </span>
                  )}
                  <span className="badge-type capitalize">{genderLabel[hostel.gender]}</span>
                </div>
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  {hostel.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {hostel.location}, {hostel.city}, {hostel.state}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="font-semibold text-foreground">{hostel.rating}</span>
                    <span>({hostel.reviewCount} reviews)</span>
                  </span>
                </div>
                <p className="text-primary text-sm font-medium mt-2">{hostel.distance}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Near <strong className="text-foreground">{hostel.university}</strong></span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-card rounded-2xl border border-border p-5 mb-6">
                <h2 className="font-display font-bold text-lg text-foreground mb-3">About This Hostel</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{hostel.description}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  Listed by: <span className="text-foreground font-medium">{hostel.owner}</span>
                </p>
              </div>

              {/* Amenities */}
              <div className="bg-card rounded-2xl border border-border p-5 mb-6">
                <h2 className="font-display font-bold text-lg text-foreground mb-4">Amenities & Facilities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hostel.amenities.map((amenity) => {
                    const Icon = amenityIconMap[amenity] || Building2;
                    return (
                      <div key={amenity} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary/60">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground leading-tight">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Room Types */}
              <div className="bg-card rounded-2xl border border-border p-5 mb-6">
                <h2 className="font-display font-bold text-lg text-foreground mb-4">Available Rooms</h2>
                <div className="space-y-3">
                  {hostel.rooms.map((room) => (
                    <div
                      key={room.type}
                      onClick={() => setSelectedRoom(selectedRoom === room.type ? null : room.type)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedRoom === room.type
                          ? "border-primary bg-secondary"
                          : "border-border hover:border-primary/40 bg-background"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-foreground text-sm">{roomTypeLabel[room.type]}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {room.available} of {room.total} available
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="price-tag text-lg">{formatPrice(room.price)}</p>
                        <p className="text-xs text-muted-foreground">per year</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar Hostels */}
              {similarHostels.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-lg text-foreground mb-4">Other Hostels Near {hostel.university.split(" ").slice(0, 2).join(" ")}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {similarHostels.map((h) => (
                      <Link key={h.id} to={`/hostels/${h.id}`} className="block bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 transition-colors">
                        <img src={h.images[0]} alt={h.name} className="w-full h-36 object-cover" />
                        <div className="p-3">
                          <p className="font-display font-bold text-sm text-foreground">{h.name}</p>
                          <p className="text-xs text-primary font-semibold mt-1">From {formatPrice(h.minPrice)}/yr</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Card */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-card rounded-2xl border border-border shadow-card p-5">
                <div className="mb-4">
                  <p className="text-muted-foreground text-xs mb-1">Starting from</p>
                  <p className="price-tag text-3xl">{formatPrice(hostel.minPrice)}<span className="text-muted-foreground text-sm font-normal">/year</span></p>
                </div>

                {selectedRoom && (
                  <div className="bg-secondary rounded-xl p-3 mb-4 border border-border">
                    <p className="text-xs text-muted-foreground">Selected</p>
                    <p className="font-semibold text-sm text-foreground">{roomTypeLabel[selectedRoom as keyof typeof roomTypeLabel]}</p>
                    <p className="price-tag text-base">
                      {formatPrice(hostel.rooms.find((r) => r.type === selectedRoom)?.price || 0)}/year
                    </p>
                  </div>
                )}

                <div className="space-y-3 mb-5">
                  <Button className="w-full gradient-primary border-0 shadow-primary text-primary-foreground font-semibold h-12" size="lg">
                    Reserve This Room
                  </Button>
                  <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-secondary h-12 font-semibold">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message Owner
                  </Button>
                </div>

                <div className="flex items-center gap-2 p-3 bg-secondary/60 rounded-xl mb-4">
                  <Shield className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your payment is protected. Funds are only released to the owner after you confirm move-in.
                  </p>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    Hostel verified by HostelNG team
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    Free cancellation within 48 hours
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    No hidden charges
                  </div>
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Contact Owner Directly</p>
                  <Button variant="ghost" size="sm" className="w-full text-xs h-9 border border-border hover:border-primary/30">
                    <Phone className="w-3.5 h-3.5 mr-2 text-primary" /> View Phone Number
                  </Button>
                </div>
              </div>

              {/* Share */}
              <p className="text-center text-xs text-muted-foreground mt-4 cursor-pointer hover:text-primary transition-colors">
                Share this hostel listing →
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HostelDetail;
