import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import HostelCard from "@/components/HostelCard";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";
import { hostels, universities } from "@/data/hostels";

const roomTypes = ["single", "double", "self-contain", "flat"];
const genderOptions = ["mixed", "male", "female"];

const Hostels = () => {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(searchParams.get("university") || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "");
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sortBy, setSortBy] = useState("featured");

  const toggleFilter = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const filtered = useMemo(() => {
    let result = [...hostels];

    if (selectedUniversity)
      result = result.filter((h) => h.university === selectedUniversity);

    if (selectedCity)
      result = result.filter((h) => h.city.toLowerCase() === selectedCity.toLowerCase());

    if (selectedGender.length)
      result = result.filter((h) => selectedGender.includes(h.gender));

    if (selectedRoomType.length)
      result = result.filter((h) => h.rooms.some((r) => selectedRoomType.includes(r.type)));

    result = result.filter((h) => h.minPrice <= maxPrice);

    if (sortBy === "price-asc") result.sort((a, b) => a.minPrice - b.minPrice);
    else if (sortBy === "price-desc") result.sort((a, b) => b.minPrice - a.minPrice);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    else result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    return result;
  }, [selectedUniversity, selectedCity, selectedGender, selectedRoomType, maxPrice, sortBy]);

  const clearFilters = () => {
    setSelectedUniversity("");
    setSelectedCity("");
    setSelectedGender([]);
    setSelectedRoomType([]);
    setMaxPrice(1000000);
  };

  const hasFilters = selectedUniversity || selectedCity || selectedGender.length || selectedRoomType.length || maxPrice < 1000000;

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

              {/* Gender */}
              <div className="mb-5">
                <label className="section-label text-[10px] block mb-2">Gender Policy</label>
                <div className="flex flex-wrap gap-2">
                  {genderOptions.map((g) => (
                    <button
                      key={g}
                      onClick={() => toggleFilter(selectedGender, g, setSelectedGender)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                        selectedGender.includes(g)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-foreground/70 hover:border-primary/50"
                      }`}
                    >
                      {g === "mixed" ? "Mixed" : `${g}s only`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Type */}
              <div className="mb-5">
                <label className="section-label text-[10px] block mb-2">Room Type</label>
                <div className="flex flex-wrap gap-2">
                  {roomTypes.map((rt) => (
                    <button
                      key={rt}
                      onClick={() => toggleFilter(selectedRoomType, rt, setSelectedRoomType)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                        selectedRoomType.includes(rt)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-foreground/70 hover:border-primary/50"
                      }`}
                    >
                      {rt === "self-contain" ? "Self-Contain" : rt.charAt(0).toUpperCase() + rt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price */}
              <div className="mb-2">
                <label className="section-label text-[10px] block mb-2">Max Price per Year</label>
                <input
                  type="range"
                  min={50000}
                  max={1000000}
                  step={10000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>₦50k</span>
                  <span className="font-semibold text-primary">
                    ₦{(maxPrice / 1000).toFixed(0)}k
                  </span>
                  <span>₦1M+</span>
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
