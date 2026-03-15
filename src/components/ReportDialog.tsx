import { useState } from 'react';
import { Flag, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ReportDialogProps {
  hostelId: string;
  hostelName: string;
  agentId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: boolean;
}

const REPORT_REASONS = [
  { value: 'spam_fake', label: 'Spam / Fake listing' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'wrong_info', label: 'Wrong information' },
  { value: 'scam', label: 'Scam or fraud' },
  { value: 'no_exist', label: "Hostel doesn't exist" },
  { value: 'safety', label: 'Safety concerns' },
  { value: 'other', label: 'Other' },
];

const MAX_DETAILS = 300;

const ReportDialog = ({
  hostelId,
  hostelName,
  agentId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  triggerButton = true,
}: ReportDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterName, setReporterName] = useState('');

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    controlledOnOpenChange ? controlledOnOpenChange(val) : setInternalOpen(val);
    if (!val) resetForm();
  };

  const resetForm = () => {
    setReason('');
    setDetails('');
    setIsAnonymous(false);
    setReporterEmail('');
    setReporterName('');
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) { toast.error('Please select a reason'); return; }
    if (!isAnonymous && !reporterEmail.trim()) {
      toast.error('Please enter your email or report anonymously');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('reports').insert([{
        hostel_id: hostelId,
        reporter_email: isAnonymous ? 'anonymous@report.com' : reporterEmail.trim(),
        reporter_name: isAnonymous ? null : (reporterName.trim() || null),
        reason: REPORT_REASONS.find(r => r.value === reason)?.label || reason,
        description: details.trim() || 'No additional details provided.',
        additional_details: null,
        status: 'pending',
      }]);

      if (error) throw error;
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return triggerButton ? (
      <button
        onClick={() => setOpen(true)}
        title="Report this listing if it is fake, spam, or inappropriate."
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
      >
        <Flag className="w-3.5 h-3.5" />
        Report Listing
      </button>
    ) : null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">Report Listing</h2>
              <p className="text-xs text-muted-foreground truncate max-w-[220px]">{hostelName}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          /* ── Confirmation state ── */
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">Report Submitted</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Thank you for reporting. Our team will review this listing and take appropriate action within 24 hours.
            </p>
            <Button onClick={() => setOpen(false)} className="gradient-primary border-0 text-primary-foreground">
              Done
            </Button>
          </div>
        ) : (
          /* ── Form state ── */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <p className="text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2">
              Help keep HostelNG safe. Report listings that are fake, spam, or inappropriate.
            </p>

            {/* Reason */}
            <div>
              <Label htmlFor="report-reason" className="mb-1.5 block">Reason *</Label>
              <div className="grid grid-cols-1 gap-2">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      reason === r.value
                        ? 'border-red-400 bg-red-50 dark:bg-red-950/20 text-foreground'
                        : 'border-border hover:border-muted-foreground/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="accent-red-500"
                    />
                    <span className="text-sm">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="report-details">Additional Details</Label>
                <span className={`text-xs ${MAX_DETAILS - details.length < 30 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {MAX_DETAILS - details.length} left
                </span>
              </div>
              <Textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, MAX_DETAILS))}
                placeholder="Any extra context that might help our team investigate..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Anonymous toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${isAnonymous ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isAnonymous ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-foreground">Report anonymously</span>
            </label>

            {/* Reporter info — hidden when anonymous */}
            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="reporter-name" className="mb-1.5 block text-xs">Your Name (optional)</Label>
                  <input
                    id="reporter-name"
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="reporter-email" className="mb-1.5 block text-xs">Your Email *</Label>
                  <input
                    id="reporter-email"
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                False reports may result in action against your account. Only report genuine issues.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !reason}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 font-semibold"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportDialog;
