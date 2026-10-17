export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      <span>{label}</span>
    </div>
  );
}
