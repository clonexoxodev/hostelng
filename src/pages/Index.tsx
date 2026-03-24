import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Star, ShieldCheck, Building, TrendingUp, ArrowRight, CheckCircle2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import HostelCard from "@/components/HostelCard";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import RequestHomeForm from "@/components/RequestHomeForm";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";
import hostel3 from "@/assets/hostel-3.jpg";

const stats = [
  { value: "60+", label: "Listed Hostels" },
  { value: "8,000+", label: "Happy Students" },
  { value: "6", label: "Institutions" },
  { value: "4.6★", label: "Average Rating" },
];

const trustedBy = [
  "EKSU", "FUOYE", "FEDPOLYADOEKITI",
];

const benefits = [
  "Listings from verified landlords, agents & property managers",
  "Direct contact with property owners",
  "Detailed photos & virtual tours",
  "Real student reviews you can trust",
  "24/7 customer support team",
  "Free listing for property owners",
];

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Load hostels from database
    loadHostels();

    return () => subscription.unsubscribe();
  }, []);

  const loadHostels = async () => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHostels(data || []);
    } catch (error: any) {
      toast.error('Failed to load hostels');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is an agent
  const isAgent = user?.user_metadata?.role === 'agent';

  // Only show hostels explicitly marked as featured by Super Admin
  const featuredHostels = hostels.filter((h) => h.featured === true);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pb-32">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 hero-overlay" />

        {/* Floating stats (desktop, overlay bottom of hero) */}
        <div className="absolute bottom-0 left-0 right-0 hidden md:block" style={{ pointerEvents: 'none' }}>
          <div className="container mx-auto px-4 pb-8">
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-card/90 backdrop-blur-md rounded-2xl p-4 text-center border border-border/40 animate-fade-up"
                  style={{ animationDelay: `${i * 0.1}s`, pointerEvents: 'auto' }}
                >
                  <p className="font-display font-bold text-xl text-primary">{stat.value}</p>
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center py-24">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/25 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-full mb-6 animate-fade-in">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            Nigeria's #1 Student Hostel Discovery Platform
          </div>

          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-primary-foreground leading-tight mb-6 animate-fade-up max-w-3xl mx-auto">
            Find Your Perfect
            <span className="block text-accent">Student Home</span>
            Near Your Campus Always
          </h1>

          <p className="text-primary-foreground/80 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: "0.15s" }}>
            Browse hundreds of verified listings near Nigerian universities. Connect directly with landlords and property owners — no stress, no scams, no wasted journeys.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.25s" }}>
            <SearchBar />
          </div>

          {/* Popular searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <span className="text-primary-foreground/60 text-xs">Popular:</span>
            {["EKSU Ado-Ekiti", "FUOYE Oye-Ekiti", "FEDPOLYADOEKITI"].map((q) => (
              <Link
                key={q}
                to={`/hostels?q=${encodeURIComponent(q)}`}
                className="bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground text-xs px-3 py-1.5 rounded-full border border-primary-foreground/20 transition-colors"
              >
                {q}
              </Link>
            ))}
          </div>

          {/* Request a Home CTA */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="inline-flex items-center gap-3 bg-card/20 backdrop-blur-sm border border-primary-foreground/20 rounded-2xl px-5 py-3">
              <span className="text-primary-foreground/80 text-sm">Can't find what you need?</span>
              <button
                onClick={() => setShowRequestForm(true)}
                className="flex items-center gap-2 bg-accent hover:opacity-90 text-accent-foreground text-sm font-semibold px-4 py-2 rounded-xl transition-opacity"
              >
                <Home className="w-4 h-4" />
                Request a Home
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats (mobile) */}
      <div className="md:hidden bg-primary py-6">
        <div className="container mx-auto px-4 grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="mt-8 text-center">
              <p className="font-display font-bold text-2xl text-primary-foreground">{stat.value}</p>
              <p className="text-primary-foreground/70 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trusted by universities */}
      <section className="py-10 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground text-xs uppercase tracking-widest font-semibold mb-3">
            Currently serving students near these institutions in Ekiti State
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-4">
            {trustedBy.map((uni) => (
              <span key={uni} className="text-foreground/60 font-display font-bold text-sm md:text-base hover:text-primary transition-colors cursor-default">
                {uni}
              </span>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-xs">
            🌍 We are currently focused on Ekiti State. More locations will be added as the platform expands.
          </p>
        </div>
      </section>

      {/* Featured Hostels — only shown when Super Admin has selected featured posts */}
      {(loading || featuredHostels.length > 0) && (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-label mb-2">Top Picks</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Featured Hostels
              </h2>
            </div>
            <Button variant="outline" className="hidden md:flex border-primary/30 text-primary hover:bg-secondary" asChild>
              <Link to="/hostels">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredHostels.slice(0, 6).map((hostel) => (
                  <HostelCard key={hostel.id} hostel={hostel} />
                ))}
              </div>
              <div className="text-center mt-8 md:hidden">
                <Button variant="outline" className="border-primary/30 text-primary hover:bg-secondary" asChild>
                  <Link to="/hostels">
                    View All Hostels <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
      )}

      {/* How It Works */}
      <HowItWorks />

      {/* Why Choose Us */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label mb-3">Why HostelNG?</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                The Safest Way to Find Student Housing
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                We know the Nigerian student housing market can be stressful, risky, and full of fraudsters. HostelNG is built to change that — with listings from trusted landlords and property owners, direct contact, and real transparency.
              </p>

              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button className="mt-10 gradient-primary border-0 shadow-primary text-primary-foreground px-8 font-semibold" asChild>
                <Link to="/hostels">
                  Start Searching <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-card-hover">
                <img src={hostel3} alt="Quality Hostel" className="w-full aspect-[4/3] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </div>

              {/* Floating trust badge */}
              <div className="absolute -bottom-5 -left-5 bg-card rounded-2xl shadow-card-hover border border-border p-4 max-w-[200px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Trusted Listers</span>
                </div>
                <p className="text-muted-foreground text-xs">Listings from landlords, agents & property managers.</p>
              </div>

              {/* Floating rating badge */}
              <div className="absolute -top-5 -right-5 bg-card rounded-2xl shadow-card-hover border border-border p-4">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-display font-bold text-xl text-foreground">4.8</span>
                </div>
                <p className="text-muted-foreground text-xs">20,000+ happy students</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for hostel owners - Only show if not an authenticated agent */}
      {!isAgent && (
        <section className="py-20 gradient-primary">
          <div className="container mx-auto px-4 text-center">
            <Building className="w-12 h-12 text-primary-foreground/70 mx-auto mb-5" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Have a Property to List?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto text-base leading-relaxed mb-10">
              Whether you're a landlord, agent, or property manager — list your property on HostelNG for free and reach thousands of students looking for accommodation near their campus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-accent border-0 shadow-amber text-accent-foreground hover:opacity-90 px-8 font-semibold"
                size="lg"
                asChild
              >
                <Link to="/list-hostel">
                  List Your Hostel — It's Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8"
                asChild
              >
                <Link to="/contact">Learn More</Link>
              </Button>
            </div>
            <p className="mt-6 text-primary-foreground/50 text-xs">
              Free to list. Students contact you directly — no middlemen, no hidden charges.
            </p>
          </div>
        </section>
      )}

      {showRequestForm && <RequestHomeForm onClose={() => setShowRequestForm(false)} />}
      <Footer />
    </div>
  );
};

export default Index;
