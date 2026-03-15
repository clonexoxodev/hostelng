import { Link } from "react-router-dom";
import { Star, MapPin, Users, CheckCircle, Building2, Flag } from "lucide-react";
import ReportDialog from "./ReportDialog";
import { useState } from "react";

interface HostelCardProps {
  hostel: any;
}

const HostelCard = ({ hostel }: HostelCardProps) => {
  const topAmenities = hostel.amenities?.slice(0, 3) || [];
  const hasImages = hostel.images && Array.isArray(hostel.images) && hostel.images.length > 0;
  const imageUrl = hasImages ? hostel.images[0] : null;
  const [showReport, setShowReport] = useState(false);

  const handleFlagClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReport(true);
  };

  return (
    <>
      <Link to={`/hostels/${hostel.id}`} className="block group">
        <div className="bg-card rounded-2xl overflow-hidden card-hover border border-border/60">
          {/* Image */}
          <div className="relative overflow-hidden aspect-[4/3]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={hostel.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />

            {hostel.featured && (
              <div className="absolute top-3 left-3">
                <span className="badge-verified">
                  <CheckCircle className="w-3 h-3" />
                  Featured
                </span>
              </div>
            )}

            {/* Flag button — stops link navigation, opens report */}
            <button
              onClick={handleFlagClick}
              title="Report this listing if it is fake, spam, or inappropriate."
              className="absolute top-3 right-3 p-2 rounded-lg bg-background/90 hover:bg-background text-muted-foreground hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 z-10"
            >
              <Flag className="w-4 h-4" />
            </button>

            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-primary-foreground text-xs font-medium mb-0.5 drop-shadow-sm">
                {hostel.listing_type === 'semester' ? 'Per Semester' : hostel.listing_type === 'session' ? 'Per Session' : 'Price'}
              </p>
              <p className="price-tag text-lg text-primary-foreground drop-shadow">
                ₦{hostel.price?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-display font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
                {hostel.name}
              </h3>
              {hostel.rating > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span className="text-sm font-semibold text-foreground">{hostel.rating}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="line-clamp-1">{hostel.location}</span>
            </div>

            {topAmenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {topAmenities.map((amenity: string, idx: number) => (
                  <span key={idx} className="amenity-chip text-xs">{amenity}</span>
                ))}
                {hostel.amenities && hostel.amenities.length > 3 && (
                  <span className="amenity-chip text-xs">+{hostel.amenities.length - 3} more</span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground line-clamp-1">{hostel.university}</p>
              </div>
              {hostel.rooms_available > 0 && (
                <span className="text-xs text-primary font-medium">{hostel.rooms_available} rooms</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <ReportDialog
        hostelId={hostel.id}
        hostelName={hostel.name}
        open={showReport}
        onOpenChange={setShowReport}
        triggerButton={false}
      />
    </>
  );
};

export default HostelCard;
