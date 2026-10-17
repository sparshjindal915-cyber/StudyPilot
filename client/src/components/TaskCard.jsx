import StatusBadge from './StatusBadge.jsx';
import { PRIORITIES, STATUSES, TASK_TYPES, labelOf } from '../utils/constants.js';
import { formatDeadline } from '../utils/dates.js';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, compact = false, busy = false }) {
  const done = task.status === 'completed';

  return (
    <div
      className={`rounded-lg border bg-white p-3 transition ${
        task.isOverdue ? 'border-red-300 bg-red-50/40' : 'border-slate-200'
      } ${done ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={done}
          disabled={busy}
          onChange={(e) => onStatusChange?.(task, e.target.checked ? 'completed' : 'todo')}
          className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600"
          aria-label={done ? `Mark "${task.title}" as not completed` : `Mark "${task.title}" as completed`}
        />
        <div className="min-w-0 flex-1">
          <button
            onClick={() => onEdit?.(task)}
            className={`block max-w-full truncate text-left text-sm font-semibold hover:text-indigo-700 ${
              done ? 'text-slate-500 line-through' : 'text-slate-900'
            }`}
          >
            {task.title}
          </button>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            {task.subject && <span className="font-medium text-slate-600">{task.subject.name}</span>}
            <span>· {labelOf(TASK_TYPES, task.type)}</span>
            <span className={task.isOverdue ? 'font-medium text-red-600' : ''}>
              · {formatDeadline(task.deadline)}
            </span>
          </div>

          {!compact && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {task.isOverdue && <StatusBadge value="overdue" />}
              <StatusBadge value={task.priority} label={`${labelOf(PRIORITIES, task.priority)} priority`} />
              <select
                value={task.status}
                disabled={busy}
                onChange={(e) => onStatusChange?.(task, e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-700"
                aria-label="Change status"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {compact && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {task.isOverdue && <StatusBadge value="overdue" />}
              <StatusBadge value={task.priority} />
              {done && <StatusBadge value="completed" />}
            </div>
          )}
        </div>

        {!compact && (
          <div className="flex shrink-0 gap-1">
            <button className="btn-ghost" onClick={() => onEdit?.(task)}>
              Edit
            </button>
            <button className="btn-ghost hover:!text-red-600" onClick={() => onDelete?.(task)}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
