import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage, getFieldErrors } from '../services/api.js';

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">✈</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900">StudyPilot</span>
        </div>
        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setError('');
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to see your deadlines and progress."
      footer={
        <>
          New to StudyPilot?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && !errors.email && !errors.password && (
          <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoFocus />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  );
}
