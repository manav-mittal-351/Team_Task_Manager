import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, UserCircle } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { clsx } from 'clsx';

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  const links = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', to: '/projects', icon: FolderKanban },
    { name: 'Profile', to: '/profile', icon: UserCircle },
  ];
  if (user?.role === 'ADMIN') links.push({ name: 'Admin', to: '/admin', icon: Users });

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col shadow-sm">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
          <FolderKanban className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">TeamTask</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {links.map(({ name, to, icon: Icon }) => (
          <NavLink key={name} to={to} className={({ isActive }) => clsx(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
            isActive ? "bg-primary/10 text-primary dark:bg-primary/20" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
          )}>
            <Icon className="w-5 h-5" /> {name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
