import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../api/axios.config';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FolderKanban, Loader2, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Min 2 characters').max(50),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'Need 1 uppercase').regex(/[0-9]/, 'Need 1 number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const pw = watch('password', '');

  const strength = (() => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  })();
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][strength - 1] || '';
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'][strength - 1] || 'bg-slate-600';

  const onSubmit = async (d) => {
    try {
      await api.post('/auth/register', { name: d.name, email: d.email, password: d.password });
      const res = await api.post('/auth/login', { email: d.email, password: d.password });
      login(res.data.data.user, res.data.data.accessToken);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-primary/40">
              <FolderKanban className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="text-slate-400 mt-2">Join TeamTask today</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input {...register('name')} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="John Doe" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input {...register('email')} type="email" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="you@example.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'} className="w-full px-4 py-3 pr-12 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"><Eye className="w-5 h-5" /></button>
              </div>
              {pw && <div className="mt-2 flex items-center gap-2"><div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${strengthColor}`} style={{ width: `${strength * 25}%` }} /></div><span className="text-xs text-slate-400">{strengthLabel}</span></div>}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
              <input {...register('confirmPassword')} type="password" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button disabled={isSubmitting} type="submit" className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98]">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-slate-500 text-sm mt-6">Already have an account? <Link to="/auth/login" className="text-primary hover:underline font-medium">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
