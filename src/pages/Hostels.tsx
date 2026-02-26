import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import HostelCard from "@/components/HostelCard";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const roomTypes = ["single", "double", "self-contain", "flat"];
const genderOptions = ["mixed", "male", "female"];

const Hostels = () => {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(searchParams.get("university") || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "");
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(50000000); // Increased to 50M to show all hostels
  const [sortBy, setSortBy] = useState("recent");
  const [hostels, setHostels] = useState<any[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load hostels from database
  useEffect(() => {
    loadHostels();
  }, []);

  const loadHostels = async () => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Loaded hostels on Browse page:', data); // Debug log
      console.log('Total hostels:', data?.length); // Debug log
      setHostels(data || []);
      
      // Extract unique universities
      const uniqueUniversities = [...new Set(data?.map(h => h.university) || [])];
      setUniversities(uniqueUniversities as string[]);
    } catch (error: any) {
      console.error('Failed to load hostels:', error);
      toast.error('Failed to load hostels');
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const filtered = useMemo(() => {
    let result = [...hostels];

    console.log('Before filters:', result.length); // Debug log
    console.log('All hostels:', result.map(h => ({ name: h.name, price: h.price }))); // Debug log

    if (selectedUniversity)
      result = result.filter((h) => h.university === selectedUniversity);

    if (selectedCity)
      result = result.filter((h) => h.location?.toLowerCase().includes(selectedCity.toLowerCase()));

    console.log('After university/city filter:', result.length); // Debug log
    console.log('Max price filter:', maxPrice); // Debug log

    // Filter by price - handle null/undefined prices
    result = result.filter((h) => {
      const price = h.price || 0;
      const passes = price <= maxPrice;
      if (!passes) {
        console.log(`Filtered out: ${h.name} with price ${price}`); // Debug log
      }
      return passes;
    });

    console.log('After price filter:', result.length); // Debug log

    // Sort by selected option
    if (sortBy === "price-asc") result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === "price-desc") result.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === "rating") result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === "recent") result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    return result;
  }, [hostels, selectedUniversity, selectedCity, maxPrice, sortBy]);

  const clearFilters = () => {
    setSelectedUniversity("");
    setSelectedCity("");
    setSelectedGender([]);
    setSelectedRoomType([]);
    setMaxPrice(50000000); // Reset to 50M
  };

  const hasFilters = selectedUniversity || selectedCity || maxPrice < 50000000;

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-8 gradient-subtle border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Browse Hostels
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {filtered.length} verified hostel{filtered.length !== 1 ? "s" : ""} available
          </p>
          <SearchBar compact initialValues={{ university: selectedUniversity, city: selectedCity }} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className={`lg:w-72 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-base text-foreground">Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-accent hover:underline font-medium flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>

              {/* University */}
              <div className="mb-5">
                <label className="section-label text-[10px] block mb-2">University</label>
                <div className="relative">
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="w-full text-sm bg-secondary border border-border rounded-xl px-3 py-2.5 pr-8 outline-none text-foreground appearance-none cursor-pointer"
                  >
                    <option value="">All Universities</option>
                    {universities.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Gender - Removed since not in database schema */}
              
              {/* Room Type - Removed since not in database schema */}

              {/* Max Price */}
              <div className="mb-2">
                <label className="section-label text-[10px] block mb-2">Max Price per Year</label>
                <input
                  type="range"
                  min={50000}
                  max={50000000}
                  step={100000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>₦50k</span>
                  <span className="font-semibold text-primary">
                    ₦{maxPrice >= 1000000 ? (maxPrice / 1000000).toFixed(1) + 'M' : (maxPrice / 1000).toFixed(0) + 'k'}
                  </span>
                  <span>₦50M+</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Sort + mobile filter toggle */}
            <div className="flex items-center justify-between mb-6 gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters {hasFilters && `(active)`}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground hidden sm:block">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm bg-card border border-border rounded-xl px-3 py-2 pr-8 outline-none text-foreground appearance-none cursor-pointer"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="featured">Featured</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">No hostels found</h3>
                <p className="text-muted-foreground text-sm mb-6">Try adjusting your filters or search criteria.</p>
                <Button onClick={clearFilters} variant="outline" className="border-primary/30 text-primary">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((hostel) => (
                  <HostelCard key={hostel.id} hostel={hostel} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Hostels;
