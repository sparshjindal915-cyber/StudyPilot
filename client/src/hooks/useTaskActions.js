import { useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

// Shared status-change and delete behaviour for any page that lists tasks.
export default function useTaskActions(onChanged) {
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const changeStatus = async (task, status) => {
    if (busyId) return;
    setBusyId(task.id);
    try {
      await api.patch(`/tasks/${task.id}`, { status });
      await onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${pendingDelete.id}`);
      toast.success('Task deleted');
      setPendingDelete(null);
      await onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return {
    busyId,
    changeStatus,
    pendingDelete,
    askDelete: setPendingDelete,
    cancelDelete: () => !deleting && setPendingDelete(null),
    confirmDelete,
    deleting,
  };
}
