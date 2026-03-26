import { Link } from "react-router-dom";
import { Star, MapPin, Users, CheckCircle, Building2, Flag, BedDouble } from "lucide-react";
import ReportDialog from "./ReportDialog";
import SaveButton from "./SaveButton";
import { useState } from "react";

interface HostelCardProps {
  hostel: any;
  user?: any;
}

const genderLabel: Record<string, string> = {
  male_only: "Male Only",
  female_only: "Female Only",
  mixed: "Mixed",
  not_specified: "",
};

const HostelCard = ({ hostel, user }: HostelCardProps) => {
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
        <div className="bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300">

          {/* Image */}
          <div className="relative overflow-hidden aspect-[4/3]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={hostel.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/8 to-accent/8 flex items-center justify-center">
                <Building2 className="w-14 h-14 text-muted-foreground/20" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 flex gap-1.5">
              {hostel.featured && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground shadow-sm"
                  title="Recommended by our network">
                  <CheckCircle className="w-2.5 h-2.5" />
                  Top Pick
                </span>
              )}
              {genderLabel[hostel.gender] && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-background/90 text-foreground shadow-sm">
                  {genderLabel[hostel.gender]}
                </span>
              )}
            </div>

            {/* Top-right actions: save + flag — always visible */}
            <div className="absolute top-3 right-3 flex gap-1.5">
              <SaveButton hostelId={hostel.id} user={user} variant="icon" className="shadow-sm" />
              <button
                onClick={handleFlagClick}
                title="Report this listing"
                className="p-1.5 rounded-lg bg-background/80 hover:bg-background text-muted-foreground hover:text-red-500 transition-all shadow-sm opacity-0 group-hover:opacity-100"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Price overlay */}
            <div className="absolute bottom-3 left-3">
              <p className="text-white/80 text-[10px] font-medium mb-0.5">
                {hostel.listing_type === 'semester' ? 'Per Semester' : hostel.listing_type === 'session' ? 'Per Session' : hostel.listing_type === 'annually' ? 'Annually / Yearly' : ''}
              </p>
              <p className="text-white font-bold text-lg leading-none drop-shadow">
                ₦{hostel.price?.toLocaleString() || '0'}
              </p>
            </div>

            {/* Rating */}
            {hostel.rating > 0 && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-background/90 rounded-lg px-2 py-1 shadow-sm">
                <Star className="w-3 h-3 fill-accent text-accent" />
                <span className="text-xs font-bold text-foreground">{hostel.rating}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-display font-bold text-sm text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {hostel.name}
            </h3>

            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
              <MapPin className="w-3 h-3 shrink-0 text-primary/60" />
              <span className="line-clamp-1">{hostel.location}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                <Users className="w-3 h-3 shrink-0 text-primary/50" />
                <span className="line-clamp-1 text-[11px]">{hostel.university?.split('(')[0]?.trim()}</span>
              </div>
              {hostel.rooms_available > 0 && (
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <BedDouble className="w-3 h-3 text-primary/60" />
                  <span className="text-[11px] font-semibold text-primary">{hostel.rooms_available} rooms</span>
                </div>
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
