import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Flag,
  TrendingUp,
  Eye,
  Settings,
  BarChart3,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const SUPERADMIN_EMAIL = 'clonexoxo80@gmail.com';

interface Stats {
  totalHostels: number;
  totalUsers: number;
  totalAgents: number;
  totalStudents: number;
  pendingReports: number;
  featuredHostels: number;
  recentHostels: number;
  recentUsers: number;
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalHostels: 0,
    totalUsers: 0,
    totalAgents: 0,
    totalStudents: 0,
    pendingReports: 0,
    featuredHostels: 0,
    recentHostels: 0,
    recentUsers: 0,
  });
  const [recentHostels, setRecentHostels] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || session.user.email !== SUPERADMIN_EMAIL) {
        toast.error('Access denied. Super admin only.');
        navigate('/');
        return;
      }
      loadDashboardData();
    } catch (error) {
      navigate('/');
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load hostels
      const { data: hostelsData, error: hostelsError } = await supabase
        .from('hostels')
        .select('*')
        .order('created_at', { ascending: false });

      if (hostelsError) throw hostelsError;

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) console.error('Error loading users:', usersError);

      // Load reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select(`
          *,
          hostels (
            name,
            location
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reportsError) console.error('Error loading reports:', reportsError);

      // Calculate stats
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const recentHostelsCount =
        hostelsData?.filter(
          (h) => new Date(h.created_at) > sevenDaysAgo
        ).length || 0;
      const recentUsersCount =
        usersData?.filter((u) => new Date(u.created_at) > sevenDaysAgo)
          .length || 0;

      setStats({
        totalHostels: hostelsData?.length || 0,
        totalUsers: usersData?.length || 0,
        totalAgents:
          usersData?.filter((u) => u.role === 'agent').length || 0,
        totalStudents:
          usersData?.filter((u) => u.role === 'student').length || 0,
        pendingReports:
          reportsData?.filter((r) => r.status === 'pending').length || 0,
        featuredHostels:
          hostelsData?.filter((h) => h.featured).length || 0,
        recentHostels: recentHostelsCount,
        recentUsers: recentUsersCount,
      });

      setRecentHostels(hostelsData?.slice(0, 5) || []);
      setRecentReports(reportsData || []);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Hostels',
      value: stats.totalHostels,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      link: '/admin',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      link: '/admin',
    },
    {
      title: 'Pending Reports',
      value: stats.pendingReports,
      icon: Flag,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      link: '/admin/reports',
    },
    {
      title: 'Featured Hostels',
      value: stats.featuredHostels,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      link: '/admin',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Hostels',
      description: 'View, edit, and delete hostel listings',
      icon: Building2,
      link: '/admin',
      color: 'text-blue-600',
    },
    {
      title: 'Manage Users',
      description: 'View all registered users and agents',
      icon: Users,
      link: '/admin',
      color: 'text-green-600',
    },
    {
      title: 'Review Reports',
      description: 'Handle flagged listings and complaints',
      icon: Flag,
      link: '/admin/reports',
      color: 'text-red-600',
    },
    {
      title: 'Platform Settings',
      description: 'Configure system settings',
      icon: Settings,
      link: '/admin',
      color: 'text-gray-600',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'reviewing':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'dismissed':
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
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

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Super Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Overview of platform statistics and quick actions
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Link
                key={index}
                to={stat.link}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl ${stat.bgColor}`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </Link>
            ))}
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <UserCheck className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Agents</h4>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalAgents}
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Students</h4>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalStudents}
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-foreground">
                  New Hostels (7d)
                </h4>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stats.recentHostels}
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-foreground">
                  New Users (7d)
                </h4>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stats.recentUsers}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all hover:border-primary/40"
                >
                  <action.icon className={`w-8 h-8 ${action.color} mb-3`} />
                  <h3 className="font-semibold text-foreground mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Hostels */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Recent Hostels
                </h2>
                <Link
                  to="/admin"
                  className="text-sm text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentHostels.length > 0 ? (
                  recentHostels.map((hostel) => (
                    <Link
                      key={hostel.id}
                      to={`/hostels/${hostel.id}`}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <Building2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {hostel.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hostel.location} • ₦{hostel.price?.toLocaleString()}
                        </p>
                      </div>
                      {hostel.featured && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Featured
                        </span>
                      )}
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hostels yet
                  </p>
                )}
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Recent Reports
                </h2>
                <Link
                  to="/admin/reports"
                  className="text-sm text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentReports.length > 0 ? (
                  recentReports.map((report) => (
                    <Link
                      key={report.id}
                      to="/admin/reports"
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      {getStatusIcon(report.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {report.hostels?.name || 'Unknown Hostel'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {report.reason} • {report.status}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No reports yet
                  </p>
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
