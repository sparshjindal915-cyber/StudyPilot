import { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';
import PageHeader from '../components/PageHeader.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SubjectCard from '../components/SubjectCard.jsx';
import SubjectModal from '../components/SubjectModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Subjects() {
  const toast = useToast();
  const [subjects, setSubjects] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | subject
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data.subjects);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/subjects/${pendingDelete.id}`);
      toast.success('Subject deleted');
      setPendingDelete(null);
      await load();
    } catch (err) {
      // e.g. 409 when the subject still has tasks
      toast.error(getErrorMessage(err));
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="My subjects"
        subtitle="Courses you're taking this semester."
        action={
          <button className="btn-primary" onClick={() => setModal('new')}>
            + Add subject
          </button>
        }
      />

      {error && !subjects && (
        <div className="card p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button className="btn-secondary mt-3" onClick={load}>
            Try again
          </button>
        </div>
      )}
      {!subjects && !error && <Spinner label="Loading subjects…" />}

      {subjects && subjects.length === 0 && (
        <EmptyState
          title="No subjects yet"
          message="Add your first subject, like “Operating Systems”, to start tracking work."
          action={
            <button className="btn-primary" onClick={() => setModal('new')}>
              + Add subject
            </button>
          }
        />
      )}

      {subjects && subjects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} onEdit={setModal} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      {modal && (
        <SubjectModal
          subject={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete subject?"
        message={
          pendingDelete
            ? `“${pendingDelete.name}” will be permanently deleted. A subject that still has tasks can't be deleted — reassign or remove its tasks first.`
            : ''
        }
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setPendingDelete(null)}
      />
    </>
  );
}
