import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const EditHostel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    university: "",
    location: "",
    area: "",
    price: "",
    listing_type: "session",
    gender: "",
    description: "",
    amenities: "",
    contact_phone: "",
    contact_email: "",
    rooms_available: "",
  });

  useEffect(() => {
    checkAuthAndLoadHostel();
  }, [id]);

  const checkAuthAndLoadHostel = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setUser(session.user);
    await loadHostel(session.user.id);
  };

  const loadHostel = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user owns this hostel
      const { data: { session } } = await supabase.auth.getSession();
      const isSuperAdmin = session?.user?.email === 'clonexoxo80@gmail.com';
      const isOwner = data.owner_id === userId;

      if (!isOwner && !isSuperAdmin) {
        toast.error("You don't have permission to edit this hostel");
        navigate("/dashboard");
        return;
      }

      // Populate form
      setFormData({
        name: data.name || "",
        university: data.university || "",
        location: data.location || "",
        area: data.area || "",
        price: data.price?.toString() || "",
        listing_type: data.listing_type || "session",
        gender: data.gender || "",
        description: data.description || "",
        amenities: Array.isArray(data.amenities) ? data.amenities.join(", ") : "",
        contact_phone: data.contact_phone || "",
        contact_email: data.contact_email || "",
        rooms_available: data.rooms_available?.toString() || "",
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to load hostel');
      navigate("/dashboard");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amenitiesArray = formData.amenities
        .split(",")
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const updateData = {
        name: formData.name,
        university: formData.university,
        location: formData.location,
        area: formData.area,
        price: parseInt(formData.price),
        listing_type: formData.listing_type,
        gender: formData.gender,
        description: formData.description,
        amenities: amenitiesArray,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        rooms_available: parseInt(formData.rooms_available),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("hostels")
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success("Hostel updated successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to update hostel");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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
          <div className="max-w-3xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Edit Hostel
              </h1>
              <p className="text-muted-foreground">
                Update your hostel information
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Hostel Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="university" className="block text-sm font-medium text-foreground mb-2">
                      University
                    </label>
                    <input
                      type="text"
                      id="university"
                      name="university"
                      required
                      value={formData.university}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="area" className="block text-sm font-medium text-foreground mb-2">
                      Area / Neighbourhood
                    </label>
                    <input
                      type="text"
                      id="area"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="e.g. Sabo, Agbowo"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-2">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option value="">Any Gender</option>
                      <option value="male">Male Only</option>
                      <option value="female">Female Only</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="listing_type" className="block text-sm font-medium text-foreground mb-2">
                      Listing Type
                    </label>
                    <select
                      id="listing_type"
                      name="listing_type"
                      value={formData.listing_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option value="session">Per Session</option>
                      <option value="semester">Per Semester</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">
                      Price per {formData.listing_type === 'semester' ? 'Semester' : 'Session'} (₦)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="rooms_available" className="block text-sm font-medium text-foreground mb-2">
                      Rooms Available
                    </label>
                    <input
                      type="number"
                      id="rooms_available"
                      name="rooms_available"
                      required
                      min="0"
                      value={formData.rooms_available}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="amenities" className="block text-sm font-medium text-foreground mb-2">
                    Amenities (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="amenities"
                    name="amenities"
                    required
                    value={formData.amenities}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact_phone" className="block text-sm font-medium text-foreground mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      id="contact_phone"
                      name="contact_phone"
                      required
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact_email" className="block text-sm font-medium text-foreground mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      id="contact_email"
                      name="contact_email"
                      required
                      value={formData.contact_email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 gradient-primary border-0 shadow-primary text-primary-foreground font-semibold"
                  >
                    {loading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EditHostel;
