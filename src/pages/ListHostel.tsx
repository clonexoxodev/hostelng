import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Building2, Camera, FileText, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

const SUPERADMIN_EMAIL = "clonexoxo80@gmail.com";

const ListHostel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    university: "",
    location: "",
    price: "",
    description: "",
    amenities: "",
    contact_phone: "",
    contact_email: "",
    rooms_available: "",
  });

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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse amenities from comma-separated string to array
      const amenitiesArray = formData.amenities
        .split(",")
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const hostelData = {
        name: formData.name,
        university: formData.university,
        location: formData.location,
        price: parseInt(formData.price),
        description: formData.description,
        amenities: amenitiesArray,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        rooms_available: parseInt(formData.rooms_available),
        owner_id: user.id, // Changed from user_id to owner_id
        featured: false,
        rating: 0,
      };

      const { error } = await supabase
        .from("hostels")
        .insert([hostelData]);

      if (error) throw error;

      toast.success("Hostel listed successfully!");
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to list hostel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  List Your Hostel
                </h1>
                <p className="text-muted-foreground">
                  Fill in the details below to add your hostel listing
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/dashboard">
                  View My Hostels
                </Link>
              </Button>
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
                    placeholder="e.g., Greenview Student Lodge"
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
                      placeholder="e.g., University of Ibadan (UI)"
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
                      placeholder="e.g., Bodija, Ibadan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">
                      Price per Year (₦)
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
                      placeholder="e.g., 280000"
                    />
                  </div>

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
                      placeholder="e.g., 10"
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
                    placeholder="Describe your hostel, facilities, and what makes it special..."
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
                    placeholder="e.g., 24/7 Security, Wi-Fi, Water Supply, Parking"
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
                      placeholder="e.g., 08012345678"
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
                      placeholder="e.g., contact@hostel.com"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 gradient-primary border-0 shadow-primary text-primary-foreground font-semibold"
                  >
                    {loading ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        List Hostel
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

export default ListHostel;
