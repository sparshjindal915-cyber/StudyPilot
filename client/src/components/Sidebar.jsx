import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/subjects', label: 'Subjects', icon: '📘' },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
  { to: '/planner', label: 'Weekly planner', icon: '🗓️' },
];

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg text-white">
          ✈
        </span>
        <span className="text-lg font-bold tracking-tight text-slate-900">StudyPilot</span>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Main">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <span aria-hidden>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
        <p className="truncate text-xs text-slate-500">{user?.email}</p>
        <button onClick={logout} className="btn-secondary mt-3 w-full">
          Log out
        </button>
      </div>
    </div>
  );
}
