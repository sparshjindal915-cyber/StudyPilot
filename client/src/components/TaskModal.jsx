import { useState } from 'react';
import Modal from './Modal.jsx';
import TaskForm from './TaskForm.jsx';
import api, { getErrorMessage, getFieldErrors } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

// Create (task = null) or edit (task = {...}) a task. Calls onSaved after a successful save.
export default function TaskModal({ task = null, subjects, defaultSubjectId = '', onClose, onSaved }) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      if (task) await api.patch(`/tasks/${task.id}`, payload);
      else await api.post('/tasks', payload);
      toast.success(task ? 'Task updated' : 'Task added');
      onSaved?.();
      onClose();
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <Modal title={task ? 'Edit task' : 'Add task'} onClose={submitting ? () => {} : onClose} wide>
      <TaskForm
        initial={task}
        subjects={subjects}
        defaultSubjectId={defaultSubjectId}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitting={submitting}
        error={error}
        fieldErrors={fieldErrors}
      />
    </Modal>
  );
}
