import { useQuery } from '@tanstack/react-query';
import api from '../api/axios.config';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CheckCircle2, Clock, FolderKanban, ListTodo, AlertCircle, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusColors = { TODO: '#64748b', IN_PROGRESS: '#3b82f6', IN_REVIEW: '#a855f7', DONE: '#10b981' };
const priorityColors = { LOW: '#94a3b8', MEDIUM: '#3b82f6', HIGH: '#f59e0b', URGENT: '#ef4444' };

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const [s, o] = await Promise.all([api.get('/dashboard/stats'), api.get('/dashboard/overdue')]);
      return { stats: s.data.data, overdue: o.data.data };
    },
  });

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[...Array(2)].map((_, i) => <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}</div>
    </div>
  );

  const { stats, overdue } = data;
  const pieData = stats.statusBreakdown.map(s => ({ name: s.status.replace('_', ' '), value: s.count, fill: statusColors[s.status] }));
  const barData = stats.priorityBreakdown.map(p => ({ name: p.priority, value: p.count, fill: priorityColors[p.priority] }));

  const cards = [
    { title: 'Total Projects', value: stats.totalProjects, icon: FolderKanban, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Total Tasks', value: stats.totalTasks, icon: ListTodo, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Completed', value: stats.completedTasks, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Overdue', value: stats.overdueTasks, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', alert: stats.overdueTasks > 0 },
  ];

  const pBadge = { LOW: 'bg-slate-100 text-slate-600', MEDIUM: 'bg-blue-100 text-blue-700', HIGH: 'bg-amber-100 text-amber-700', URGENT: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1><p className="text-slate-500 mt-1">Welcome back! Here's what's happening across your projects.</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(c => (
          <div key={c.title} className={`bg-white dark:bg-slate-800 p-5 rounded-2xl border ${c.alert ? 'border-red-500/40 shadow-md shadow-red-500/10' : 'border-slate-100 dark:border-slate-700'} hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between">
              <div><p className="text-slate-500 text-sm font-medium">{c.title}</p><h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{c.value}</h3></div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg}`}><c.icon className={`w-6 h-6 ${c.color}`} /></div>
            </div>
            {c.alert && <p className="flex items-center gap-1.5 mt-3 text-red-500 text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Needs attention</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Task Status</h3>
          <div className="h-[260px]">
            <ResponsiveContainer><PieChart><Pie data={pieData} innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">{pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px' }} /></PieChart></ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">{pieData.map(e => <div key={e.name} className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: e.fill }} /><span className="text-slate-500">{e.name}</span><span className="font-semibold">{e.value}</span></div>)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold mb-4">Priority Breakdown</h3>
          <div className="h-[280px]">
            <ResponsiveContainer><BarChart data={barData} barCategoryGap="30%"><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} /><XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} /><YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{barData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart></ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" /> Overdue Tasks</h3>
        <table className="w-full text-left">
          <thead><tr className="text-slate-500 border-b border-slate-100 dark:border-slate-700 text-sm"><th className="pb-3 font-medium">Task</th><th className="pb-3 font-medium">Project</th><th className="pb-3 font-medium">Due</th><th className="pb-3 font-medium">Priority</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {overdue.length === 0 && <tr><td colSpan="4" className="py-12 text-center text-slate-500"><CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" /><p className="font-medium">All caught up! 🎉</p></td></tr>}
            {overdue.map(t => (
              <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="py-4 font-medium text-slate-900 dark:text-white">{t.title}</td>
                <td className="py-4 text-sm text-slate-500">{t.projectName}</td>
                <td className="py-4 text-sm text-red-500 font-medium flex items-center gap-1"><Clock className="w-4 h-4" />{formatDistanceToNow(new Date(t.dueDate), { addSuffix: true })}</td>
                <td className="py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${pBadge[t.priority]}`}>{t.priority}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
