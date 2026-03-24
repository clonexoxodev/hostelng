import { useState } from 'react';
import { X, Send, Calendar, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface InquiryFormProps {
  hostel: {
    id: string;
    name: string;
    owner_id: string;
    contact_phone?: string;
    contact_email?: string;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

const InquiryForm = ({ hostel, onClose, onSuccess }: InquiryFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    student_phone: '',
    move_in_date: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkDuplicate = async (): Promise<boolean> => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('student_inquiries')
      .select('id')
      .eq('student_email', formData.student_email)
      .eq('hostel_id', hostel.id)
      .gte('submitted_at', oneDayAgo)
      .limit(1);
    return (data?.length ?? 0) > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Duplicate check
      const isDuplicate = await checkDuplicate();
      if (isDuplicate) {
        toast.error('You already sent an inquiry for this property today. Please wait 24 hours before submitting again.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('student_inquiries').insert([{
        student_name: formData.student_name,
        student_email: formData.student_email,
        student_phone: formData.student_phone,
        move_in_date: formData.move_in_date || null,
        message: formData.message || null,
        hostel_id: hostel.id,
        hostel_title: hostel.name,
        agent_id: hostel.owner_id,
        status: 'new',
      }]);

      if (error) throw error;

      onClose();
      if (onSuccess) {
        onSuccess();
        toast.success('Inquiry sent! Owner contact details are now visible below.');
      } else {
        // fallback: navigate to confirmation page
        navigate(`/inquiry-sent/${hostel.id}`, {
          state: {
            hostelName: hostel.name,
            studentName: formData.student_name,
            agentPhone: hostel.contact_phone,
            agentEmail: hostel.contact_email,
          },
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Contact Owner</h2>
            <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-[280px]">{hostel.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student_name" className="flex items-center gap-1.5 mb-1.5">
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
              <Label htmlFor="student_phone" className="flex items-center gap-1.5 mb-1.5">
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

          <div>
            <Label htmlFor="student_email" className="flex items-center gap-1.5 mb-1.5">
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

          <div>
            <Label htmlFor="move_in_date" className="flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5" /> Preferred Move-in Date
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

          <div>
            <Label htmlFor="message" className="flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Message (Optional)
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any questions or specific requirements..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">
            Your contact details will be shared with the property owner so they can reach you directly.
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 gradient-primary border-0 shadow-primary text-primary-foreground font-semibold"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Inquiry
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InquiryForm;
