import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Building2, Camera, FileText, ArrowRight, Plus, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from '@/lib/supabase';
import { watermarkImages } from '@/lib/watermark';
import { toast } from "sonner";

const SUPERADMIN_EMAIL = "clonexoxo80@gmail.com";

const ListHostel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    university: "",
    area: "",
    location: "",
    price: "",
    listing_type: "semester",
    gender: "",
    description: "",
    amenities: "",
    contact_phone: "",
    contact_email: "",
    rooms_available: "",
  });
  const [newImages, setNewImages] = useState<File[]>([]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Show processing message
      toast.info('Processing images with watermark...', { duration: 2000 });
      
      try {
        // Add watermarks to images
        const watermarkedFiles = await watermarkImages(files);
        setNewImages([...newImages, ...watermarkedFiles]);
        toast.success('Images processed successfully!');
      } catch (error) {
        console.error('Error processing images:', error);
        toast.error('Failed to process images');
        // Fallback to original images if watermarking fails
        setNewImages([...newImages, ...files]);
      }
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const uploadImages = async (userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of newImages) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('hostel-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('hostel-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate images
    if (newImages.length === 0) {
      toast.error("Please upload at least one image of your hostel");
      return;
    }

    setLoading(true);

    try {
      // Upload images first
      setUploading(true);
      const uploadedImages = await uploadImages(user.id);
      setUploading(false);

      // Parse amenities from comma-separated string to array
      const amenitiesArray = formData.amenities
        .split(",")
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const hostelData = {
        name: formData.name,
        university: formData.university,
        area: formData.area,
        location: formData.location,
        price: parseInt(formData.price),
        listing_type: formData.listing_type,
        gender: formData.gender,
        description: formData.description,
        amenities: amenitiesArray,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        rooms_available: parseInt(formData.rooms_available),
        images: uploadedImages,
        owner_id: user.id,
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
      setUploading(false);
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
                    <select
                      id="university"
                      name="university"
                      required
                      value={formData.university}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option value="">Select university...</option>
                      {[
                        "Ekiti State University (EKSU)",
                        "Federal University Oye-Ekiti (FUOYE)",
                        "Bamidele Olumilua University of Education, Science and Technology (BOUESTI)",
                        "Federal University of Technology and Environmental Sciences, Iyin-Ekiti",
                        "Federal Polytechnic Ado-Ekiti",
                        "Ekiti State Polytechnic, Isan-Ekiti",
                        "College of Education, Ikere-Ekiti",
                      ].map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="area" className="block text-sm font-medium text-foreground mb-2">
                      Area / Neighbourhood
                    </label>
                    <select
                      id="area"
                      name="area"
                      required
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option value="">Select area...</option>
                      <option value="Ado-Ekiti">Ado-Ekiti</option>
                      <option value="Oye-Ekiti">Oye-Ekiti</option>
                      <option value="Ikole-Ekiti">Ikole-Ekiti</option>
                      <option value="Ikere-Ekiti">Ikere-Ekiti</option>
                      <option value="Iyin-Ekiti">Iyin-Ekiti</option>
                      <option value="Isan-Ekiti">Isan-Ekiti</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                      Full Address / Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="e.g., 12 Bodija Road, opposite UI gate"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-2">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option value="">Select gender...</option>
                      <option value="male_only">Male Only</option>
                      <option value="female_only">Female Only</option>
                      <option value="mixed">Mixed</option>
                      <option value="not_specified">Not Specified</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="listing_type" className="block text-sm font-medium text-foreground mb-2">
                      Listing Type
                    </label>
                    <select
                      id="listing_type"
                      name="listing_type"
                      required
                      value={formData.listing_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option value="semester">Semester</option>
                      <option value="session">Session</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">
                      Price (₦) per {formData.listing_type === 'semester' ? 'Semester' : 'Session'}
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
                      placeholder="e.g., 150000"
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

                <div>
                  <label className="block text-base font-semibold text-foreground mb-2">
                    Upload Images *
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">Add photos of your hostel (required)</p>
                  
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary/50 rounded-lg cursor-pointer hover:bg-primary/5 hover:border-primary transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-primary mb-3" />
                      <p className="text-base font-medium text-foreground mb-1">Click to upload images</p>
                      <p className="text-xs text-muted-foreground">Watermark will be added automatically</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB each</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                    />
                  </label>

                  {/* New Images Preview */}
                  {newImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Selected Images ({newImages.length}):</p>
                      <div className="grid grid-cols-3 gap-4">
                        {newImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border-2 border-primary"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show message if no images */}
                  {newImages.length === 0 && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        ⚠️ Please upload at least one image of your hostel
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="flex-1 gradient-primary border-0 shadow-primary text-primary-foreground font-semibold"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading Images...
                      </>
                    ) : loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
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
