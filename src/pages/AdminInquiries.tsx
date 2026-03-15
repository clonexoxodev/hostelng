import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MessageSquare, Building2, Mail, Phone, Calendar,
  ChevronDown, X, Search, ExternalLink, User, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const SUPER_ADMIN = 'clonexoxo80@gmail.com';

const STATUS_META: Record<string, { label: string; color: string }> = {
  new:               { label: 'New',              color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
  contacted:         { label: 'Contacted',         color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400' },
  viewing_scheduled: { label: 'Viewing Scheduled', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' },
  closed:            { label: 'Closed',            color: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' },
};

const AdminInquiries = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries]     = useState<any[]>([]);
  const [hostels, setHostels]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterHostel, setFilterHostel] = useState('all');
  const [sortBy, setSortBy]           = useState('newest');
  const [selected, setSelected]       = useState<any | null>(null);

  useEffect(() => { checkAdmin(); }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.email !== SUPER_ADMIN) {
      toast.error('Access denied');
      navigate('/');
      return;
    }
    loadData();
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: inqData, error: inqErr }, { data: hostelData, error: hostelErr }] = await Promise.all([
        supabase
          .from('student_inquiries')
          .select('*')
          .order('submitted_at', { ascending: false }),
        supabase
          .from('hostels')
          .select('id, name, owner_id')
          .order('name'),
      ]);

      if (inqErr) throw inqErr;
      if (hostelErr) console.error('Hostels load error:', hostelErr);

      setInquiries(inqData || []);
      setHostels(hostelData || []);
    } catch {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  // Per-listing stats
  const listingStats = hostels.map((h) => {
    const hostelInquiries = inquiries.filter((i) => i.hostel_id === h.id);
    const latest = hostelInquiries[0]?.submitted_at;
    return {
      id: h.id,
      name: h.name,
      total: hostelInquiries.length,
      newCount: hostelInquiries.filter((i) => i.status === 'new').length,
      latestDate: latest ? new Date(latest).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
    };
  }).filter((s) => s.total > 0).sort((a, b) => b.total - a.total);

  // Filtered list
  const filtered = inquiries
    .filter((i) => filterStatus === 'all' || i.status === filterStatus)
    .filter((i) => filterHostel === 'all' || i.hostel_id === filterHostel)
    .filter((i) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        i.student_name?.toLowerCase().includes(q) ||
        i.student_email?.toLowerCase().includes(q) ||
        i.hostel_title?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) =>
      sortBy === 'oldest'
        ? new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
        : new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );

  const totalNew = inquiries.filter((i) => i.status === 'new').length;

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

      <div className="container mx-auto px-4 py-8 mt-16 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Inquiry Monitoring
              </h1>
              {totalNew > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                  {totalNew} new
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{inquiries.length} total inquiries across all listings</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/superadmin">← Super Admin</Link>
          </Button>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key === filterStatus ? 'all' : key)}
              className={`bg-card border rounded-xl p-4 text-left transition-all hover:shadow-md ${
                filterStatus === key ? 'border-primary ring-1 ring-primary' : 'border-border'
              }`}
            >
              <p className="text-2xl font-bold text-foreground">
                {inquiries.filter((i) => i.status === key).length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{meta.label}</p>
            </button>
          ))}
        </div>

        {/* Per-listing breakdown */}
        {listingStats.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-8">
            <h2 className="font-display font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Inquiries Per Listing
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 text-xs text-muted-foreground font-medium">Listing</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium text-center">Total</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium text-center">New</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium">Latest</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {listingStats.map((s) => (
                    <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-2.5 pr-4 font-medium text-foreground truncate max-w-[200px]">{s.name}</td>
                      <td className="py-2.5 text-center">
                        <span className="font-bold text-foreground">{s.total}</span>
                      </td>
                      <td className="py-2.5 text-center">
                        {s.newCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">{s.newCount}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5 text-muted-foreground text-xs">{s.latestDate}</td>
                      <td className="py-2.5">
                        <button
                          onClick={() => { setFilterHostel(s.id); setFilterStatus('all'); }}
                          className="text-xs text-primary hover:underline"
                        >
                          Filter
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or listing..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none text-xs px-3 py-2 pr-7 rounded-lg border border-border bg-background text-foreground focus:outline-none"
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>

          {/* Hostel filter */}
          <div className="relative">
            <select
              value={filterHostel}
              onChange={(e) => setFilterHostel(e.target.value)}
              className="appearance-none text-xs px-3 py-2 pr-7 rounded-lg border border-border bg-background text-foreground focus:outline-none max-w-[180px]"
            >
              <option value="all">All Listings</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none text-xs px-3 py-2 pr-7 rounded-lg border border-border bg-background text-foreground focus:outline-none"
            >
              <option value="newest">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>

          {/* Clear filters */}
          {(filterStatus !== 'all' || filterHostel !== 'all' || search) && (
            <button
              onClick={() => { setFilterStatus('all'); setFilterHostel('all'); setSearch(''); }}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-4">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>

        {/* Inquiry list */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No inquiries match the current filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((inq) => {
              const meta = STATUS_META[inq.status] || STATUS_META.new;
              return (
                <div
                  key={inq.id}
                  className={`bg-card border rounded-xl p-4 transition-shadow hover:shadow-md cursor-pointer ${
                    inq.status === 'new' ? 'border-primary/40' : 'border-border'
                  }`}
                  onClick={() => setSelected(inq)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-sm">
                          {inq.student_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground text-sm">{inq.student_name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{inq.hostel_title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <span className="hidden sm:block">{inq.student_email}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(inq.submitted_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-primary/60" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-display font-bold text-lg text-foreground">Inquiry Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Status */}
              <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_META[selected.status]?.color}`}>
                {STATUS_META[selected.status]?.label}
              </span>

              {/* Listing */}
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Listing</p>
                <p className="font-semibold text-foreground">{selected.hostel_title}</p>
                <Link
                  to={`/hostels/${selected.hostel_id}`}
                  target="_blank"
                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="w-3 h-3" /> View listing
                </Link>
              </div>

              {/* Student info */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Student Info</p>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  {selected.student_name}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  {selected.student_email}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  {selected.student_phone}
                </div>
                {selected.move_in_date && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    Move-in: {new Date(selected.move_in_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </div>

              {/* Message */}
              {selected.message && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Message</p>
                  <p className="text-sm text-foreground bg-secondary rounded-lg p-3 italic">"{selected.message}"</p>
                </div>
              )}

              {/* Submitted */}
              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                Submitted: {new Date(selected.submitted_at).toLocaleString('en-NG', {
                  day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
