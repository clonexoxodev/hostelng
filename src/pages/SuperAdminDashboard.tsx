import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, Users, Flag, TrendingUp, MessageSquare,
  UserCheck, AlertTriangle, CheckCircle, Clock, Eye,
  BarChart3, ChevronRight, ExternalLink, Home, Star,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const SUPERADMIN_EMAIL = 'clonexoxo80@gmail.com';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalHostels: 0,
    totalUsers: 0,
    totalAgents: 0,
    totalStudents: 0,
    totalInquiries: 0,
    newInquiries: 0,
    totalReports: 0,
    pendingReports: 0,
    featuredHostels: 0,
    recentHostels: 0,
    recentUsers: 0,
    totalHomeRequests: 0,
    pendingHomeRequests: 0,
  });

  const [recentInquiries, setRecentInquiries]   = useState<any[]>([]);
  const [recentReports, setRecentReports]       = useState<any[]>([]);
  const [listingInquiries, setListingInquiries] = useState<any[]>([]);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== SUPERADMIN_EMAIL) {
        toast.error('Access denied. Super admin only.');
        navigate('/');
        return;
      }
      loadDashboardData();
    } catch {
      navigate('/');
    }
  };

  const loadDashboardData = async () => {
    try {
      const [
        { data: hostelsData },
        { data: usersData },
        { data: reportsData },
        { count: totalReportsCount },
        { data: inquiriesData },
        { data: homeRequestsData },
      ] = await Promise.all([
        supabase.from('hostels').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('reports').select('*, hostels(name, location)').order('created_at', { ascending: false }).limit(5),
        supabase.from('reports').select('id', { count: 'exact', head: true }),
        supabase.from('student_inquiries').select('*').order('submitted_at', { ascending: false }),
        supabase.from('home_requests').select('*').order('submitted_at', { ascending: false }),
      ]);

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      setStats({
        totalHostels:    hostelsData?.length || 0,
        totalUsers:      usersData?.length || 0,
        totalAgents:     usersData?.filter((u) => u.role === 'agent').length || 0,
        totalStudents:   usersData?.filter((u) => u.role === 'student').length || 0,
        totalInquiries:  inquiriesData?.length || 0,
        newInquiries:    inquiriesData?.filter((i) => i.status === 'new').length || 0,
        totalReports:    totalReportsCount || 0,
        pendingReports:  reportsData?.filter((r) => r.status === 'pending').length || 0,
        featuredHostels: hostelsData?.filter((h) => h.featured).length || 0,
        recentHostels:   hostelsData?.filter((h) => new Date(h.created_at) > sevenDaysAgo).length || 0,
        recentUsers:     usersData?.filter((u) => new Date(u.created_at) > sevenDaysAgo).length || 0,
        totalHomeRequests:   homeRequestsData?.length || 0,
        pendingHomeRequests: homeRequestsData?.filter((r) => r.status === 'pending').length || 0,
      });

      setRecentInquiries(inquiriesData?.slice(0, 6) || []);
      setRecentReports(reportsData || []);

      // Build per-listing inquiry counts
      const hostelMap: Record<string, { name: string; count: number; newCount: number; latest: string }> = {};
      for (const h of hostelsData || []) {
        hostelMap[h.id] = { name: h.name, count: 0, newCount: 0, latest: '' };
      }
      for (const inq of inquiriesData || []) {
        if (hostelMap[inq.hostel_id]) {
          hostelMap[inq.hostel_id].count++;
          if (inq.status === 'new') hostelMap[inq.hostel_id].newCount++;
          if (!hostelMap[inq.hostel_id].latest) hostelMap[inq.hostel_id].latest = inq.submitted_at;
        }
      }
      const listingRows = Object.entries(hostelMap)
        .map(([id, v]) => ({ id, ...v }))
        .filter((r) => r.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setListingInquiries(listingRows);
    } catch (err: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getReportStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':   return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewing': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'resolved':  return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:          return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

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

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">Super Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Platform-wide monitoring — listings, inquiries, reports</p>
          </div>

          {/* Primary stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Link to="/admin" className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 w-fit mb-3">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalHostels}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Listings</p>
            </Link>

            <Link to="/superadmin/inquiries" className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="p-2.5 rounded-xl bg-primary/10 w-fit mb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-foreground">{stats.totalInquiries}</p>
                {stats.newInquiries > 0 && (
                  <span className="text-xs font-bold text-primary mb-0.5">{stats.newInquiries} new</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Total Inquiries</p>
            </Link>

            <Link to="/admin/reports" className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 w-fit mb-3">
                <Flag className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-foreground">{stats.totalReports}</p>
                {stats.pendingReports > 0 && (
                  <span className="text-xs font-bold text-red-500 mb-0.5">{stats.pendingReports} pending</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Total Reports</p>
            </Link>

            <Link to="/admin" className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-950/20 w-fit mb-3">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Users</p>
            </Link>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Agents',            value: stats.totalAgents,        icon: UserCheck,  color: 'text-primary' },
              { label: 'Students',          value: stats.totalStudents,      icon: Users,      color: 'text-green-600' },
              { label: 'New Listings (7d)', value: stats.recentHostels,      icon: TrendingUp, color: 'text-blue-600' },
              { label: 'New Users (7d)',    value: stats.recentUsers,        icon: TrendingUp, color: 'text-purple-600' },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Home Requests highlight card */}
          <Link
            to="/superadmin/home-requests"
            className="flex items-center justify-between bg-card border border-border rounded-2xl p-5 mb-8 hover:shadow-md transition-all hover:border-primary/40"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Home className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-display font-bold text-foreground">Request a Home</p>
                <p className="text-xs text-muted-foreground">Students requesting housing assistance from agents</p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{stats.totalHomeRequests}</p>
                <p className="text-xs text-muted-foreground">total</p>
              </div>
              {stats.pendingHomeRequests > 0 && (
                <div className="text-right">
                  <p className="text-xl font-bold text-yellow-600">{stats.pendingHomeRequests}</p>
                  <p className="text-xs text-muted-foreground">unassigned</p>
                </div>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="font-display text-lg font-bold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { title: 'All Listings',    desc: 'Manage hostel listings',        icon: Building2,     link: '/admin',                      color: 'text-blue-600' },
                { title: 'Featured Posts',  desc: 'Curate homepage featured section', icon: Star,         link: '/admin?tab=featured',          color: 'text-yellow-500' },
                { title: 'All Inquiries',   desc: 'Monitor student inquiries',     icon: MessageSquare, link: '/superadmin/inquiries',        color: 'text-primary' },
                { title: 'Home Requests',   desc: 'Assign housing requests',       icon: Home,          link: '/superadmin/home-requests',    color: 'text-accent' },
                { title: 'Reports',         desc: 'Handle flagged listings',       icon: Flag,          link: '/admin/reports',               color: 'text-red-600' },
              ].map((a) => (
                <Link
                  key={a.title}
                  to={a.link}
                  className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all hover:border-primary/40 flex items-start gap-3"
                >
                  <a.icon className={`w-6 h-6 ${a.color} shrink-0 mt-0.5`} />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Inquiries per listing table */}
          {listingInquiries.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Inquiries Per Listing
                </h2>
                <Link to="/superadmin/inquiries" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 text-xs text-muted-foreground font-medium">Listing</th>
                      <th className="pb-2 text-xs text-muted-foreground font-medium text-center">Total</th>
                      <th className="pb-2 text-xs text-muted-foreground font-medium text-center">New</th>
                      <th className="pb-2 text-xs text-muted-foreground font-medium">Latest Inquiry</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {listingInquiries.map((row) => (
                      <tr key={row.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-2.5 pr-4 font-medium text-foreground max-w-[220px] truncate">{row.name}</td>
                        <td className="py-2.5 text-center font-bold text-foreground">{row.count}</td>
                        <td className="py-2.5 text-center">
                          {row.newCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">{row.newCount}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="py-2.5 text-xs text-muted-foreground">
                          {row.latest
                            ? new Date(row.latest).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="py-2.5">
                          <Link to={`/hostels/${row.id}`} target="_blank" className="text-primary/60 hover:text-primary">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom two-column: recent inquiries + recent reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Inquiries */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Recent Inquiries
                </h2>
                <Link to="/superadmin/inquiries" className="text-sm text-primary hover:underline">View all</Link>
              </div>
              <div className="space-y-2">
                {recentInquiries.length > 0 ? (
                  recentInquiries.map((inq) => (
                    <div key={inq.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-xs">
                          {inq.student_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{inq.student_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{inq.hostel_title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          inq.status === 'new' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {inq.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(inq.submitted_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">No inquiries yet</p>
                )}
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <Flag className="w-4 h-4 text-red-500" />
                  Recent Reports
                </h2>
                <Link to="/admin/reports" className="text-sm text-primary hover:underline">View all</Link>
              </div>
              <div className="space-y-2">
                {recentReports.length > 0 ? (
                  recentReports.map((report) => (
                    <Link
                      key={report.id}
                      to="/admin/reports"
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      {getReportStatusIcon(report.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {report.hostels?.name || 'Unknown listing'}
                        </p>
                        <p className="text-xs text-muted-foreground">{report.reason}</p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                        report.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                        {report.status}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">No reports yet</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
