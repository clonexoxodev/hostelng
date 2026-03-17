import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown, Search, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import HostelCard from "@/components/HostelCard";
import Footer from "@/components/Footer";
import RequestHomeForm from "@/components/RequestHomeForm";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const EKITI_UNIVERSITIES = [
  "Ekiti State University (EKSU)",
  "Federal University Oye-Ekiti (FUOYE)",
  "Bamidele Olumilua University of Education, Science and Technology (BOUESTI)",
  "Federal University of Technology and Environmental Sciences, Iyin-Ekiti",
  "Federal Polytechnic Ado-Ekiti",
  "Ekiti State Polytechnic, Isan-Ekiti",
  "College of Education, Ikere-Ekiti",
];

const GENDER_OPTIONS = [
  { value: "male_only",     label: "Male Only" },
  { value: "female_only",   label: "Female Only" },
  { value: "mixed",         label: "Mixed" },
  { value: "not_specified", label: "Not Specified" },
];

const PRICE_RANGES = [
  { label: "Any Price",           min: 0,      max: Infinity },
  { label: "₦100,000 and Below",  min: 0,      max: 100000 },
  { label: "₦100,000 – ₦200,000", min: 100000, max: 200000 },
  { label: "₦200,000 – ₦300,000", min: 200000, max: 300000 },
  { label: "₦300,000 – ₦400,000", min: 300000, max: 400000 },
  { label: "₦400,000 – ₦500,000", min: 400000, max: 500000 },
  { label: "₦500,000+",           min: 500000, max: Infinity },
];

const FilterSelect = ({
  label, value, onChange, children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) => (
  <div className="mb-5">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm bg-secondary border border-border rounded-xl px-3 py-2.5 pr-8 outline-none text-foreground appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  </div>
);

const Hostels = () => {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Filter state
  const [university, setUniversity] = useState(searchParams.get("university") || "");
  const [priceRange, setPriceRange] = useState("0");
  const [gender, setGender]         = useState("");
  const [sortBy, setSortBy]         = useState("recent");

  // Data
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHostels(); }, []);

  const loadHostels = async () => {
    try {
      const { data, error } = await supabase
        .from("hostels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHostels(data || []);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const selectedRange = PRICE_RANGES[parseInt(priceRange)];

  const filtered = useMemo(() => {
    let result = [...hostels];

    if (university)
      result = result.filter((h) => h.university === university);

    if (gender)
      result = result.filter((h) => h.gender === gender);

    if (selectedRange.max !== Infinity || selectedRange.min > 0)
      result = result.filter((h) => h.price >= selectedRange.min && h.price <= selectedRange.max);

    if (sortBy === "price-asc")       result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === "price-desc") result.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === "rating")     result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [hostels, university, gender, priceRange, sortBy]);

  const clearFilters = () => {
    setUniversity(""); setPriceRange("0"); setGender("");
  };

  const activeCount =
    [university, gender].filter(Boolean).length +
    (priceRange !== "0" ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-8 gradient-subtle border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">
            Browse Listings
          </h1>
          <p className="text-muted-foreground text-sm mb-2">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
            Currently showing listings in Ekiti State only — more locations coming soon.
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Filter Sidebar */}
          <aside className={`lg:w-64 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-base text-foreground">Filters</h3>
                {activeCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear all ({activeCount})
                  </button>
                )}
              </div>

              {/* University */}
              <FilterSelect label="University" value={university} onChange={setUniversity}>
                <option value="">All Universities</option>
                {EKITI_UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
              </FilterSelect>
              <p className="text-[10px] text-muted-foreground -mt-3 mb-4">
                Showing Ekiti State universities only
              </p>

              {/* Price Range */}
              <FilterSelect label="Price Range" value={priceRange} onChange={setPriceRange}>
                {PRICE_RANGES.map((r, i) => (
                  <option key={i} value={i}>{r.label}</option>
                ))}
              </FilterSelect>

              {/* Gender */}
              <FilterSelect label="Gender" value={gender} onChange={setGender}>
                <option value="">All</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </FilterSelect>

              {/* Active filter chips */}
              {activeCount > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                  {university && (
                    <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {university.split("(")[0].trim()}
                      <button onClick={() => setUniversity("")}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {priceRange !== "0" && (
                    <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {PRICE_RANGES[parseInt(priceRange)].label}
                      <button onClick={() => setPriceRange("0")}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {gender && (
                    <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {GENDER_OPTIONS.find((g) => g.value === gender)?.label}
                      <button onClick={() => setGender("")}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters{" "}
                {activeCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground hidden sm:block">Sort:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm bg-card border border-border rounded-xl px-3 py-2 pr-8 outline-none text-foreground appearance-none cursor-pointer"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">No listings found</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Try adjusting your filters to see more results.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={clearFilters} variant="outline" className="border-primary/30 text-primary">
                    Clear Filters
                  </Button>
                  <Button
                    onClick={() => setShowRequestForm(true)}
                    className="gradient-primary border-0 text-primary-foreground font-semibold"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Request a Home Instead
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Can't find what you need? Let an agent find the perfect home for you.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((hostel) => (
                    <HostelCard key={hostel.id} hostel={hostel} />
                  ))}
                </div>

                {/* Request a Home banner — shown below results */}
                <div className="mt-10 bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Still haven't found the right place?</p>
                      <p className="text-xs text-muted-foreground">Tell us your requirements and an agent will find options for you.</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowRequestForm(true)}
                    className="gradient-primary border-0 text-primary-foreground font-semibold shrink-0"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Request a Home
                  </Button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {showRequestForm && <RequestHomeForm onClose={() => setShowRequestForm(false)} />}
      <Footer />
    </div>
  );
};

export default Hostels;
