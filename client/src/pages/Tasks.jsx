import { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';
import PageHeader from '../components/PageHeader.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import useSubjects from '../hooks/useSubjects.js';
import useTaskActions from '../hooks/useTaskActions.js';
import { PRIORITIES, SORT_OPTIONS, STATUSES, TASK_TYPES } from '../utils/constants.js';

const PAGE_SIZE = 20;
const EMPTY_FILTERS = { search: '', subjectId: '', type: '', priority: '', status: '', overdue: false, sort: 'deadline' };

export default function Tasks() {
  const { subjects } = useSubjects();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | task

  // Debounce search typing so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search.trim()), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const load = useCallback(async () => {
    const params = { sort: filters.sort, page, limit: PAGE_SIZE };
    if (debouncedSearch) params.search = debouncedSearch;
    for (const k of ['subjectId', 'type', 'priority', 'status']) if (filters[k]) params[k] = filters[k];
    if (filters.overdue) params.overdue = 'true';
    try {
      const res = await api.get('/tasks', { params });
      setData(res.data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, page]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const actions = useTaskActions(load);

  const setFilter = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const hasFilters =
    debouncedSearch || filters.subjectId || filters.type || filters.priority || filters.status || filters.overdue;
  const total = data?.pagination.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="All tasks"
        subtitle="Search, filter and manage everything in one place."
        action={
          <button className="btn-primary" onClick={() => setModal('new')}>
            + Add task
          </button>
        }
      />

      <div className="card mb-5 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          className="input sm:col-span-2 lg:col-span-4"
          placeholder="Search tasks by title or notes…"
          value={filters.search}
          onChange={setFilter('search')}
          aria-label="Search tasks"
        />
        <select className="input" value={filters.subjectId} onChange={setFilter('subjectId')} aria-label="Filter by subject">
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select className="input" value={filters.type} onChange={setFilter('type')} aria-label="Filter by type">
          <option value="">All types</option>
          {TASK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select className="input" value={filters.priority} onChange={setFilter('priority')} aria-label="Filter by priority">
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <select className="input" value={filters.status} onChange={setFilter('status')} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select className="input" value={filters.sort} onChange={setFilter('sort')} aria-label="Sort tasks">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600" checked={filters.overdue} onChange={setFilter('overdue')} />
          Overdue only
        </label>
        {hasFilters && (
          <button
            className="btn-secondary"
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setPage(1);
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {error && !data && (
        <div className="card p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button className="btn-secondary mt-3" onClick={load}>Try again</button>
        </div>
      )}
      {loading && !data && <Spinner label="Loading tasks…" />}

      {data && (
        <>
          <p className="mb-2 text-xs text-slate-500" aria-live="polite">
            {total} {total === 1 ? 'task' : 'tasks'}
            {loading && ' · updating…'}
          </p>

          {data.tasks.length === 0 ? (
            hasFilters ? (
              <EmptyState title="No tasks match your filters" message="Try changing or clearing the filters." />
            ) : (
              <EmptyState
                title="No tasks yet"
                message="Add your first assignment, exam or study session."
                action={
                  <button className="btn-primary" onClick={() => setModal('new')}>
                    + Add task
                  </button>
                }
              />
            )
          ) : (
            <div className="space-y-2">
              {data.tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  busy={actions.busyId === t.id}
                  onEdit={setModal}
                  onDelete={actions.askDelete}
                  onStatusChange={actions.changeStatus}
                />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {pages}
              </span>
              <button className="btn-secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </>
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
