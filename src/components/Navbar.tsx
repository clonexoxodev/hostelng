import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Home, Search, Building, Phone, LogOut, User, LayoutDashboard, Flag, Shield, Bookmark } from "lucide-react";
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

  // Get user role from metadata
  const userRole = user?.user_metadata?.role;
  const isAgent = userRole === 'agent';
  const isSuperAdmin = user?.email === 'clonexoxo80@gmail.com';

  // Filter nav links based on user role
  const navLinks = [
    { to: "/", label: "Home", icon: Home, showFor: 'all' },
    { to: "/hostels", label: "Browse Hostels", icon: Search, showFor: 'all' },
    { to: "/list-hostel", label: "List Your Property", icon: Building, showFor: 'agent' },
    { to: "/contact", label: "Contact", icon: Phone, showFor: 'all' },
  ];

  // Filter links based on authentication and role
  const visibleLinks = navLinks.filter(link => {
    if (link.showFor === 'all') return true;
    if (link.showFor === 'agent') {
      // Show "List Your Hostel" only if user is not logged in OR is an agent
      return !user || isAgent;
    }
    return true;
  });

  return (
    <nav className="nav-glass fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img 
              src="/logo.png" 
              alt="HostelNG Logo" 
              className="w-9 h-9 object-contain"
            />
            <div>
              <span className="font-display font-bold text-xl text-primary leading-none">HostelNG</span>
              <span className="block text-[10px] text-muted-foreground leading-none tracking-wide">Student Housing</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => (
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
            {/* Saved Listings — always visible in nav */}
            {!isSuperAdmin && !isAgent && (
              <Link
                to={user ? "/saved" : "/login?reason=save"}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/saved'
                    ? "bg-secondary text-primary"
                    : "text-foreground/70 hover:text-primary hover:bg-secondary/60"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Saved
              </Link>
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {isSuperAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                    asChild
                  >
                    <Link to="/superadmin">
                      <Shield className="w-4 h-4 mr-2" />
                      Super Admin
                    </Link>
                  </Button>
                )}
                {isAgent && (
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
                )}
                {!isSuperAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-secondary"
                    asChild
                  >
                    <Link to="/saved">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Saved
                    </Link>
                  </Button>
                )}
                {isSuperAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-600 hover:bg-orange-50"
                    asChild
                  >
                    <Link to="/admin/reports">
                      <Flag className="w-4 h-4 mr-2" />
                      Reports
                    </Link>
                  </Button>
                )}
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
            {visibleLinks.map((link) => (
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
            {/* Saved Listings in mobile nav — always visible */}
            {!isSuperAdmin && !isAgent && (
              <Link
                to={user ? "/saved" : "/login?reason=save"}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/saved'
                    ? "bg-secondary text-primary"
                    : "text-foreground/70 hover:text-primary hover:bg-secondary/60"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Saved Listings
              </Link>
            )}
            <div className="pt-2 pb-1 flex flex-col gap-2">
              {user ? (
                <>
                  {isSuperAdmin && (
                    <Link
                      to="/superadmin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                    >
                      <Shield className="w-4 h-4" />
                      Super Admin
                    </Link>
                  )}
                  {isAgent && (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-secondary transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  )}
                  {!isSuperAdmin && (
                    <Link
                      to="/saved"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-secondary transition-all"
                    >
                      <Bookmark className="w-4 h-4" />
                      Saved Listings
                    </Link>
                  )}
                  {isSuperAdmin && (
                    <Link
                      to="/admin/reports"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-orange-600 hover:bg-orange-50 transition-all"
                    >
                      <Flag className="w-4 h-4" />
                      Reports
                    </Link>
                  )}
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
