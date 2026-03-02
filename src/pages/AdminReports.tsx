import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, CheckCircle, X, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Report {
  id: string;
  hostel_id: string;
  reporter_email: string;
  reporter_name: string | null;
  reporter_phone?: string | null;
  reason: string;
  description: string;
  additional_details?: string | null;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  created_at: string;
  hostels: {
    name: string;
    location: string;
  };
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  reviewing: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  dismissed: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusIcons = {
  pending: Clock,
  reviewing: Eye,
  resolved: CheckCircle,
  dismissed: X,
};

const AdminReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (reports.length === 0 && !loading) {
      loadReports();
    }
  }, [filter]);

  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== 'clonexoxo80@gmail.com') {
        toast.error('Access denied');
        navigate('/');
        return;
      }
      loadReports();
    } catch (error) {
      navigate('/');
    }
  };

  const loadReports = async () => {
    try {
      let query = supabase
        .from('reports')
        .select(`
          *,
          hostels (
            name,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast.error('Failed to load reports');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          admin_notes: adminNotes || null,
          resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null,
          resolved_by: 'clonexoxo80@gmail.com',
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success(`Report ${status}`);
      setSelectedReport(null);
      setAdminNotes('');
      loadReports();
    } catch (error: any) {
      toast.error('Failed to update report');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const filteredReports = reports;

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    reviewing: reports.filter(r => r.status === 'reviewing').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Reports Management
          </h1>
          <p className="text-muted-foreground">
            Review and manage hostel listing reports from students
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-muted-foreground text-sm mb-1">Total Reports</p>
            <p className="font-display text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-muted-foreground text-sm mb-1">Pending</p>
            <p className="font-display text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-muted-foreground text-sm mb-1">Reviewing</p>
            <p className="font-display text-2xl font-bold text-blue-600">{stats.reviewing}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-muted-foreground text-sm mb-1">Resolved</p>
            <p className="font-display text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
          {['all', 'pending', 'reviewing', 'resolved', 'dismissed'].map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reports found</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-sm">Hostel</th>
                    <th className="text-left p-4 font-semibold text-sm">Reason</th>
                    <th className="text-left p-4 font-semibold text-sm">Reporter</th>
                    <th className="text-left p-4 font-semibold text-sm">Status</th>
                    <th className="text-left p-4 font-semibold text-sm">Date</th>
                    <th className="text-right p-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => {
                    const StatusIcon = statusIcons[report.status];
                    return (
                      <tr key={report.id} className="border-t border-border hover:bg-muted/30">
                        <td className="p-4">
                          <p className="font-semibold text-foreground">{report.hostels.name}</p>
                          <p className="text-xs text-muted-foreground">{report.hostels.location}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-foreground">{report.reason}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-foreground">{report.reporter_name || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">{report.reporter_email}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={`${statusColors[report.status]} capitalize flex items-center gap-1 w-fit`}>
                            <StatusIcon className="w-3 h-3" />
                            {report.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedReport(report);
                                setAdminNotes(report.admin_notes || '');
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Review and take action on this report
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Hostel</p>
                <p className="text-sm text-muted-foreground">{selectedReport.hostels.name}</p>
                <Button
                  size="sm"
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate(`/hostels/${selectedReport.hostel_id}`)}
                >
                  View Hostel →
                </Button>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Reason</p>
                <p className="text-sm text-muted-foreground">{selectedReport.reason}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Description</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedReport.description}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Reporter</p>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Name:</span> {selectedReport.reporter_name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Email:</span> {selectedReport.reporter_email}
                  </p>
                  {(selectedReport as any).reporter_phone && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Phone:</span> {(selectedReport as any).reporter_phone}
                    </p>
                  )}
                </div>
              </div>

              {(selectedReport as any).additional_details && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Additional Details</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line bg-secondary/30 p-3 rounded-lg">
                    {(selectedReport as any).additional_details}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Current Status</p>
                <Badge className={`${statusColors[selectedReport.status]} capitalize`}>
                  {selectedReport.status}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this report..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                {selectedReport.status === 'pending' && (
                  <Button
                    onClick={() => updateReportStatus(selectedReport.id, 'reviewing')}
                    disabled={updating}
                    className="flex-1"
                  >
                    Mark as Reviewing
                  </Button>
                )}
                {(selectedReport.status === 'pending' || selectedReport.status === 'reviewing') && (
                  <>
                    <Button
                      onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                      disabled={updating}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Resolve
                    </Button>
                    <Button
                      onClick={() => updateReportStatus(selectedReport.id, 'dismissed')}
                      disabled={updating}
                      variant="outline"
                      className="flex-1"
                    >
                      Dismiss
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReports;
