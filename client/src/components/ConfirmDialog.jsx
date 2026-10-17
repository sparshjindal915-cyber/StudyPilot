import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <Modal title={title} onClose={busy ? () => {} : onCancel}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
