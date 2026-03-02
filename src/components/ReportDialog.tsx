import { useState } from 'react';
import { Flag, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ReportDialogProps {
  hostelId: string;
  hostelName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: boolean;
}

const reportReasons = [
  'Misleading information',
  'Fake photos',
  'Incorrect pricing',
  'Hostel doesn\'t exist',
  'Scam or fraud',
  'Inappropriate content',
  'Safety concerns',
  'Other',
];

const ReportDialog = ({ 
  hostelId, 
  hostelName, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange,
  triggerButton = true 
}: ReportDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: '',
    description: '',
    additionalDetails: '',
  });

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason) {
      toast.error('Please select a reason');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please provide details about the issue');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please provide your email');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('reports').insert([
        {
          hostel_id: hostelId,
          reporter_email: formData.email,
          reporter_name: formData.name || null,
          reporter_phone: formData.phone || null,
          reason: formData.reason,
          description: formData.description,
          additional_details: formData.additionalDetails || null,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      toast.success('Report submitted successfully', {
        description: 'Our team will review this report within 24 hours.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        reason: '',
        description: '',
        additionalDetails: '',
      });
      setOpen(false);
    } catch (error: any) {
      console.error('Failed to submit report:', error);
      toast.error('Failed to submit report', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Report Listing
        </DialogTitle>
        <DialogDescription>
          Report issues with "{hostelName}". Your report will be reviewed by our team.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Your Name (Optional)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="08012345678"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Your Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your.email@example.com"
          />
          <p className="text-xs text-muted-foreground mt-1">
            We'll use this to update you on the report status
          </p>
        </div>

        <div>
          <Label htmlFor="reason">Reason for Report *</Label>
          <select
            id="reason"
            required
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a reason</option>
            {reportReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Please provide details about the issue..."
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Minimum 10 characters
          </p>
        </div>

        <div>
          <Label htmlFor="additionalDetails">Additional Details (Optional)</Label>
          <Textarea
            id="additionalDetails"
            value={formData.additionalDetails}
            onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
            placeholder="Any other information that might help us investigate..."
            rows={2}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            E.g., dates visited, people contacted, screenshots taken, etc.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Note:</strong> False reports may result in action against your account. 
            Please only report genuine issues.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerButton && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600">
            <Flag className="w-4 h-4 mr-2" />
            Report Listing
          </Button>
        </DialogTrigger>
      )}
      {dialogContent}
    </Dialog>
  );
};

export default ReportDialog;
