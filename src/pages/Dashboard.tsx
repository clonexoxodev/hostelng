import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, Plus, Edit, Trash2, Eye } from "lucide-react";
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    
    setUser(session.user);
    
    // Redirect superadmin to admin dashboard
    if (session.user.email === SUPERADMIN_EMAIL) {
      navigate("/admin");
      return;
    }
    
    loadHostels(session.user.id);
  };

  const loadHostels = async (userId: string) => {
    try {
      console.log('Loading hostels for user:', userId); // Debug log
      
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading hostels:', error);
        throw error;
      }
      
      console.log('Loaded hostels for user:', data); // Debug log
      setHostels(data || []);
    } catch (error: any) {
      console.error('Failed to load hostels:', error);
      toast.error('Failed to load your hostels');
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
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own

      if (error) throw error;

      toast.success("Hostel deleted successfully");
      setHostels(hostels.filter(h => h.id !== id));
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Failed to delete hostel");
    }
  };

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                My Hostels
              </h1>
              <p className="text-muted-foreground">
                Manage your hostel listings
              </p>
            </div>
            <Button 
              className="gradient-primary border-0 shadow-primary text-primary-foreground"
              asChild
            >
              <Link to="/list-hostel">
                <Plus className="w-4 h-4 mr-2" />
                Add New Hostel
              </Link>
            </Button>
          </div>

          {hostels.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <Building2 className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                No hostels listed yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start by adding your first hostel listing
              </p>
              <Button 
                className="gradient-primary border-0 shadow-primary text-primary-foreground"
                asChild
              >
                <Link to="/list-hostel">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Hostel
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {hostels.map((hostel) => (
                <div
                  key={hostel.id}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-xl font-bold text-foreground">
                          {hostel.name}
                        </h3>
                        {hostel.featured && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">University:</span>
                          <p className="text-foreground font-medium">{hostel.university}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p className="text-foreground font-medium">{hostel.location}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Price:</span>
                          <p className="text-foreground font-medium">₦{hostel.price?.toLocaleString()}/year</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rooms Available:</span>
                          <p className="text-foreground font-medium">{hostel.rooms_available}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contact:</span>
                          <p className="text-foreground font-medium">{hostel.contact_phone}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="text-foreground font-medium truncate">{hostel.contact_email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/hostels/${hostel.id}`)}
                        className="border-primary/30 text-primary"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/edit/${hostel.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteHostel(hostel.id)}
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
