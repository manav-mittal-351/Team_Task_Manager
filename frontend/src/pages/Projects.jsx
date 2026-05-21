import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios.config';
import { Link } from 'react-router-dom';
import { Plus, Users, LayoutList, FolderKanban, Search, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Projects() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });

  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: async () => (await api.get('/projects')).data.data });

  const create = useMutation({
    mutationFn: async (d) => (await api.post('/projects', d)).data.data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setShowModal(false); setForm({ name: '', description: '' }); toast.success('Project created!'); },
  });

  const filtered = projects?.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  if (isLoading) return <div className="space-y-6 animate-pulse"><div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" /><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}</div></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-2xl font-bold">Projects</h1><p className="text-slate-500 mt-1">Manage your team's projects</p></div>
        <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all active:scale-95"><Plus className="w-5 h-5" /> New Project</button>
      </div>

      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 outline-none transition-all" /></div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
          <FolderKanban className="w-14 h-14 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-semibold">No projects found</h3><p className="text-slate-500 mt-1 mb-4">Get started by creating your first project</p>
          <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-dark transition-colors">Create Project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(p => (
            <Link key={p._id} to={`/projects/${p._id}`} className="group block bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">{p.name.charAt(0)}</div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{p.name}</h3>
                </div>
                {p.yourRole === 'ADMIN' && <span className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide">Admin</span>}
              </div>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6 min-h-[40px]">{p.description || 'No description'}</p>
              <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4"><span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{p.memberCount}</span><span className="flex items-center gap-1.5"><LayoutList className="w-4 h-4" />{p.taskCount}</span></div>
                <span className="text-xs">{format(new Date(p.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-100 dark:border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold">New Project</h2><button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><X className="w-5 h-5" /></button></div>
            <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Project Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 outline-none" placeholder="My Project" required minLength={3} /></div>
              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder="What's this project about?" /></div>
              <button type="submit" disabled={create.isPending} className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl disabled:opacity-70 flex justify-center items-center gap-2">{create.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Project'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
