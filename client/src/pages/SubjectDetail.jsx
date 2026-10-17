import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api.js';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import SubjectModal from '../components/SubjectModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import useSubjects from '../hooks/useSubjects.js';
import useTaskActions from '../hooks/useTaskActions.js';
import { useToast } from '../context/ToastContext.jsx';

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { subjects, reload: reloadSubjects } = useSubjects();
  const [subject, setSubject] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [taskModal, setTaskModal] = useState(null); // null | 'new' | task
  const [editSubject, setEditSubject] = useState(false);
  const [confirmSubjectDelete, setConfirmSubjectDelete] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([
        api.get(`/subjects/${id}`),
        api.get('/tasks', { params: { subjectId: id, limit: 200 } }),
      ]);
      setSubject(s.data.subject);
      setTasks(t.data.tasks);
      setError('');
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 400) setNotFound(true);
      else setError(getErrorMessage(err));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    await Promise.all([load(), reloadSubjects()]);
  };
  const actions = useTaskActions(refresh);

  const deleteSubject = async () => {
    if (deletingSubject) return;
    setDeletingSubject(true);
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject deleted');
      navigate('/subjects', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirmSubjectDelete(false);
      setDeletingSubject(false);
    }
  };

  if (notFound) {
    return (
      <EmptyState
        title="Subject not found"
        message="It may have been deleted."
        action={
          <Link to="/subjects" className="btn-primary">
            Back to subjects
          </Link>
        }
      />
    );
  }
  if (error && !subject) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button className="btn-secondary mt-3" onClick={load}>
          Try again
        </button>
      </div>
    );
  }
  if (!subject || !tasks) return <Spinner label="Loading subject…" />;

  return (
    <>
      <Link to="/subjects" className="mb-3 inline-block text-sm text-indigo-600 hover:underline">
        ← All subjects
      </Link>
      <PageHeader
        title={subject.name}
        subtitle={[subject.courseCode, subject.semester].filter(Boolean).join(' · ') || undefined}
        action={
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setEditSubject(true)}>
              Edit
            </button>
            <button className="btn-secondary" onClick={() => setConfirmSubjectDelete(true)}>
              Delete
            </button>
            <button className="btn-primary" onClick={() => setTaskModal('new')}>
              + Add task
            </button>
          </div>
        }
      />
      {subject.description && <p className="mb-5 -mt-3 text-sm text-slate-600">{subject.description}</p>}

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold">{subject.taskCount}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{subject.taskCount - subject.completedCount}</p>
          <p className="text-xs text-slate-500">Pending</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{subject.completedCount}</p>
          <p className="text-xs text-slate-500">Completed</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks for this subject"
          message="Add assignments, exams, labs or study sessions."
          action={
            <button className="btn-primary" onClick={() => setTaskModal('new')}>
              + Add task
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              busy={actions.busyId === t.id}
              onEdit={setTaskModal}
              onDelete={actions.askDelete}
              onStatusChange={actions.changeStatus}
            />
          ))}
        </div>
      )}

      {taskModal && (
        <TaskModal
          task={taskModal === 'new' ? null : taskModal}
          subjects={subjects}
          defaultSubjectId={id}
          onClose={() => setTaskModal(null)}
          onSaved={refresh}
        />
      )}
      {editSubject && (
        <SubjectModal subject={subject} onClose={() => setEditSubject(false)} onSaved={load} />
      )}

      <ConfirmDialog
        open={!!actions.pendingDelete}
        title="Delete task?"
        message={actions.pendingDelete ? `“${actions.pendingDelete.title}” will be permanently deleted.` : ''}
        busy={actions.deleting}
        onConfirm={actions.confirmDelete}
        onCancel={actions.cancelDelete}
      />
      <ConfirmDialog
        open={confirmSubjectDelete}
        title="Delete subject?"
        message={
          subject.taskCount > 0
            ? `This subject still has ${subject.taskCount} task(s). Reassign or delete them first — deletion will be refused otherwise.`
            : `“${subject.name}” will be permanently deleted.`
        }
        busy={deletingSubject}
        onConfirm={deleteSubject}
        onCancel={() => !deletingSubject && setConfirmSubjectDelete(false)}
      />
    </>
  );
}
