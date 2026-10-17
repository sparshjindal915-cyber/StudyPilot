import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PRIORITIES, STATUSES, TASK_TYPES } from '../utils/constants.js';
import { fromInputValue, toInputValue } from '../utils/dates.js';

function Field({ label, error, children, htmlFor }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function TaskForm({
  initial,
  subjects,
  defaultSubjectId = '',
  onSubmit,
  onCancel,
  submitting = false,
  error = '',
  fieldErrors = {},
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    subjectId: initial?.subjectId ?? defaultSubjectId ?? '',
    type: initial?.type ?? 'assignment',
    deadline: toInputValue(initial?.deadline),
    priority: initial?.priority ?? 'medium',
    status: initial?.status ?? 'todo',
    estimatedMinutes: initial?.estimatedMinutes ?? '',
  });
  const [localErrors, setLocalErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const errors = { ...localErrors, ...fieldErrors };

  if (subjects.length === 0) {
    return (
      <div className="text-sm text-slate-600">
        <p>You need at least one subject before adding tasks.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onCancel}>
            Close
          </button>
          <Link to="/subjects" className="btn-primary" onClick={onCancel}>
            Create a subject
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return; // guard against double submits

    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.subjectId) next.subjectId = 'Choose a subject';
    if (form.estimatedMinutes !== '' && !(Number(form.estimatedMinutes) >= 1)) {
      next.estimatedMinutes = 'Enter minutes as a positive number';
    }
    setLocalErrors(next);
    if (Object.keys(next).length) return;

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      subjectId: form.subjectId,
      type: form.type,
      deadline: fromInputValue(form.deadline),
      priority: form.priority,
      status: form.status,
      estimatedMinutes: form.estimatedMinutes === '' ? null : Math.round(Number(form.estimatedMinutes)),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Field label="Title" error={errors.title} htmlFor="task-title">
        <input
          id="task-title"
          className="input"
          value={form.title}
          onChange={set('title')}
          maxLength={120}
          placeholder="e.g. Assignment 3: Process scheduling"
          autoFocus
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Subject" error={errors.subjectId} htmlFor="task-subject">
          <select id="task-subject" className="input" value={form.subjectId} onChange={set('subjectId')}>
            <option value="">Select subject…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type" error={errors.type} htmlFor="task-type">
          <select id="task-type" className="input" value={form.type} onChange={set('type')}>
            {TASK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Deadline (optional)" error={errors.deadline} htmlFor="task-deadline">
          <input
            id="task-deadline"
            type="datetime-local"
            className="input"
            value={form.deadline}
            onChange={set('deadline')}
          />
        </Field>
        <Field label="Estimated minutes (optional)" error={errors.estimatedMinutes} htmlFor="task-est">
          <input
            id="task-est"
            type="number"
            min="1"
            className="input"
            value={form.estimatedMinutes}
            onChange={set('estimatedMinutes')}
            placeholder="e.g. 90"
          />
        </Field>
        <Field label="Priority" error={errors.priority} htmlFor="task-priority">
          <select id="task-priority" className="input" value={form.priority} onChange={set('priority')}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" error={errors.status} htmlFor="task-status">
          <select id="task-status" className="input" value={form.status} onChange={set('status')}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Notes (optional)" error={errors.description} htmlFor="task-desc">
        <textarea
          id="task-desc"
          className="input min-h-[80px]"
          value={form.description}
          onChange={set('description')}
          maxLength={2000}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  );
}
