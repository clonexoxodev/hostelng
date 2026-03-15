import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { watermarkImages } from '@/lib/watermark';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

interface HostelFormData {
  name: string;
  location: string;
  area: string;
  university: string;
  price: string;
  listing_type: string;
  gender: string;
  description: string;
  amenities: string;
  contact_phone: string;
  contact_email: string;
  rooms_available: string;
}

const GENDER_OPTIONS = [
  { value: "male_only",     label: "Male Only" },
  { value: "female_only",   label: "Female Only" },
  { value: "mixed",         label: "Mixed" },
  { value: "not_specified", label: "Not Specified" },
];

const NIGERIAN_UNIVERSITIES = [
  "Abia State University (ABSU)",
  "Afe Babalola University (ABUAD)",
  "Ahmadu Bello University (ABU)",
  "Ajayi Crowther University (ACU)",
  "Ambrose Alli University (AAU)",
  "Babcock University",
  "Bayero University Kano (BUK)",
  "Benson Idahosa University",
  "Bowen University",
  "Covenant University",
  "Crawford University",
  "Cross River University of Technology (CRUTECH)",
  "Delta State University (DELSU)",
  "Ekiti State University (EKSU)",
  "Enugu State University of Science and Technology (ESUT)",
  "Federal University of Agriculture Abeokuta (FUNAAB)",
  "Federal University of Technology Akure (FUTA)",
  "Federal University of Technology Minna (FUTMINNA)",
  "Federal University of Technology Owerri (FUTO)",
  "Federal University Oye-Ekiti (FUOYE)",
  "Fountain University",
  "Igbinedion University",
  "Imo State University (IMSU)",
  "Joseph Ayo Babalola University (JABU)",
  "Kogi State University",
  "Kwara State University (KWASU)",
  "Lagos State University (LASU)",
  "Landmark University",
  "Lead City University",
  "Madonna University",
  "Michael Okpara University of Agriculture (MOUAU)",
  "Nnamdi Azikiwe University (UNIZIK)",
  "Obafemi Awolowo University (OAU)",
  "Olabisi Onabanjo University (OOU)",
  "Pan-Atlantic University",
  "Polytechnic Ibadan (IBADANPOLY)",
  "Redeemer's University",
  "Rivers State University (RSU)",
  "University of Abuja (UNIABUJA)",
  "University of Benin (UNIBEN)",
  "University of Calabar (UNICAL)",
  "University of Ibadan (UI)",
  "University of Ilorin (UNILORIN)",
  "University of Jos (UNIJOS)",
  "University of Lagos (UNILAG)",
  "University of Maiduguri (UNIMAID)",
  "University of Nigeria Nsukka (UNN)",
  "University of Port Harcourt (UNIPORT)",
  "Veritas University",
  "Wesley University",
].sort();

const HostelForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<HostelFormData>({
    name: '',
    location: '',
    area: '',
    university: '',
    price: '',
    listing_type: 'semester',
    gender: '',
    description: '',
    amenities: '',
    contact_phone: '',
    contact_email: '',
    rooms_available: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    if (isEdit) {
      loadHostel();
    }
  }, [id]);

  const loadHostel = async () => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name || '',
        location: data.location || '',
        area: data.area || '',
        university: data.university || '',
        price: data.price?.toString() || '',
        listing_type: data.listing_type || 'semester',
        gender: data.gender || '',
        description: data.description || '',
        amenities: data.amenities?.join(', ') || '',
        contact_phone: data.contact_phone || '',
        contact_email: data.contact_email || '',
        rooms_available: data.rooms_available?.toString() || '',
      });
      setImages(data.images || []);
    } catch (error: any) {
      toast.error('Failed to load hostel: ' + error.message);
      navigate('/dashboard');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  const removeExistingImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
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
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      setUploading(true);
      const uploadedImages = await uploadImages(user.id);
      setUploading(false);

      const allImages = [...images, ...uploadedImages];

      const hostelData = {
        name: formData.name,
        location: formData.location,
        area: formData.area,
        university: formData.university,
        price: parseFloat(formData.price),
        listing_type: formData.listing_type,
        gender: formData.gender,
        description: formData.description,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        rooms_available: parseInt(formData.rooms_available),
        images: allImages,
        owner_id: user.id,
        featured: false,
        rating: 0,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('hostels')
          .update(hostelData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Hostel updated successfully!');
      } else {
        const { error } = await supabase
          .from('hostels')
          .insert([hostelData]);

        if (error) throw error;
        toast.success('Hostel created successfully!');
      }

      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save hostel');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-20 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="bg-card rounded-xl border border-border p-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">
            {isEdit ? 'Edit Hostel' : 'Add New Hostel'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Hostel Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Sunshine Hostel"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="university">University *</Label>
                <select
                  id="university"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select university...</option>
                  {NIGERIAN_UNIVERSITIES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="area">Area / Neighbourhood *</Label>
                <Input
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Bodija, Omu-Aran, Agbowo"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Full Address / Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="e.g., 12 Bodija Road, opposite UI gate"
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select gender...</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="listing_type">Listing Type *</Label>
                <select
                  id="listing_type"
                  name="listing_type"
                  value={formData.listing_type}
                  onChange={handleInputChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="semester">Semester</option>
                  <option value="session">Session</option>
                </select>
              </div>

              <div>
                <Label htmlFor="price">
                  Price (₦) per {formData.listing_type === 'semester' ? 'Semester' : 'Session'} *
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 150000"
                />
              </div>

              <div>
                <Label htmlFor="rooms_available">Rooms Available *</Label>
                <Input
                  id="rooms_available"
                  name="rooms_available"
                  type="number"
                  value={formData.rooms_available}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Describe your hostel..."
              />
            </div>

            <div>
              <Label htmlFor="amenities">Amenities (comma-separated) *</Label>
              <Input
                id="amenities"
                name="amenities"
                value={formData.amenities}
                onChange={handleInputChange}
                required
                placeholder="e.g., WiFi, Security, Water Supply, Parking"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_phone">Contact Phone *</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 08012345678"
                />
              </div>

              <div>
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., contact@hostel.com"
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Upload Images *</Label>
              <p className="text-xs text-muted-foreground mb-2">Add photos of your hostel (required)</p>
              <div className="mt-2">
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
              </div>

              {/* Existing Images */}
              {images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Current Images:</p>
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Hostel ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
              {!isEdit && newImages.length === 0 && (
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
                className="gradient-primary border-0 shadow-primary text-primary-foreground"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading Images...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEdit ? 'Update Hostel' : 'Create Hostel'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={loading || uploading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HostelForm;
