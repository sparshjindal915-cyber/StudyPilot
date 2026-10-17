import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';
import PageHeader from '../components/PageHeader.jsx';
import Spinner from '../components/Spinner.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import useSubjects from '../hooks/useSubjects.js';
import useTaskActions from '../hooks/useTaskActions.js';
import { addDays, dayKey, formatDay, formatShortDate, formatWeekRange, startOfWeek } from '../utils/dates.js';

export default function Planner() {
  const { subjects } = useSubjects();
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    try {
      // The range is computed in the browser's local time so "Monday" means the user's Monday.
      const res = await api.get('/tasks', {
        params: {
          from: weekStart.toISOString(),
          to: addDays(weekStart, 7).toISOString(),
          sort: 'deadline',
          limit: 200,
        },
      });
      setTasks(res.data.tasks);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [weekStart]);

  useEffect(() => {
    setTasks(null);
    load();
  }, [load]);

  const actions = useTaskActions(load);

  const days = useMemo(() => {
    const list = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      return { date, key: dayKey(date), tasks: [] };
    });
    const byKey = new Map(list.map((d) => [d.key, d]));
    for (const t of tasks || []) byKey.get(dayKey(t.deadline))?.tasks.push(t);
    return list;
  }, [weekStart, tasks]);

  const todayKey = dayKey(new Date());
  const isCurrentWeek = dayKey(weekStart) === dayKey(startOfWeek());
  const counts = (tasks || []).reduce(
    (a, t) => ({
      total: a.total + 1,
      done: a.done + (t.status === 'completed' ? 1 : 0),
      overdue: a.overdue + (t.isOverdue ? 1 : 0),
    }),
    { total: 0, done: 0, overdue: 0 }
  );

  return (
    <>
      <PageHeader
        title="Weekly planner"
        subtitle="Tasks with deadlines, grouped by day."
        action={
          <button className="btn-primary" onClick={() => setModal('new')}>
            + Add task
          </button>
        }
      />

      <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={() => setWeekStart((w) => addDays(w, -7))} aria-label="Previous week">
            ←
          </button>
          <button className="btn-secondary" onClick={() => setWeekStart(startOfWeek())} disabled={isCurrentWeek}>
            This week
          </button>
          <button className="btn-secondary" onClick={() => setWeekStart((w) => addDays(w, 7))} aria-label="Next week">
            →
          </button>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">{formatWeekRange(weekStart)}</p>
          {tasks && (
            <p className="text-xs text-slate-500">
              {counts.total} due · {counts.done} done{counts.overdue ? ` · ${counts.overdue} overdue` : ''}
            </p>
          )}
        </div>
      </div>

      {error && !tasks && (
        <div className="card p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button className="btn-secondary mt-3" onClick={load}>Try again</button>
        </div>
      )}
      {!tasks && !error && <Spinner label="Loading week…" />}

      {tasks && (
        <div className="space-y-3">
          {days.map((d) => {
            const isToday = d.key === todayKey;
            return (
              <section
                key={d.key}
                className={`card gap-4 p-3 sm:flex ${isToday ? 'border-indigo-300 ring-1 ring-indigo-200' : ''}`}
              >
                <div className="mb-2 shrink-0 sm:mb-0 sm:w-32">
                  <p className={`text-sm font-semibold ${isToday ? 'text-indigo-700' : 'text-slate-900'}`}>
                    {formatDay(d.date)}
                    {isToday && <span className="ml-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-medium text-white">Today</span>}
                  </p>
                  <p className="text-xs text-slate-500">{formatShortDate(d.date)}</p>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  {d.tasks.length === 0 ? (
                    <p className="py-1.5 text-sm text-slate-400">Nothing scheduled</p>
                  ) : (
                    d.tasks.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        compact
                        busy={actions.busyId === t.id}
                        onEdit={setModal}
                        onStatusChange={actions.changeStatus}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {modal && (
        <TaskModal
          task={modal === 'new' ? null : modal}
          subjects={subjects}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      <ConfirmDialog
        open={!!actions.pendingDelete}
        title="Delete task?"
        message={actions.pendingDelete ? `“${actions.pendingDelete.title}” will be permanently deleted.` : ''}
        busy={actions.deleting}
        onConfirm={actions.confirmDelete}
        onCancel={actions.cancelDelete}
      />
    </>
  );
}
