const STYLES = {
  // status
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  // priority
  low: 'bg-sky-100 text-sky-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
  // flags
  overdue: 'bg-red-600 text-white',
};

const LABELS = {
  todo: 'To do',
  in_progress: 'In progress',
  completed: 'Completed',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  overdue: 'Overdue',
};

export default function StatusBadge({ value, label, prefix }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
        STYLES[value] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {prefix}
      {label ?? LABELS[value] ?? value}
    </span>
  );
}
