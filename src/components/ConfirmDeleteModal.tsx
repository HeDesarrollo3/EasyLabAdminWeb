import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  itemName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ConfirmDeleteModal({ open, title, itemName, onClose, onConfirm }: Props) {
  const [deleting, setDeleting] = useState(false);
  if (!open) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
            ¿Estás seguro de que deseas eliminar <strong>"{itemName}"</strong>?
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
