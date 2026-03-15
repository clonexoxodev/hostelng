import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home, User, Mail, Phone, MapPin, Calendar, ChevronDown,
  X, Search, Clock, CheckCircle, UserCheck, RefreshCw, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const SUPER_ADMIN = 'clonexoxo80@gmail.com';

const HOUSING_LABELS: Record<string, string> = {
  hostel:            'Hostel',
  shared:            'Shared Apartment',
  private_apartment: 'Private Apartment',
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:     { label: 'Pending',     color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400' },
  assigned:    { label: 'Assigned',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
  contacted:   { label: 'Contacted',   color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' },
  in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' },
  completed:   { label: 'Completed',   color: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' },
  closed:      { label: 'Closed',      color: 'bg-secondary text-muted-foreground' },
};

const AdminRequestHome = () => {
  const navigate = useNavigate();
  const [requests, setRequests]         = useState<any[]>([]);
  const [agents, setAgents]             = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState<any | null>(null);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy]             = useState('newest');
  const [assigning, setAssigning]       = useState(false);
  const [defaultAgent, setDefaultAgent] = useState<string>('');
  const [savingDefault, setSavingDefault] = useState(false);

  useEffect(() => { checkAdmin(); }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.email !== SUPER_ADMIN) {
      toast.error('Access denied');
      navigate('/');
      return;
    }
    loadAll();
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: reqData, error: reqErr },
        { data: agentData, error: agentErr },
        { data: settingData },
      ] = await Promise.all([
        supabase.from('home_requests').select('*').order('submitted_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, email').eq('role', 'agent').order('full_name'),
        supabase.from('platform_settings').select('value').eq('key', 'default_request_home_agent').single(),
      ]);

      if (reqErr) throw reqErr;
      if (agentErr) console.error('Agents load error:', agentErr);

      setRequests(reqData || []);
      setAgents(agentData || []);
      setDefaultAgent(settingData?.value || '');
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  const assignAgent = async (requestId: string, agentId: string) => {
    setAssigning(true);
    try {
      const { error } = await supabase
        .from('home_requests')
        .update({
          assigned_agent_id: agentId || null,
          status: agentId ? 'assigned' : 'pending',
        })
        .eq('id', requestId);

      if (error) throw error;
      toast.success(agentId ? 'Agent assigned' : 'Agent removed');
      setSelected((prev: any) => prev ? { ...prev, assigned_agent_id: agentId || null, status: agentId ? 'assigned' : 'pending' } : null);
      loadAll();
    } catch {
      toast.error('Failed to assign agent');
    } finally {
      setAssigning(false);
    }
  };

  const saveDefaultAgent = async () => {
    setSavingDefault(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({ key: 'default_request_home_agent', value: defaultAgent || null, updated_at: new Date().toISOString() });

      if (error) throw error;
      toast.success(defaultAgent ? 'Default agent saved' : 'Default agent cleared');
    } catch {
      toast.error('Failed to save setting');
    } finally {
      setSavingDefault(false);
    }
  };

  const getAgentName = (agentId: string) =>
    agents.find((a) => a.id === agentId)?.full_name ||
    agents.find((a) => a.id === agentId)?.email ||
    'Unknown Agent';

  const formatBudget = (min: number, max: number) => {
    if (!min && !max) return '—';
    if (max >= 9999999) return `₦${(min / 1000).toFixed(0)}k+`;
    return `₦${(min / 1000).toFixed(0)}k – ₦${(max / 1000).toFixed(0)}k`;
  };

  const filtered = requests
    .filter((r) => filterStatus === 'all' || r.status === filterStatus)
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.student_name?.toLowerCase().includes(q) ||
        r.student_email?.toLowerCase().includes(q) ||
        r.preferred_location?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) =>
      sortBy === 'oldest'
        ? new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
        : new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

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
                Request a Home
              </h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500 text-white">
                  {pendingCount} unassigned
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{requests.length} total housing requests</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/superadmin">← Super Admin</Link>
          </Button>
        </div>

        {/* Default agent assignment setting */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-xl bg-primary/10 shrink-0">
              <UserCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Default Assigned Agent</p>
              <p className="text-xs text-muted-foreground">All new "Request a Home" submissions will be automatically routed to this agent.</p>
            </div>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <select
                value={defaultAgent}
                onChange={(e) => setDefaultAgent(e.target.value)}
                className="w-full appearance-none text-sm px-3 py-2.5 pr-8 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">No default agent (manual assignment)</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name || a.email}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
            <Button
              onClick={saveDefaultAgent}
              disabled={savingDefault}
              className="gradient-primary border-0 text-primary-foreground"
            >
              {savingDefault ? 'Saving...' : 'Save Setting'}
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key === filterStatus ? 'all' : key)}
              className={`bg-card border rounded-xl p-3 text-left transition-all hover:shadow-md ${
                filterStatus === key ? 'border-primary ring-1 ring-primary' : 'border-border'
              }`}
            >
              <p className="text-xl font-bold text-foreground">
                {requests.filter((r) => r.status === key).length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{meta.label}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or location..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
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
          {(filterStatus !== 'all' || search) && (
            <button
              onClick={() => { setFilterStatus('all'); setSearch(''); }}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-4">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>

        {/* Request cards */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Home className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No housing requests match the current filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => {
              const meta = STATUS_META[req.status] || STATUS_META.pending;
              const agentName = req.assigned_agent_id ? getAgentName(req.assigned_agent_id) : null;
              return (
                <div
                  key={req.id}
                  className={`bg-card border rounded-xl p-4 transition-shadow hover:shadow-md cursor-pointer ${
                    req.status === 'pending' ? 'border-yellow-300/60 dark:border-yellow-800/40' : 'border-border'
                  }`}
                  onClick={() => setSelected(req)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-sm">
                          {req.student_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground text-sm">{req.student_name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                            {meta.label}
                          </span>
                          {/* Request a Home badge */}
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-accent/20 text-accent-foreground border border-accent/30">
                            Request a Home
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {req.preferred_location}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {HOUSING_LABELS[req.housing_type] || req.housing_type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatBudget(req.budget_min, req.budget_max)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                      {agentName ? (
                        <span className="flex items-center gap-1 text-primary">
                          <UserCheck className="w-3.5 h-3.5" /> {agentName}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Clock className="w-3.5 h-3.5" /> Unassigned
                        </span>
                      )}
                      <span>
                        {new Date(req.submitted_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail / assign panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-foreground">Request Details</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-accent/20 text-accent-foreground border border-accent/30">
                  Request a Home
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Status */}
              <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_META[selected.status]?.color}`}>
                {STATUS_META[selected.status]?.label}
              </span>

              {/* Student info */}
              <div className="bg-secondary rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Student</p>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <User className="w-3.5 h-3.5 text-muted-foreground" /> {selected.student_name}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" /> {selected.student_email}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {selected.student_phone}
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Requirements</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{selected.preferred_location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Housing Type</p>
                    <p className="font-medium text-foreground">{HOUSING_LABELS[selected.housing_type] || selected.housing_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-medium text-foreground">{formatBudget(selected.budget_min, selected.budget_max)}</p>
                  </div>
                  {selected.move_in_date && (
                    <div>
                      <p className="text-xs text-muted-foreground">Move-in Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(selected.move_in_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selected.notes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Notes</p>
                  <p className="text-sm text-foreground bg-secondary rounded-lg p-3 italic">"{selected.notes}"</p>
                </div>
              )}

              {/* Assign agent */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Assign Agent</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={selected.assigned_agent_id || ''}
                      onChange={(e) => assignAgent(selected.id, e.target.value)}
                      disabled={assigning}
                      className="w-full appearance-none text-sm px-3 py-2.5 pr-8 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    >
                      <option value="">Unassigned</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.full_name || a.email}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                  {assigning && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground self-center" />}
                </div>
              </div>

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

export default AdminRequestHome;
