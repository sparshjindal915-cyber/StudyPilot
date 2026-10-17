export default function EmptyState({ title, message, action }) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-2xl">📚</div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {message && <p className="max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
