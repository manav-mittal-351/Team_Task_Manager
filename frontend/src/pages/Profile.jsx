import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios.config';
import toast from 'react-hot-toast';
import { UserCircle, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put(`/users/${user._id}`, { name });
      setUser(data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div><h1 className="text-2xl font-bold">Profile</h1><p className="text-slate-500 mt-1">Manage your account settings</p></div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl border border-primary/30">{user?.name?.charAt(0)}</div>
          <div><h3 className="text-lg font-bold">{user?.name}</h3><p className="text-slate-500 text-sm">{user?.email}</p><span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-semibold uppercase mt-1 inline-block">{user?.role}</span></div>
        </div>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name</label><input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 outline-none" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input value={user?.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-400 cursor-not-allowed" /></div>
          <button disabled={loading} className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-70 flex items-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
}
