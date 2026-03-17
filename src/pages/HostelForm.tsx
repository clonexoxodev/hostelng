import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2, FileText, GraduationCap, DollarSign, Phone, Camera, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { watermarkImages } from '@/lib/watermark';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const UNIVERSITIES = [
  "Ekiti State University (EKSU)",
  "Federal University Oye-Ekiti (FUOYE)",
  "Bamidele Olumilua University of Education, Science and Technology (BOUESTI)",
  "Federal University of Technology and Environmental Sciences, Iyin-Ekiti",
  "Federal Polytechnic Ado-Ekiti",
  "Ekiti State Polytechnic, Isan-Ekiti",
  "College of Education, Ikere-Ekiti",
];

const AREAS = ["Ado-Ekiti", "Oye-Ekiti", "Ikole-Ekiti", "Ikere-Ekiti", "Iyin-Ekiti", "Isan-Ekiti"];

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm";
const labelCls = "block text-sm font-semibold text-foreground mb-1.5";

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => (
  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-4.5 h-4.5 text-primary" />
    </div>
    <div>
      <h2 className="font-display font-bold text-base text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

interface FormData {
  name: string; location: string; area: string; university: string;
  price: string; listing_type: string; gender: string; description: string;
  contact_phone: string; contact_email: string; rooms_available: string;
}

const HostelForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '', location: '', area: '', university: '', price: '',
    listing_type: 'semester', gender: '', description: '',
    contact_phone: '', contact_email: '', rooms_available: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [customArea, setCustomArea] = useState("");

  useEffect(() => { if (isEdit) loadHostel(); }, [id]);

  const loadHostel = async () => {
    try {
      const { data, error } = await supabase.from('hostels').select('*').eq('id', id).single();
      if (error) throw error;
      setFormData({
        name: data.name || '', location: data.location || '', area: data.area || '',
        university: data.university || '', price: data.price?.toString() || '',
        listing_type: data.listing_type || 'semester', gender: data.gender || '',
        description: data.description || '',
        contact_phone: data.contact_phone || '', contact_email: data.contact_email || '',
        rooms_available: data.rooms_available?.toString() || '',
      });
      // If saved area isn't in the preset list, treat it as custom
      if (data.area && !AREAS.includes(data.area)) {
        setFormData(prev => ({ ...prev, area: 'other' }));
        setCustomArea(data.area);
      }
      setImages(data.images || []);
    } catch (error: any) {
      toast.error('Failed to load listing: ' + error.message);
      navigate('/dashboard');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    toast.info('Processing images...', { duration: 2000 });
    try {
      const watermarked = await watermarkImages(files);
      setNewImages(prev => [...prev, ...watermarked]);
      toast.success('Images ready!');
    } catch {
      setNewImages(prev => [...prev, ...files]);
    }
  };

  const removeNewImage = (i: number) => setNewImages(prev => prev.filter((_, idx) => idx !== i));
  const removeExistingImage = (i: number) => setImages(prev => prev.filter((_, idx) => idx !== i));

  const uploadImages = async (userId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of newImages) {
      const ext = file.name.split('.').pop();
      const path = `${userId}/${Date.now()}-${Math.random()}.${ext}`;
      const { error } = await supabase.storage.from('hostel-images').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('hostel-images').getPublicUrl(path);
      urls.push(publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      setUploading(true);
      const uploaded = await uploadImages(user.id);
      setUploading(false);
      const hostelData = {
        name: formData.name, location: formData.location,
        area: formData.area === 'other' ? customArea : formData.area,
        university: formData.university, price: parseFloat(formData.price),
        listing_type: formData.listing_type, gender: formData.gender,
        description: formData.description,
        contact_phone: formData.contact_phone, contact_email: formData.contact_email,
        rooms_available: parseInt(formData.rooms_available),
        images: [...images, ...uploaded],
        owner_id: user.id, featured: false, rating: 0,
      };
      if (isEdit) {
        const { error } = await supabase.from('hostels').update(hostelData).eq('id', id);
        if (error) throw error;
        toast.success('Listing updated!');
      } else {
        const { error } = await supabase.from('hostels').insert([hostelData]);
        if (error) throw error;
        toast.success('Listing created!');
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save listing');
    } finally {
      setLoading(false); setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">

          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {isEdit ? 'Edit Listing' : 'Add New Listing'}
              </h1>
              <p className="text-muted-foreground text-sm">All fields marked * are required</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Section 1: Basic Info */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <SectionHeader icon={FileText} title="Basic Information" subtitle="Help students identify your listing" />
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className={labelCls}>Heading *</label>
                  <input id="name" name="name" required value={formData.name} onChange={handleChange}
                    className={inputCls} placeholder="e.g., Spacious self-contained room near EKSU gate" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="university" className={labelCls}>Nearest University *</label>
                    <select id="university" name="university" required value={formData.university} onChange={handleChange} className={inputCls}>
                      <option value="">Select university...</option>
                      {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="area" className={labelCls}>Area / Town *</label>
                    <select id="area" name="area" required value={formData.area} onChange={handleChange} className={inputCls}>
                      <option value="">Select area...</option>
                      {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                      <option value="other">Other</option>
                    </select>
                    {formData.area === 'other' && (
                      <input
                        type="text"
                        required
                        value={customArea}
                        onChange={e => setCustomArea(e.target.value)}
                        className={`${inputCls} mt-2`}
                        placeholder="Enter your area / neighbourhood"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="location" className={labelCls}>Full Address *</label>
                  <input id="location" name="location" required value={formData.location} onChange={handleChange}
                    className={inputCls} placeholder="e.g., No. 5 Ajilosun Street, behind EKSU main gate" />
                </div>
                <div>
                  <label htmlFor="description" className={labelCls}>Description *</label>
                  <textarea id="description" name="description" required rows={4} value={formData.description} onChange={handleChange}
                    className={`${inputCls} resize-none`}
                    placeholder="Describe the apartment — facilities, environment, distance from campus, security, water supply, etc." />
                </div>
              </div>
            </div>

            {/* Section 2: Property Details */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <SectionHeader icon={GraduationCap} title="Property Details" subtitle="Tell students what type of accommodation this is" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gender" className={labelCls}>Gender *</label>
                    <select id="gender" name="gender" required value={formData.gender} onChange={handleChange} className={inputCls}>
                      <option value="">Select...</option>
                      <option value="male_only">Male Only</option>
                      <option value="female_only">Female Only</option>
                      <option value="mixed">Mixed</option>
                      <option value="not_specified">Not Specified</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="rooms_available" className={labelCls}>Rooms / Spaces Available *</label>
                    <input id="rooms_available" name="rooms_available" type="number" required min="1"
                      value={formData.rooms_available} onChange={handleChange} className={inputCls} placeholder="e.g., 5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Pricing */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <SectionHeader icon={DollarSign} title="Pricing" subtitle="Set your price and payment duration" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="listing_type" className={labelCls}>Payment Duration *</label>
                  <select id="listing_type" name="listing_type" required value={formData.listing_type} onChange={handleChange} className={inputCls}>
                    <option value="semester">Per Semester</option>
                    <option value="session">Per Session</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="price" className={labelCls}>
                    Price (₦) per {formData.listing_type === 'semester' ? 'Semester' : 'Session'} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₦</span>
                    <input id="price" name="price" type="number" required min="0" value={formData.price} onChange={handleChange}
                      className={`${inputCls} pl-8`} placeholder="e.g., 150000" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Contact */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <SectionHeader icon={Phone} title="Contact Details" subtitle="Students will see this after submitting an inquiry" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact_phone" className={labelCls}>Phone Number *</label>
                  <input id="contact_phone" name="contact_phone" type="tel" required value={formData.contact_phone} onChange={handleChange}
                    className={inputCls} placeholder="e.g., 08012345678" />
                </div>
                <div>
                  <label htmlFor="contact_email" className={labelCls}>Email Address *</label>
                  <input id="contact_email" name="contact_email" type="email" required value={formData.contact_email} onChange={handleChange}
                    className={inputCls} placeholder="e.g., yourname@email.com" />
                </div>
              </div>
            </div>

            {/* Section 5: Photos */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <SectionHeader icon={Camera} title="Photos" subtitle="Upload clear photos to attract more students" />

              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-primary/40 rounded-xl cursor-pointer hover:bg-primary/5 hover:border-primary transition-all p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <p className="font-semibold text-foreground mb-1">Click to upload photos</p>
                <p className="text-xs text-muted-foreground mb-1">Upload clear photos of the room, bathroom, kitchen, and surroundings</p>
                <p className="text-xs text-muted-foreground">PNG, JPG — up to 10MB each. Watermark added automatically.</p>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageSelect} />
              </label>

              {images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground mb-3">Current Photos ({images.length})</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((url, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
                        <button type="button" onClick={() => removeExistingImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground mb-3">New Photos ({newImages.length})</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {newImages.map((file, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover rounded-xl border-2 border-primary" />
                        {i === 0 && images.length === 0 && (
                          <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">Cover</span>
                        )}
                        <button type="button" onClick={() => removeNewImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isEdit && newImages.length === 0 && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <span className="text-amber-500 text-base">⚠</span>
                  <p className="text-xs text-amber-800 dark:text-amber-200">At least one photo is required.</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading || uploading}
                className="flex-1 gradient-primary border-0 shadow-primary text-primary-foreground font-bold text-base py-6">
                {uploading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Uploading Photos...</>
                ) : loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{isEdit ? 'Saving...' : 'Creating...'}</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5 mr-2" />{isEdit ? 'Save Changes' : 'Post Listing'}</>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} disabled={loading} className="px-6">
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
