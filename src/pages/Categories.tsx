import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tags, CheckCircle, XCircle, X, Save, Loader2 } from 'lucide-react';
import Shell from '../components/Shell';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import type { Category, CategoryType } from '../hooks/useCategories';
import api from '../api';

const TABS: { type: CategoryType; label: string; hint: string }[] = [
  { type: 'guide', label: 'Guías de preparación', hint: 'Filtros de la pantalla Guías de preparación.' },
  { type: 'requirement', label: 'Requisitos de donación', hint: 'Pestañas de la pantalla Requisitos para donar.' },
  { type: 'faq', label: 'Preguntas frecuentes', hint: 'Agrupan las preguntas del Centro de ayuda.' },
];

const ICON_OPTIONS = [
  'bloodtype', 'opacity', 'image', 'more-horiz', 'science', 'biotech', 'check-circle', 'health-and-safety',
  'psychology', 'favorite', 'analytics', 'event', 'payments', 'restaurant', 'info', 'help-outline',
];

type Form = Omit<Category, 'id'>;

function CategoryModal({ open, type, editing, nextOrder, onClose, onSaved }: {
  open: boolean;
  type: CategoryType;
  editing: Category | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Form>({ type, name: '', label: '', icon: 'info', order: 0, isActive: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (editing) {
      const { id: _id, ...rest } = editing;
      setForm(rest);
    } else {
      setForm({ type, name: '', label: '', icon: 'info', order: nextOrder, isActive: true });
    }
  }, [open, editing, type, nextOrder]);

  const set = <K extends keyof Form>(field: K, value: Form[K]) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) {
      setError('El nombre visible es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, name: form.name.trim() || form.label.trim() };
      if (editing) await api.patch(`/categories/${editing.id}`, payload);
      else await api.post('/categories', payload);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al guardar. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{editing ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{TABS.find(t => t.type === type)?.label}</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label htmlFor="cat-label">Nombre visible</label>
                <input id="cat-label" type="text" placeholder="Ej: Imágenes" value={form.label} onChange={e => set('label', e.target.value)} maxLength={80} />
              </div>
              <div className="form-group">
                <label htmlFor="cat-name">Clave <span className="label-hint">(se guarda en cada registro)</span></label>
                <input id="cat-name" type="text" placeholder="Igual al nombre si se deja vacío" value={form.name} onChange={e => set('name', e.target.value)} maxLength={50} disabled={!!editing} />
              </div>
            </div>
            {editing && (
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: -8, marginBottom: 12 }}>
                La clave no se puede cambiar porque los registros existentes la usan.
              </p>
            )}
            <div className="form-group">
              <label>Ícono <span className="label-hint">(Material Icons)</span></label>
              <div className="icon-grid">
                {ICON_OPTIONS.map(icon => (
                  <button key={icon} type="button" className={`icon-option ${form.icon === icon ? 'selected' : ''}`} onClick={() => set('icon', icon)} title={icon}>
                    <span className="material-icons" style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{ fontSize: 9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{icon}</span>
                  </button>
                ))}
              </div>
              <input type="text" placeholder="O escribe el nombre del ícono..." value={form.icon ?? ''} onChange={e => set('icon', e.target.value)} style={{ marginTop: 8 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'end' }}>
              <div className="form-group">
                <label htmlFor="cat-order">Orden</label>
                <input id="cat-order" type="number" min={0} value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} />
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ marginBottom: 0 }}>Visible en la app</label>
                <label className="toggle">
                  <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> Guardando…</> : <><Save size={15} /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [tab, setTab] = useState<CategoryType>('guide');
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<any>('/categories/admin');
      const list = data.data || data;
      setItems(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const current = items.filter(i => i.type === tab);
  const nextOrder = current.length ? Math.max(...current.map(i => i.order)) + 1 : 0;
  const toggleActive = async (item: Category) => {
    await api.patch(`/categories/${item.id}`, { isActive: !item.isActive });
    setItems(prev => prev.map(r => r.id === item.id ? { ...r, isActive: !r.isActive } : r));
  };
  const openNew = () => { setEditing(null); setModalOpen(true); };

  return (
    <Shell title="Categorías" subtitle="Filtros y agrupaciones que ve el usuario en la app">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.type}
            className={`btn ${tab === t.type ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t.type)}
          >
            {t.label}
            <span className="badge badge-slate" style={{ marginLeft: 4 }}>{items.filter(i => i.type === t.type).length}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ flex: 1, fontSize: 13, color: 'var(--text-3)' }}>{TABS.find(t => t.type === tab)?.hint}</div>
          <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Nueva Categoría</button>
        </div>
        <div className="table-wrap">
          {loading ? (
            <div className="page-loading" style={{ padding: '48px 0' }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : current.length === 0 ? (
            <div className="empty-state">
              <Tags size={48} />
              <p>No hay categorías. La app usará las categorías por defecto.</p>
              <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={14} /> Agregar</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Clave</th>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th style={{ width: 120 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {current.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {item.icon && <span className="material-icons" style={{ fontSize: 20, color: 'var(--brand)' }}>{item.icon}</span>}
                        <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{item.label}</span>
                      </div>
                    </td>
                    <td><code style={{ fontSize: 12, color: 'var(--text-3)' }}>{item.name}</code></td>
                    <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>{item.order}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(item)} style={{ gap: 6, color: item.isActive ? 'var(--success)' : 'var(--text-3)' }}>
                        {item.isActive ? <><CheckCircle size={15} /> Visible</> : <><XCircle size={15} /> Oculta</>}
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
      </div>

      <CategoryModal open={modalOpen} type={tab} editing={editing} nextOrder={nextOrder} onClose={() => setModalOpen(false)} onSaved={load} />
      <ConfirmDeleteModal
        open={!!deleting}
        title="Eliminar Categoría"
        itemName={deleting?.label ?? ''}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) { await api.delete(`/categories/${deleting.id}`); load(); } }}
      />
    </Shell>
  );
}
