import { useState } from 'react';
import { X, Send, User, Phone, Mail, MapPin, Calendar, MessageSquare, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RequestHomeFormProps {
  onClose: () => void;
}

const HOUSING_TYPES = [
  { value: 'hostel',            label: 'Hostel' },
  { value: 'shared',            label: 'Shared Apartment' },
  { value: 'private_apartment', label: 'Private Apartment' },
];

const BUDGET_OPTIONS = [
  { label: '₦100,000 and below',    min: 0,      max: 100000 },
  { label: '₦100,000 – ₦200,000',   min: 100000, max: 200000 },
  { label: '₦200,000 – ₦300,000',   min: 200000, max: 300000 },
  { label: '₦300,000 – ₦400,000',   min: 300000, max: 400000 },
  { label: '₦400,000 – ₦500,000',   min: 400000, max: 500000 },
  { label: '₦500,000+',             min: 500000, max: 9999999 },
];

const RequestHomeForm = ({ onClose }: RequestHomeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    student_name:       '',
    student_email:      '',
    student_phone:      '',
    budget_index:       '',
    preferred_location: '',
    housing_type:       '',
    move_in_date:       '',
    notes:              '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Resolve budget range
      const budgetIdx = parseInt(formData.budget_index);
      const budget = isNaN(budgetIdx) ? null : BUDGET_OPTIONS[budgetIdx];

      // Get default assigned agent from platform settings
      const { data: settingData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'default_request_home_agent')
        .single();

      const assignedAgentId = settingData?.value || null;

      const { error } = await supabase.from('home_requests').insert([{
        student_name:       formData.student_name,
        student_email:      formData.student_email,
        student_phone:      formData.student_phone,
        budget_min:         budget?.min ?? null,
        budget_max:         budget?.max ?? null,
        preferred_location: formData.preferred_location,
        housing_type:       formData.housing_type,
        move_in_date:       formData.move_in_date || null,
        notes:              formData.notes || null,
        assigned_agent_id:  assignedAgentId,
        status:             assignedAgentId ? 'assigned' : 'pending',
      }]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Request a Home</h2>
              <p className="text-xs text-muted-foreground">Tell us what you need — we'll find it for you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          /* Success screen */
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Request Submitted!</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Your housing request has been received. A property owner will review your requirements and reach out to you shortly.
            </p>
            <Button onClick={onClose} className="gradient-primary border-0 text-primary-foreground px-8">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student_name" className="flex items-center gap-1.5 mb-1.5 text-sm">
                  <User className="w-3.5 h-3.5" /> Full Name *
                </Label>
                <Input
                  id="student_name"
                  name="student_name"
                  required
                  value={formData.student_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="student_phone" className="flex items-center gap-1.5 mb-1.5 text-sm">
                  <Phone className="w-3.5 h-3.5" /> Phone Number *
                </Label>
                <Input
                  id="student_phone"
                  name="student_phone"
                  type="tel"
                  required
                  value={formData.student_phone}
                  onChange={handleChange}
                  placeholder="08012345678"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="student_email" className="flex items-center gap-1.5 mb-1.5 text-sm">
                <Mail className="w-3.5 h-3.5" /> Email Address *
              </Label>
              <Input
                id="student_email"
                name="student_email"
                type="email"
                required
                value={formData.student_email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>

            {/* Location + Housing type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferred_location" className="flex items-center gap-1.5 mb-1.5 text-sm">
                  <MapPin className="w-3.5 h-3.5" /> Preferred Location *
                </Label>
                <Input
                  id="preferred_location"
                  name="preferred_location"
                  required
                  value={formData.preferred_location}
                  onChange={handleChange}
                  placeholder="e.g., Bodija, Omu-Aran"
                />
              </div>
              <div>
                <Label htmlFor="housing_type" className="flex items-center gap-1.5 mb-1.5 text-sm">
                  <Home className="w-3.5 h-3.5" /> Housing Type *
                </Label>
                <select
                  id="housing_type"
                  name="housing_type"
                  required
                  value={formData.housing_type}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select type...</option>
                  {HOUSING_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget + Move-in date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget_index" className="mb-1.5 text-sm block">Budget Range *</Label>
                <select
                  id="budget_index"
                  name="budget_index"
                  required
                  value={formData.budget_index}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select budget...</option>
                  {BUDGET_OPTIONS.map((b, i) => (
                    <option key={i} value={i}>{b.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="move_in_date" className="flex items-center gap-1.5 mb-1.5 text-sm">
                  <Calendar className="w-3.5 h-3.5" /> Move-in Date
                </Label>
                <Input
                  id="move_in_date"
                  name="move_in_date"
                  type="date"
                  value={formData.move_in_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="flex items-center gap-1.5 mb-1.5 text-sm">
                <MessageSquare className="w-3.5 h-3.5" /> Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any specific requirements, preferences, or questions..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">
              A property owner will review your request and contact you directly with suitable options.
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 gradient-primary border-0 shadow-primary text-primary-foreground font-semibold"
              >
                {loading ? 'Submitting...' : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestHomeForm;
