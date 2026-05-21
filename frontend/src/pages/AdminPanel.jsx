import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios.config';
import { Users, Shield, Trash2, Activity, Clock, LogIn, LogOut, Globe, Monitor, ChevronDown, Filter } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const actionIcons = {
  LOGIN: { icon: LogIn, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  LOGOUT: { icon: LogOut, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  REGISTER: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  PROJECT_CREATE: { icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  PROJECT_UPDATE: { icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  PROJECT_DELETE: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-500/10' },
  TASK_CREATE: { icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  TASK_UPDATE: { icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  TASK_DELETE: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-500/10' },
  TASK_STATUS_CHANGE: { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  MEMBER_ADD: { icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  MEMBER_REMOVE: { icon: Users, color: 'text-red-500', bg: 'bg-red-500/10' },
  PROFILE_UPDATE: { icon: Shield, color: 'text-amber-500', bg: 'bg-amber-500/10' },
};

export default function AdminPanel() {
  const { user: currentUser } = useContext(AuthContext);
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('users');
  const [actionFilter, setActionFilter] = useState('');

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => (await api.get('/users')).data.data,
  });

  const { data: loginData, isLoading: loginLoading } = useQuery({
    queryKey: ['loginHistory'],
    queryFn: async () => (await api.get('/admin/login-history')).data.data,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['activityLogs', actionFilter],
    queryFn: async () => {
      const params = actionFilter ? `?action=${actionFilter}&limit=100` : '?limit=100';
      return (await api.get(`/admin/activity-logs${params}`)).data;
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allUsers'] });
      qc.invalidateQueries({ queryKey: ['loginHistory'] });
      qc.invalidateQueries({ queryKey: ['activityLogs'] });
      toast.success('User deleted successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const tabs = [
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'logins', label: 'Login History', icon: LogIn },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-slate-500 mt-1">Manage users, view login history and activity logs</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 text-sm">Total Users</p>
          <h3 className="text-3xl font-bold mt-2">{users?.length || 0}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 text-sm">Admins</p>
          <h3 className="text-3xl font-bold mt-2 text-primary">{users?.filter(u => u.role === 'ADMIN').length || 0}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 text-sm">Members</p>
          <h3 className="text-3xl font-bold mt-2">{users?.filter(u => u.role === 'MEMBER').length || 0}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 text-sm">Users Logged In</p>
          <h3 className="text-3xl font-bold mt-2 text-emerald-500">{loginData?.users?.length || 0}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* === Tab: All Users === */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          {usersLoading ? (
            <div className="p-8 space-y-4 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded-lg" />)}</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 text-sm">
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {users?.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">{u.name.charAt(0)}</div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          {u._id === currentUser?._id && <span className="text-[10px] text-emerald-500 font-semibold">(You)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 text-right">
                      {u._id !== currentUser?._id ? (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${u.name}? This will remove all their data.`)) {
                              deleteMut.mutate(u._id);
                            }
                          }}
                          disabled={deleteMut.isPending}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* === Tab: Login History === */}
      {activeTab === 'logins' && (
        <div className="space-y-6">
          {/* Logged-in users summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {loginLoading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)
            ) : loginData?.users?.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <LogIn className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No login history yet</p>
                <p className="text-slate-400 text-sm mt-1">User logins will appear here</p>
              </div>
            ) : (
              loginData?.users?.map(u => (
                <div key={u._id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold border border-primary/30">{u.name?.charAt(0)}</div>
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-sm text-slate-500">{u.email}</p>
                    </div>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{u.role}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5"><LogIn className="w-3.5 h-3.5" /> Last login</span>
                      <span className="font-medium text-emerald-600">{u.lastLogin ? formatDistanceToNow(new Date(u.lastLogin), { addSuffix: true }) : 'Never'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Login count</span>
                      <span className="font-semibold">{u.loginCount}</span>
                    </div>
                    {u.lastIp && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Last IP</span>
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{u.lastIp}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent login/logout events table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Recent Login/Logout Events</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
              {loginData?.recentLogs?.length === 0 && <p className="p-8 text-center text-slate-500">No events yet</p>}
              {loginData?.recentLogs?.map(log => {
                const cfg = actionIcons[log.action] || actionIcons.LOGIN;
                const Icon = cfg.icon;
                return (
                  <div key={log._id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg}`}><Icon className={`w-4 h-4 ${cfg.color}`} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate"><span className="font-semibold">{log.user?.name || 'Unknown'}</span> <span className="text-slate-500">{log.action === 'LOGIN' ? 'logged in' : 'logged out'}</span></p>
                      <p className="text-xs text-slate-400 mt-0.5">{log.ip && `IP: ${log.ip}`}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* === Tab: Activity Logs === */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/50 outline-none appearance-none min-w-[200px]"
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Logins</option>
                <option value="LOGOUT">Logouts</option>
                <option value="REGISTER">Registrations</option>
                <option value="PROJECT_CREATE">Project Created</option>
                <option value="PROJECT_DELETE">Project Deleted</option>
                <option value="TASK_CREATE">Task Created</option>
                <option value="TASK_STATUS_CHANGE">Task Status Changed</option>
                <option value="TASK_DELETE">Task Deleted</option>
                <option value="MEMBER_ADD">Member Added</option>
              </select>
            </div>
            <span className="text-sm text-slate-500">{logsData?.pagination?.total || 0} total events</span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            {logsLoading ? (
              <div className="p-6 space-y-3 animate-pulse">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-700 rounded-lg" />)}</div>
            ) : logsData?.data?.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-medium">No activity logs yet</p>
                <p className="text-sm mt-1">User actions will be logged here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                {logsData?.data?.map(log => {
                  const cfg = actionIcons[log.action] || { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-500/10' };
                  const Icon = cfg.icon;
                  return (
                    <div key={log._id} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{log.user?.name || 'Deleted User'}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 font-mono uppercase">{log.action.replace(/_/g, ' ')}</span>
                        </div>
                        {log.details && <p className="text-sm text-slate-500 mt-1">{log.details}</p>}
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}</span>
                          {log.ip && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{log.ip}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
