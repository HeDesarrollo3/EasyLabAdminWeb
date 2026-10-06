import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle, XCircle, FileText, ExternalLink } from 'lucide-react';
import api from '../api';
import ContentBlockModal, { type ContentBlock, type FieldConfig } from './ContentBlockModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface Props {
  section: string;
  title: string;
  description: string;
  itemName: string;
  fields: FieldConfig;
  iconOptions?: string[];
  emptyText: string;
  onChange?: (items: ContentBlock[]) => void;
}

/**
 * Tarjeta con la lista de bloques de una sección de `app_content`
 * (crear, editar, ordenar, activar y eliminar).
 */
export default function ContentSection({ section, title, description, itemName, fields, iconOptions, emptyText, onChange }: Props) {
  const [items, setItems] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [deleting, setDeleting] = useState<ContentBlock | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<any>('/content/admin', { params: { section } });
      const list = data.data || data;
      const arr = Array.isArray(list) ? list : [];
      setItems(arr);
      onChange?.(arr);
    } finally {
      setLoading(false);
    }
  }, [section]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (item: ContentBlock) => {
    await api.patch(`/content/${item.id}`, { isActive: !item.isActive });
    load();
  };

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const nextOrder = items.length ? Math.max(...items.map(i => i.order)) + 1 : 0;

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header">
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{description}</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Agregar {itemName}</button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="page-loading" style={{ padding: '40px 0' }}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <FileText size={44} />
            <p>{emptyText}</p>
            <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={14} /> Agregar</button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{fields.title}</th>
                {fields.body && <th>{fields.body}</th>}
                {fields.url && <th>Enlace</th>}
                <th>Orden</th>
                <th>Estado</th>
                <th style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {fields.icon && item.icon && (
                        <span className="material-icons" style={{ fontSize: 20, color: 'var(--brand)' }}>{item.icon}</span>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{item.title}</div>
                        {item.subtitle && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{item.subtitle}</div>}
                      </div>
                    </div>
                  </td>
                  {fields.body && (
                    <td>
                      <div style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.body ?? ''}>
                        {item.body || <em style={{ color: 'var(--text-3)' }}>Sin texto</em>}
                      </div>
                    </td>
                  )}
                  {fields.url && (
                    <td>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--info)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <ExternalLink size={12} /> {item.url}
                        </a>
                      ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                  )}
                  <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>{item.order}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(item)} style={{ gap: 6, color: item.isActive ? 'var(--success)' : 'var(--text-3)' }}>
                      {item.isActive ? <><CheckCircle size={15} /> Visible</> : <><XCircle size={15} /> Oculto</>}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-icon" onClick={() => { setEditing(item); setModalOpen(true); }} title="Editar"><Pencil size={15} /></button>
                      <button className="btn btn-danger btn-icon" onClick={() => setDeleting(item)} title="Eliminar"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ContentBlockModal
        open={modalOpen}
        section={section}
        editing={editing}
        fields={fields}
        heading={editing ? `Editar ${itemName}` : `Nuevo ${itemName}`}
        iconOptions={iconOptions}
        nextOrder={nextOrder}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
      <ConfirmDeleteModal
        open={!!deleting}
        title={`Eliminar ${itemName}`}
        itemName={deleting?.title ?? ''}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) { await api.delete(`/content/${deleting.id}`); load(); } }}
      />
    </div>
  );
}
