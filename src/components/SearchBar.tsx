import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, GraduationCap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { universities } from "@/data/hostels";

interface SearchBarProps {
  compact?: boolean;
  initialValues?: { university?: string; city?: string };
}

const cities = ["Lagos", "Ibadan", "Ile-Ife", "Nsukka", "Zaria", "Enugu", "Benin City", "Akure", "Ota"];

const SearchBar = ({ compact = false, initialValues }: SearchBarProps) => {
  const [university, setUniversity] = useState(initialValues?.university || "");
  const [city, setCity] = useState(initialValues?.city || "");
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (university) params.set("university", university);
    if (city) params.set("city", city);
    navigate(`/hostels?${params.toString()}`);
  };

  if (compact) {
    return (
      <div className="flex gap-2 p-2 bg-card rounded-2xl border border-border shadow-card">
        <div className="flex-1 flex items-center gap-2 px-3">
          <GraduationCap className="w-4 h-4 text-primary shrink-0" />
          <input
            type="text"
            placeholder="University or location..."
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button
          onClick={handleSearch}
          size="sm"
          className="gradient-primary border-0 shadow-primary text-primary-foreground rounded-xl"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-card rounded-2xl md:rounded-full shadow-card-hover border border-border/80 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* University */}
        <div className="flex-1 flex items-center gap-3 px-5 py-4 border-b md:border-b-0 md:border-r border-border/60 relative">
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="section-label text-[10px] block mb-0.5 pointer-events-none">University</label>
            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full text-sm bg-transparent outline-none text-foreground font-medium appearance-none cursor-pointer absolute inset-0 opacity-0"
            >
              <option value="">All Universities</option>
              {universities.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <div className="w-full text-sm text-foreground font-medium pointer-events-none">
              {university || "All Universities"}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 pointer-events-none" />
        </div>

        {/* City */}
        <div className="flex-1 flex items-center gap-3 px-5 py-4 border-b md:border-b-0 md:border-r border-border/60 relative">
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="section-label text-[10px] block mb-0.5 pointer-events-none">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full text-sm bg-transparent outline-none text-foreground font-medium appearance-none cursor-pointer absolute inset-0 opacity-0"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="w-full text-sm text-foreground font-medium pointer-events-none">
              {city || "All Cities"}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 pointer-events-none" />
        </div>

        {/* Search Button */}
        <div className="p-3 flex items-center justify-center">
          <Button
            onClick={handleSearch}
            className="w-full md:w-auto gradient-primary border-0 shadow-primary text-primary-foreground px-8 py-3 rounded-xl md:rounded-full font-semibold text-sm"
          >
            <Search className="w-4 h-4 mr-2" />
            Search Hostels
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
