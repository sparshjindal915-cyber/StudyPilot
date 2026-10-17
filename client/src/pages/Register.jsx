import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage, getFieldErrors } from '../services/api.js';
import { AuthShell } from './Login.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email';
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setError('');
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Organize your semester in one place."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && !Object.keys(errors).length && (
          <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" autoComplete="name" className="input" value={form.name} onChange={set('name')} maxLength={80} autoFocus />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" className="input" value={form.email} onChange={set('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="new-password" className="input" value={form.password} onChange={set('password')} />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
          )}
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
