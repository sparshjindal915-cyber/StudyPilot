import { Link } from 'react-router-dom';

export default function SubjectCard({ subject, onEdit, onDelete }) {
  const pending = subject.taskCount - subject.completedCount;
  return (
    <div className="card flex flex-col p-4">
      <Link to={`/subjects/${subject.id}`} className="group flex-1">
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-700">{subject.name}</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {[subject.courseCode, subject.semester].filter(Boolean).join(' · ') || 'No course details'}
        </p>
        <div className="mt-4 flex items-end gap-4">
          <div>
            <p className="text-2xl font-bold text-slate-900">{subject.taskCount}</p>
            <p className="text-xs text-slate-500">{subject.taskCount === 1 ? 'task' : 'tasks'}</p>
          </div>
          <div className="text-xs text-slate-500">
            <p>
              <span className="font-semibold text-amber-700">{pending}</span> pending
            </p>
            <p>
              <span className="font-semibold text-emerald-700">{subject.completedCount}</span> completed
            </p>
          </div>
        </div>
      </Link>
      <div className="mt-3 flex justify-end gap-1 border-t border-slate-100 pt-2">
        <button className="btn-ghost" onClick={() => onEdit(subject)}>
          Edit
        </button>
        <button className="btn-ghost hover:!text-red-600" onClick={() => onDelete(subject)}>
          Delete
        </button>
      </div>
    </div>
  );
}
