import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Phone, Mail, Calendar, Building2,
  Clock, PhoneCall, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Sanitize phone for wa.me — strips non-digits, converts 0XXXXXXXXXX → 234XXXXXXXXXX
const toWhatsAppNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return '234' + digits.slice(1);
  if (digits.startsWith('234')) return digits;
  return digits;
};

const buildWhatsAppUrl = (phone: string, message: string) =>
  `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400' },
  { value: 'viewing_scheduled', label: 'Viewing Scheduled', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' },
  { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' },
];

const getStatusStyle = (status: string) =>
  STATUS_OPTIONS.find((s) => s.value === status)?.color ||
  'bg-secondary text-muted-foreground';

const getStatusLabel = (status: string) =>
  STATUS_OPTIONS.find((s) => s.value === status)?.label || status;

const AgentInquiries = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }
    setUser(session.user);
    loadInquiries(session.user.id);
  };

  const loadInquiries = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_inquiries')
        .select('*')
        .eq('agent_id', userId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error: any) {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('student_inquiries')
        .update({ status })
        .eq('id', id)
        .eq('agent_id', user.id);

      if (error) throw error;

      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );
      toast.success('Status updated');
    } catch (error: any) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filterStatus === 'all'
    ? inquiries
    : inquiries.filter((i) => i.status === filterStatus);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s.value] = inquiries.filter((i) => i.status === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  const newCount = counts['new'] || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Student Inquiries
                </h1>
                {newCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                    {newCount} new
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {inquiries.length} total inquiries across your listings
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              My Listings
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setFilterStatus(s.value === filterStatus ? 'all' : s.value)}
                className={`bg-card border rounded-xl p-4 text-left transition-all hover:shadow-card-hover ${
                  filterStatus === s.value ? 'border-primary ring-1 ring-primary' : 'border-border'
                }`}
              >
                <p className="text-2xl font-bold text-foreground">{counts[s.value] || 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </button>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {['all', ...STATUS_OPTIONS.map((s) => s.value)].map((val) => (
              <button
                key={val}
                onClick={() => setFilterStatus(val)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === val
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {val === 'all' ? `All (${inquiries.length})` : `${getStatusLabel(val)} (${counts[val] || 0})`}
              </button>
            ))}
          </div>

          {/* Inquiry Cards */}
          {filtered.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <MessageSquare className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-foreground mb-2">No inquiries yet</h3>
              <p className="text-muted-foreground text-sm">
                {filterStatus === 'all'
                  ? 'When students contact you about your listings, they will appear here.'
                  : `No inquiries with status "${getStatusLabel(filterStatus)}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((inq) => (
                <div
                  key={inq.id}
                  className={`bg-card rounded-2xl border overflow-hidden transition-shadow hover:shadow-card-hover ${
                    inq.status === 'new' ? 'border-primary/40' : 'border-border'
                  }`}
                >
                  <div className="p-5">
                    {/* Top row: avatar + name + status + date */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold">
                            {inq.student_name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight">{inq.student_name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusStyle(inq.status)}`}>
                            {getStatusLabel(inq.status)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(inq.submitted_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(inq.submitted_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {/* Status Dropdown */}
                        <div className="relative">
                          <select
                            value={inq.status}
                            disabled={updatingId === inq.id}
                            onChange={(e) => updateStatus(inq.id, e.target.value)}
                            className="appearance-none text-xs px-3 py-2 pr-7 rounded-lg border border-border bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                        <span className="truncate">{inq.student_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                        <span>{inq.student_phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                        <span className="truncate">{inq.hostel_title}</span>
                      </div>
                      {inq.move_in_date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                          <span>Move-in: {new Date(inq.move_in_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>

                    {inq.message && (
                      <div className="bg-secondary rounded-lg px-3 py-2.5 text-sm text-muted-foreground italic mb-4">
                        "{inq.message}"
                      </div>
                    )}
                  </div>

                  {/* Contact Action Bar — full width, always visible */}
                  <div className="grid grid-cols-3 border-t border-border divide-x divide-border">
                    <a
                      href={`tel:${inq.student_phone}`}
                      className="flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors group"
                    >
                      <PhoneCall className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
                      Call Student
                    </a>
                    <a
                      href={buildWhatsAppUrl(
                        inq.student_phone,
                        `Hi ${inq.student_name}, I'm responding to your inquiry about ${inq.hostel_title} on HostelNG.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold text-foreground hover:bg-[#25D366] hover:text-white transition-colors group"
                    >
                      <svg className="w-4 h-4 fill-[#25D366] group-hover:fill-white transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </a>
                    <a
                      href={`mailto:${inq.student_email}?subject=${encodeURIComponent(`Re: Your inquiry about ${inq.hostel_title}`)}&body=${encodeURIComponent(`Hi ${inq.student_name},\n\nThank you for your inquiry about ${inq.hostel_title} on HostelNG.\n\n`)}`}
                      className="flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold text-foreground hover:bg-secondary transition-colors group"
                    >
                      <Mail className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
                      Email Student
                    </a>
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

export default AgentInquiries;
