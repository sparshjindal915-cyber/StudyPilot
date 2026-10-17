import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { getErrorMessage } from '../services/api.js';
import PageHeader from '../components/PageHeader.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDeadline } from '../utils/dates.js';

function StatCard({ label, value, hint, tone = 'text-slate-900' }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function TaskList({ title, tasks, empty, tone }) {
  return (
    <section className="card p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      {tasks.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{t.title}</p>
                <p className="truncate text-xs text-slate-500">{t.subjectName}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`text-xs font-medium ${tone}`}>{formatDeadline(t.deadline)}</span>
                <StatusBadge value={t.priority} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/summary');
      setData(res.data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error && !data) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button className="btn-secondary mt-3" onClick={load}>
          Try again
        </button>
      </div>
    );
  }
  if (!data) return <Spinner label="Loading dashboard…" />;

  const { totals, upcoming, overdueTasks, bySubject } = data;
  const firstName = user?.name?.split(' ')[0] || 'there';

  if (bySubject.length === 0) {
    return (
      <>
        <PageHeader title={`Hi ${firstName} 👋`} subtitle="Let's set up your semester." />
        <EmptyState
          title="Start by adding your subjects"
          message="Add the courses you're taking this semester, then add assignments, exams and study tasks to each one."
          action={
            <Link to="/subjects" className="btn-primary">
              Add your first subject
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title={`Hi ${firstName} 👋`} subtitle="Here's where your semester stands." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Pending" value={totals.pending} hint={`${totals.inProgress} in progress`} tone="text-amber-600" />
        <StatCard label="Completed" value={totals.completed} hint={`of ${totals.total} total`} tone="text-emerald-600" />
        <StatCard label="Overdue" value={totals.overdue} hint="Past deadline, not done" tone={totals.overdue ? 'text-red-600' : 'text-slate-900'} />
        <StatCard label="Due in 7 days" value={totals.dueNext7Days} hint="Open tasks" tone="text-indigo-600" />
        <StatCard label="Completion" value={`${totals.completionRate}%`} hint="Completed / total" />
      </div>

      <section className="card mt-6 p-4">
        <h2 className="mb-1 text-sm font-semibold text-slate-900">Workload by subject</h2>
        <p className="mb-4 text-xs text-slate-500">Completed vs. pending tasks per subject</p>
        {totals.total === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">Add some tasks to see your workload chart.</p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={bySubject} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} tickFormatter={(v) => (v.length > 12 ? `${v.slice(0, 11)}…` : v)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TaskList title="Upcoming deadlines" tasks={upcoming} empty="Nothing due soon. Nice!" tone="text-slate-600" />
        <TaskList title="Overdue" tasks={overdueTasks} empty="No overdue tasks 🎉" tone="text-red-600" />
      </div>
    </>
  );
}
