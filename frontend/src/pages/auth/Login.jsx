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
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const onSubmit = async (d) => {
    try {
      const res = await api.post('/auth/login', d);
      login(res.data.data.user, res.data.data.accessToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-slate-400 mt-2">Sign in to your TeamTask account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input {...register('email')} type="email" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none" placeholder="you@example.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'} className="w-full px-4 py-3 pr-12 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button disabled={isSubmitting} type="submit" className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold rounded-xl transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98]">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">Don't have an account? <Link to="/auth/register" className="text-primary hover:underline font-medium">Sign Up</Link></p>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-slate-500 text-xs text-center mb-3">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded-lg p-2.5 border border-white/5"><p className="text-slate-400 font-medium">Admin</p><p className="text-slate-500 mt-0.5">admin@demo.com</p><p className="text-slate-500">Admin@1234</p></div>
              <div className="bg-white/5 rounded-lg p-2.5 border border-white/5"><p className="text-slate-400 font-medium">Member</p><p className="text-slate-500 mt-0.5">alice@demo.com</p><p className="text-slate-500">Member@1234</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
