import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, Plus, Edit, Trash2, Eye, MessageSquare, Star, MapPin, BedDouble, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const SUPERADMIN_EMAIL = "clonexoxo80@gmail.com";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newInquiryCount, setNewInquiryCount] = useState(0);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/login"); return; }
    setUser(session.user);
    if (session.user.email === SUPERADMIN_EMAIL) { navigate("/admin"); return; }
    loadHostels(session.user.id);
    loadNewInquiryCount(session.user.id);
  };

  const loadNewInquiryCount = async (userId: string) => {
    const { count } = await supabase
      .from('student_inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('agent_id', userId)
      .eq('status', 'new');
    setNewInquiryCount(count || 0);
  };

  const loadHostels = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('hostels').select('*').eq('owner_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHostels(data || []);
    } catch {
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const deleteHostel = async (id: string) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('hostels').delete().eq('id', id).eq('owner_id', user.id);
      if (error) throw error;
      toast.success("Listing deleted");
      setHostels(hostels.filter(h => h.id !== id));
    } catch {
      toast.error("Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">Agent Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                {hostels.length} listing{hostels.length !== 1 ? 's' : ''} · {user?.email}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" asChild className="relative border-border">
                <Link to="/dashboard/inquiries">
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Inquiries
                  {newInquiryCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {newInquiryCount}
                    </span>
                  )}
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="border-border">
                <Link to="/dashboard/reviews">
                  <Star className="w-4 h-4 mr-1.5" />
                  Reviews
                </Link>
              </Button>
              <Button size="sm" className="gradient-primary border-0 shadow-primary text-primary-foreground" asChild>
                <Link to="/dashboard/hostel/new">
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Listing
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Total Listings", value: hostels.length },
              { label: "Active Listings", value: hostels.filter(h => h.rooms_available > 0).length },
              { label: "Featured", value: hostels.filter(h => h.featured).length },
              { label: "New Inquiries", value: newInquiryCount },
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <p className="text-2xl font-bold text-foreground font-display">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Listings */}
          {hostels.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary/50" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">No listings yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                Post your first property and start connecting with students looking for accommodation.
              </p>
              <Button className="gradient-primary border-0 shadow-primary text-primary-foreground" asChild>
                <Link to="/list-hostel"><Plus className="w-4 h-4 mr-2" />Post Your First Listing</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {hostels.map((hostel) => {
                const img = hostel.images?.[0];
                return (
                  <div key={hostel.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-card-hover transition-all group">
                    {/* Image */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                      {img ? (
                        <img src={img} alt={hostel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                      {hostel.featured && (
                        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                          Featured
                        </span>
                      )}
                      <div className="absolute bottom-2 left-3">
                        <p className="text-primary-foreground font-bold text-base drop-shadow">
                          ₦{hostel.price?.toLocaleString()}
                          <span className="text-xs font-normal opacity-80 ml-1">
                            /{hostel.listing_type === 'semester' ? 'sem' : 'session'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-display font-bold text-sm text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                        {hostel.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="line-clamp-1">{hostel.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <BedDouble className="w-3 h-3 shrink-0" />
                        <span>{hostel.rooms_available} room{hostel.rooms_available !== 1 ? 's' : ''} available</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-border">
                        <Button variant="outline" size="sm" className="flex-1 text-xs h-8 border-border"
                          onClick={() => navigate(`/hostels/${hostel.id}`)}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs h-8 border-border"
                          onClick={() => navigate(`/dashboard/hostel/edit/${hostel.id}`)}>
                          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => deleteHostel(hostel.id)} disabled={deletingId === hostel.id}>
                          {deletingId === hostel.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
