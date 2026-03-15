import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertTriangle, Eye, CheckCircle, X, Clock,
  Filter, ExternalLink, Trash2, ShieldAlert, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const SUPER_ADMIN = 'clonexoxo80@gmail.com';

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400', icon: Clock },
  reviewing: { label: 'Reviewing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400',         icon: Eye },
  resolved:  { label: 'Resolved',  color: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400',     icon: CheckCircle },
  dismissed: { label: 'Dismissed', color: 'bg-secondary text-muted-foreground',                                        icon: X },
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
];

const AdminReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterReason, setFilterReason] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selected, setSelected] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { checkAdmin(); }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.email !== SUPER_ADMIN) {
      toast.error('Access denied');
      navigate('/');
      return;
    }
    loadReports();
  };

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*, hostels(id, name, location, owner_id)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          admin_notes: adminNotes || null,
          resolved_at: ['resolved', 'dismissed'].includes(status) ? new Date().toISOString() : null,
          resolved_by: SUPER_ADMIN,
        })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Report marked as ${status}`);
      setSelected(null);
      setAdminNotes('');
      loadReports();
    } catch {
      toast.error('Failed to update report');
    } finally {
      setUpdating(false);
    }
  };

  const deleteListing = async (hostelId: string, reportId: string) => {
    if (!confirm('This will permanently delete the listing. Continue?')) return;
    setUpdating(true);
    try {
      await supabase.from('hostels').delete().eq('id', hostelId);
      await supabase.from('reports').update({ status: 'resolved', admin_notes: 'Listing removed by admin.' }).eq('id', reportId);
      toast.success('Listing removed');
      setSelected(null);
      loadReports();
    } catch {
      toast.error('Failed to remove listing');
    } finally {
      setUpdating(false);
    }
  };

  // Unique reasons for filter
  const reasons = Array.from(new Set(reports.map((r) => r.reason))).filter(Boolean);

  const filtered = reports
    .filter((r) => filterStatus === 'all' || r.status === filterStatus)
    .filter((r) => filterReason === 'all' || r.reason === filterReason)
    .sort((a, b) =>
      sortBy === 'oldest'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const counts = Object.keys(STATUS_META).reduce((acc, s) => {
    acc[s] = reports.filter((r) => r.status === s).length;
    return acc;
  }, {} as Record<string, number>);

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
              Reports Management
            </h1>
            <p className="text-muted-foreground text-sm">{reports.length} total reports</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/admin">← Admin</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(STATUS_META).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(key === filterStatus ? 'all' : key)}
                className={`bg-card border rounded-xl p-4 text-left transition-all hover:shadow-card-hover ${
                  filterStatus === key ? 'border-primary ring-1 ring-primary' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground capitalize">{meta.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{counts[key] || 0}</p>
              </button>
            );
          })}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 mb-5 items-center">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </div>

          {/* Status tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {['all', ...Object.keys(STATUS_META)].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                  filterStatus === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {s === 'all' ? `All (${reports.length})` : `${STATUS_META[s].label} (${counts[s] || 0})`}
              </button>
            ))}
          </div>

          {/* Reason filter */}
          {reasons.length > 0 && (
            <div className="relative ml-auto">
              <select
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value)}
                className="appearance-none text-xs px-3 py-2 pr-7 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Reasons</option>
                {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
          )}

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none text-xs px-3 py-2 pr-7 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Report cards */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <ShieldAlert className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No reports match the current filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((report) => {
              const meta = STATUS_META[report.status] || STATUS_META.pending;
              const Icon = meta.icon;
              return (
                <div
                  key={report.id}
                  className={`bg-card border rounded-xl p-4 transition-shadow hover:shadow-card-hover ${
                    report.status === 'pending' ? 'border-yellow-300/60 dark:border-yellow-800/40' : 'border-border'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Left info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="font-semibold text-foreground text-sm truncate">
                        {report.hostels?.name || 'Unknown listing'}
                      </p>
                      <p className="text-xs text-muted-foreground">{report.hostels?.location}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-foreground">{report.reason}</span>
                        <span className="text-xs text-muted-foreground">
                          by {report.reporter_name || (report.reporter_email === 'anonymous@report.com' ? 'Anonymous' : report.reporter_email)}
                        </span>
                      </div>
                      {report.description && report.description !== 'No additional details provided.' && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 italic">"{report.description}"</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSelected(report); setAdminNotes(report.admin_notes || ''); }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        Review
                      </Button>
                      {report.hostels?.id && (
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/hostels/${report.hostels.id}`} target="_blank">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      )}
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
              <h2 className="font-display font-bold text-lg text-foreground">Report Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Listing */}
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Listing</p>
                <p className="font-semibold text-foreground">{selected.hostels?.name}</p>
                <p className="text-xs text-muted-foreground">{selected.hostels?.location}</p>
                {selected.hostels?.id && (
                  <Link
                    to={`/hostels/${selected.hostels.id}`}
                    target="_blank"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    <ExternalLink className="w-3 h-3" /> View listing
                  </Link>
                )}
              </div>

              {/* Reason + description */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reason</p>
                <span className="text-sm font-medium text-foreground bg-secondary px-2 py-1 rounded-lg">{selected.reason}</span>
              </div>

              {selected.description && selected.description !== 'No additional details provided.' && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Details</p>
                  <p className="text-sm text-foreground bg-secondary rounded-lg p-3 whitespace-pre-line">{selected.description}</p>
                </div>
              )}

              {/* Reporter */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reported by</p>
                <p className="text-sm text-foreground">
                  {selected.reporter_email === 'anonymous@report.com'
                    ? 'Anonymous'
                    : `${selected.reporter_name || ''} (${selected.reporter_email})`}
                </p>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Status</p>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${STATUS_META[selected.status]?.color}`}>
                  {STATUS_META[selected.status]?.label}
                </span>
              </div>

              {/* Admin notes */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Take Action</p>
                <div className="grid grid-cols-2 gap-2">
                  {selected.status === 'pending' && (
                    <Button
                      onClick={() => updateStatus(selected.id, 'reviewing')}
                      disabled={updating}
                      variant="outline"
                      className="col-span-2"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Mark as Reviewing
                    </Button>
                  )}
                  {['pending', 'reviewing'].includes(selected.status) && (
                    <>
                      <Button
                        onClick={() => updateStatus(selected.id, 'resolved')}
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700 text-white border-0"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        Resolve
                      </Button>
                      <Button
                        onClick={() => updateStatus(selected.id, 'dismissed')}
                        disabled={updating}
                        variant="outline"
                      >
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Dismiss
                      </Button>
                    </>
                  )}
                  {selected.hostels?.id && ['pending', 'reviewing'].includes(selected.status) && (
                    <Button
                      onClick={() => deleteListing(selected.hostels.id, selected.id)}
                      disabled={updating}
                      className="col-span-2 bg-red-600 hover:bg-red-700 text-white border-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Remove Listing
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
