import { useState } from 'react';
import Modal from './Modal.jsx';
import api, { getErrorMessage, getFieldErrors } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function SubjectModal({ subject = null, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: subject?.name ?? '',
    courseCode: subject?.courseCode ?? '',
    semester: subject?.semester ?? '',
    description: subject?.description ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.name.trim()) {
      setErrors({ name: 'Subject name is required' });
      return;
    }
    setSubmitting(true);
    setError('');
    setErrors({});
    try {
      const payload = {
        name: form.name.trim(),
        courseCode: form.courseCode.trim(),
        semester: form.semester.trim(),
        description: form.description.trim(),
      };
      if (subject) await api.patch(`/subjects/${subject.id}`, payload);
      else await api.post('/subjects', payload);
      toast.success(subject ? 'Subject updated' : 'Subject added');
      onSaved?.();
      onClose();
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <Modal title={subject ? 'Edit subject' : 'Add subject'} onClose={submitting ? () => {} : onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && !Object.keys(errors).length && (
          <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label className="label" htmlFor="sub-name">Name</label>
          <input id="sub-name" className="input" value={form.name} onChange={set('name')} maxLength={100} placeholder="e.g. Operating Systems" autoFocus />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="sub-code">Course code</label>
            <input id="sub-code" className="input" value={form.courseCode} onChange={set('courseCode')} maxLength={30} placeholder="CS301" />
          </div>
          <div>
            <label className="label" htmlFor="sub-sem">Semester</label>
            <input id="sub-sem" className="input" value={form.semester} onChange={set('semester')} maxLength={30} placeholder="Sem 5" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="sub-desc">Notes</label>
          <textarea id="sub-desc" className="input min-h-[70px]" value={form.description} onChange={set('description')} maxLength={1000} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : subject ? 'Save changes' : 'Add subject'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
