import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Home, Search, Building, Phone, LogOut, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

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

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/hostels", label: "Browse Hostels", icon: Search },
    { to: "/list-hostel", label: "List Your Hostel", icon: Building },
    { to: "/contact", label: "Contact", icon: Phone },
  ];

  return (
    <nav className="nav-glass fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
              <span className="text-primary-foreground font-display font-bold text-lg">H</span>
            </div>
            <div>
              <span className="font-display font-bold text-xl text-primary leading-none">HostelNG</span>
              <span className="block text-[10px] text-muted-foreground leading-none tracking-wide">Student Housing</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? "bg-secondary text-primary"
                    : "text-foreground/70 hover:text-primary hover:bg-secondary/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-secondary"
                  asChild
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/60 text-sm">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-foreground/80">{user.email?.split('@')[0]}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary/30 text-primary hover:bg-secondary"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-secondary" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" className="gradient-primary border-0 shadow-primary text-primary-foreground" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-foreground/70 hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-up">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? "bg-secondary text-primary"
                    : "text-foreground/70 hover:text-primary hover:bg-secondary/60"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            <div className="pt-2 pb-1 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-secondary transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/60">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground/80">{user.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/30 text-primary"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full border-primary/30 text-primary" asChild>
                    <Link to="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                  </Button>
                  <Button className="w-full gradient-primary border-0 text-primary-foreground" asChild>
                    <Link to="/register" onClick={() => setIsOpen(false)}>Get Started Free</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
