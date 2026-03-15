import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2, Trash2, Edit, Users, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const SUPERADMIN_EMAIL = "clonexoxo80@gmail.com";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [hostels, setHostels] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"hostels" | "users" | "featured">(() => {
    const params = new URLSearchParams(location.search);
    return (params.get('tab') as any) || 'hostels';
  });
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    
    // Check if user is superadmin
    if (session.user.email !== SUPERADMIN_EMAIL) {
      toast.error("Access denied. Admin only.");
      navigate("/dashboard");
      return;
    }
    
    setUser(session.user);
    loadData();
  };

  const loadData = async () => {
    try {
      const { data: hostelsData, error: hostelsError } = await supabase
        .from('hostels')
        .select('*')
        .order('created_at', { ascending: false });

      if (hostelsError) throw hostelsError;
      setHostels(hostelsData || []);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        // If profiles doesn't exist, get unique owners from hostels
        const uniqueOwners = hostelsData?.reduce((acc: any[], hostel) => {
          if (!acc.find(u => u.id === hostel.owner_id)) {
            acc.push({
              id: hostel.owner_id,
              email: 'Unknown',
              role: 'agent',
              hostel_count: hostelsData.filter(h => h.owner_id === hostel.owner_id).length
            });
          }
          return acc;
        }, []) || [];
        setUsers(uniqueOwners);
      } else {
        const usersWithCount = profilesData?.map(profile => ({
          ...profile,
          hostel_count: hostelsData?.filter(h => h.owner_id === profile.id).length || 0
        })) || [];
        setUsers(usersWithCount);
      }
      
    } catch (error: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const deleteHostel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hostel?")) return;

    try {
      const { error } = await supabase
        .from('hostels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Hostel deleted successfully");
      setHostels(hostels.filter(h => h.id !== id));
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Failed to delete hostel");
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const { error } = await supabase
        .from('hostels')
        .update({ featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Hostel ${!currentStatus ? 'added to Featured' : 'removed from Featured'}`);
      setHostels(hostels.map(h => h.id === id ? { ...h, featured: !currentStatus } : h));
    } catch (error: any) {
      toast.error("Failed to update hostel");
    } finally {
      setTogglingId(null);
    }
  };

  const featuredHostels = hostels.filter(h => h.featured);
  const regularHostels = hostels.filter(h => !h.featured);

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

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage all hostels and users
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab("hostels")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "hostels"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              Hostels ({hostels.length})
            </button>
            <button
              onClick={() => setActiveTab("featured")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "featured"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star className="w-4 h-4 inline mr-2" />
              Featured Posts ({featuredHostels.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "users"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Users ({users.length})
            </button>
          </div>

          {/* Featured Posts Tab */}
          {activeTab === "featured" && (
            <div className="space-y-6">
              {/* Info banner */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-4 flex items-start gap-3">
                <Star className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Featured Hostels control</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Only posts you mark here will appear in the "Featured Hostels" section on the homepage. Agents cannot feature their own listings.
                  </p>
                </div>
              </div>

              {/* Currently Featured */}
              <div>
                <h3 className="font-display font-bold text-base text-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                  Currently Featured ({featuredHostels.length})
                </h3>
                {featuredHostels.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                    No featured posts yet. Select from the list below.
                  </div>
                ) : (
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="px-5 py-3 text-left font-semibold text-foreground">Hostel</th>
                          <th className="px-5 py-3 text-left font-semibold text-foreground">University</th>
                          <th className="px-5 py-3 text-left font-semibold text-foreground">Price</th>
                          <th className="px-5 py-3 text-right font-semibold text-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {featuredHostels.map((h) => (
                          <tr key={h.id} className="hover:bg-secondary/30 transition-colors">
                            <td className="px-5 py-3 font-medium text-foreground">{h.name}</td>
                            <td className="px-5 py-3 text-muted-foreground">{h.university}</td>
                            <td className="px-5 py-3 text-foreground">₦{h.price?.toLocaleString()}</td>
                            <td className="px-5 py-3 text-right">
                              <button
                                disabled={togglingId === h.id}
                                onClick={() => toggleFeatured(h.id, true)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                              >
                                Remove from Featured
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* All other listings */}
              <div>
                <h3 className="font-display font-bold text-base text-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block" />
                  All Other Listings ({regularHostels.length})
                </h3>
                {regularHostels.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                    All listings are currently featured.
                  </div>
                ) : (
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="px-5 py-3 text-left font-semibold text-foreground">Hostel</th>
                          <th className="px-5 py-3 text-left font-semibold text-foreground">University</th>
                          <th className="px-5 py-3 text-left font-semibold text-foreground">Price</th>
                          <th className="px-5 py-3 text-left font-semibold text-foreground">Added</th>
                          <th className="px-5 py-3 text-right font-semibold text-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {regularHostels.map((h) => (
                          <tr key={h.id} className="hover:bg-secondary/30 transition-colors">
                            <td className="px-5 py-3 font-medium text-foreground">{h.name}</td>
                            <td className="px-5 py-3 text-muted-foreground">{h.university}</td>
                            <td className="px-5 py-3 text-foreground">₦{h.price?.toLocaleString()}</td>
                            <td className="px-5 py-3 text-muted-foreground">
                              {new Date(h.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button
                                disabled={togglingId === h.id}
                                onClick={() => toggleFeatured(h.id, false)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                              >
                                {togglingId === h.id ? 'Saving…' : '+ Add to Featured'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hostels Tab */}
          {activeTab === "hostels" && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">University</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Rooms</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {hostels.map((hostel) => (
                      <tr key={hostel.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{hostel.name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{hostel.university}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{hostel.location}</td>
                        <td className="px-6 py-4 text-sm text-foreground">₦{hostel.price?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{hostel.rooms_available}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleFeatured(hostel.id, hostel.featured)}
                            disabled={togglingId === hostel.id}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                              hostel.featured
                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {hostel.featured ? "★ Featured" : "Regular"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/hostels/${hostel.id}`)}
                              className="text-primary hover:text-primary"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/dashboard/edit/${hostel.id}`)}
                              className="text-primary hover:text-primary"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteHostel(hostel.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {hostels.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">No hostels listed yet</p>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Full Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Hostels</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{user.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {user.full_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'agent' 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-secondary text-muted-foreground'
                          }`}>
                            {user.role || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {user.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {user.hostel_count || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
