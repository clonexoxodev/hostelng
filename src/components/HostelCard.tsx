import { Link } from "react-router-dom";
import { Star, MapPin, Users, CheckCircle, Wifi, Zap, Shield } from "lucide-react";
import { Hostel, formatPrice } from "@/data/hostels";
import { Badge } from "@/components/ui/badge";

interface HostelCardProps {
  hostel: Hostel;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Wi-Fi": Wifi,
  "Solar Power": Zap,
  "24/7 Security": Shield,
};

const genderColors = {
  male: "bg-blue-50 text-blue-700 border-blue-200",
  female: "bg-pink-50 text-pink-700 border-pink-200",
  mixed: "bg-secondary text-secondary-foreground border-border",
};

const HostelCard = ({ hostel }: HostelCardProps) => {
  const topAmenities = hostel.amenities.slice(0, 3);

  return (
    <Link to={`/hostels/${hostel.id}`} className="block group">
      <div className="bg-card rounded-2xl overflow-hidden card-hover border border-border/60">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={hostel.images[0]}
            alt={hostel.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />

          {/* Verified badge */}
          {hostel.verified && (
            <div className="absolute top-3 left-3">
              <span className="badge-verified">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            </div>
          )}

          {/* Gender */}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${genderColors[hostel.gender]}`}>
              {hostel.gender === "mixed" ? "Mixed" : `${hostel.gender}s only`}
            </span>
          </div>

          {/* Price bottom overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-primary-foreground text-xs font-medium mb-0.5 drop-shadow-sm">
              Starting from
            </p>
            <p className="price-tag text-lg text-primary-foreground drop-shadow">
              {formatPrice(hostel.minPrice)}
              <span className="text-primary-foreground/80 text-xs font-normal">/year</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-display font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {hostel.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" />
              <span className="text-sm font-semibold text-foreground">{hostel.rating}</span>
              <span className="text-xs text-muted-foreground">({hostel.reviewCount})</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="line-clamp-1">{hostel.location}, {hostel.city}</span>
          </div>
          <p className="text-xs text-primary font-medium mb-3">{hostel.distance}</p>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {topAmenities.map((amenity) => {
              const Icon = amenityIcons[amenity];
              return (
                <span key={amenity} className="amenity-chip text-xs">
                  {Icon && <Icon className="w-3 h-3" />}
                  {amenity}
                </span>
              );
            })}
            {hostel.amenities.length > 3 && (
              <span className="amenity-chip text-xs">+{hostel.amenities.length - 3} more</span>
            )}
          </div>

          {/* University */}
          <div className="flex items-center gap-1.5 pt-3 border-t border-border/60">
            <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground line-clamp-1">{hostel.university}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HostelCard;
