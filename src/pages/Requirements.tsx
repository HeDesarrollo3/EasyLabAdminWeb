import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Search,
  ListChecks, CheckCircle, XCircle, X, Save, Loader2
} from 'lucide-react';
import Shell from '../components/Shell';
import api from '../api';
import { useCategories, badgeFor } from '../hooks/useCategories';

/* ───────── Types ───────── */
interface Requirement {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  category: string;
  order: number;
  isActive: boolean;
}

type RequirementForm = Omit<Requirement, 'id'>;

const EMPTY_FORM: RequirementForm = {
  title: '',
  subtitle: '',
  icon: 'check-circle',
  category: 'General',
  order: 0,
  isActive: true,
};


/* Material Icons available in the app */
const ICON_OPTIONS = [
  'cake', 'monitor-weight', 'health-and-safety', 'history', 'restaurant',
  'check-circle', 'favorite', 'medical-services', 'vaccines', 'bloodtype',
  'accessibility', 'directions-run', 'no-drinks', 'smoking-rooms',
  'airline-seat-flat', 'water-drop', 'science', 'biotech', 'warning',
  'info', 'rule', 'verified', 'block', 'help',
];

/* ───────── Modal ───────── */
interface ModalProps {
  open: boolean;
  editing: Requirement | null;
  onClose: () => void;
  onSaved: () => void;
}

function RequirementModal({ open, editing, onClose, onSaved }: ModalProps) {
  const { names: CATEGORIES } = useCategories('requirement');
  const [form, setForm] = useState<RequirementForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          title: editing.title,
          subtitle: editing.subtitle,
          icon: editing.icon,
          category: editing.category,
          order: editing.order,
          isActive: editing.isActive,
        });
      } else {
        setForm({ ...EMPTY_FORM });
      }
      setError('');
    }
  }, [open, editing]);

  const set = (field: keyof RequirementForm, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subtitle.trim()) {
      setError('El título y descripción son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/requirements/${editing.id}`, form);
      } else {
        await api.post('/requirements', form);
      }
      onSaved();
      onClose();
    } catch {
      setError('Error al guardar. Intenta nuevamente.');
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
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              {editing ? 'Editar Requisito' : 'Nuevo Requisito'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
              Los cambios se reflejarán en la app móvil automáticamente.
            </p>
          </div>
          <button id="btn-modal-close" className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="req-title">Título <span className="label-hint">(max 100 chars)</span></label>
              <input
                id="req-title"
                type="text"
                placeholder="Ej: Edad mínima"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="req-subtitle">Descripción <span className="label-hint">(max 255 chars)</span></label>
              <input
                id="req-subtitle"
                type="text"
                placeholder="Ej: Tener entre 18 y 65 años"
                value={form.subtitle}
                onChange={e => set('subtitle', e.target.value)}
                maxLength={255}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label htmlFor="req-category">Categoría</label>
                <select id="req-category" value={form.category} onChange={e => set('category', e.target.value)}>
                  {!CATEGORIES.includes(form.category) && form.category && <option>{form.category}</option>}
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="req-order">Orden</label>
                <input
                  id="req-order"
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={e => set('order', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Ícono <span className="label-hint">(Material Icons)</span></label>
              <div className="icon-grid">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-option ${form.icon === icon ? 'selected' : ''}`}
                    onClick={() => set('icon', icon)}
                    title={icon}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{ fontSize: 9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                      {icon}
                    </span>
                  </button>
                ))}
              </div>
              <input
                id="req-icon-text"
                type="text"
                placeholder="O escribe el nombre del ícono..."
                value={form.icon}
                onChange={e => set('icon', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <label htmlFor="req-active" style={{ marginBottom: 0 }}>Activo en la app</label>
              <label className="toggle">
                <input
                  id="req-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => set('isActive', e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button id="btn-modal-save" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> Guardando…</> : <><Save size={15} /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ───────── Delete Confirm ───────── */
function ConfirmDeleteModal({ item, onClose, onDeleted }: {
  item: Requirement | null; onClose: () => void; onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      await api.delete(`/requirements/${item.id}`);
      onDeleted();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  if (!item) return null;
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Eliminar Requisito</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
            ¿Estás seguro de que deseas eliminar <strong>"{item.title}"</strong>?
            Esta acción no se puede deshacer y el requisito desaparecerá de la app móvil.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button id="btn-confirm-delete" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── Category badge colors ───────── */

/* ───────── Main Page ───────── */
export default function RequirementsPage() {
  const { names: CATEGORIES } = useCategories('requirement');
  const [items, setItems] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Todos');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Requirement | null>(null);
  const [deleting, setDeleting] = useState<Requirement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<any>('/requirements/admin');
      const requirements = data.data || data;
      setItems(Array.isArray(requirements) ? requirements : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (req: Requirement) => {
    await api.patch(`/requirements/${req.id}`, { isActive: !req.isActive });
    setItems(prev => prev.map(r => r.id === req.id ? { ...r, isActive: !r.isActive } : r));
  };

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (r: Requirement) => { setEditing(r); setModalOpen(true); };

  const filtered = items.filter(r => {
    const matchesCat = filterCat === 'Todos' || r.category === filterCat;
    const matchesSearch = !search.trim() ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeCount = items.filter(r => r.isActive).length;

  return (
    <Shell title="Requisitos de Donación" subtitle="Gestiona el contenido que se muestra en la app móvil">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Requisitos</div>
          <div className="stat-value">{items.length}</div>
          <div className="stat-sub">En la base de datos</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Activos en App</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{activeCount}</div>
          <div className="stat-sub">Visibles para el usuario</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inactivos</div>
          <div className="stat-value" style={{ color: 'var(--text-3)' }}>{items.length - activeCount}</div>
          <div className="stat-sub">Ocultos en la app</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Categorías</div>
          <div className="stat-value">{new Set(items.map(r => r.category)).size}</div>
          <div className="stat-sub">Tipos distintos</div>
        </div>
      </div>

      {/* Table card */}
      <div className="card">
        <div className="card-header">
          <div className="toolbar" style={{ flex: 1 }}>
            {/* Search */}
            <div className="search-input-wrap">
              <Search size={16} />
              <input
                id="search-requirements"
                type="text"
                placeholder="Buscar requisito..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Category filter */}
            <select
              id="filter-category"
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              style={{ width: 'auto', minWidth: 140 }}
            >
              <option value="Todos">Todas las categorías</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <button id="btn-new-requirement" className="btn btn-primary" onClick={openNew}>
            <Plus size={16} /> Nuevo Requisito
          </button>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="page-loading" style={{ padding: '48px 0' }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
              <p>Cargando requisitos…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <ListChecks size={48} />
              <p>{search || filterCat !== 'Todos' ? 'No hay resultados para tu búsqueda.' : 'No hay requisitos aún. Crea el primero.'}</p>
              {!search && filterCat === 'Todos' && (
                <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={14} /> Agregar</button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 48 }}>#</th>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Ícono</th>
                  <th>Categoría</th>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th style={{ width: 120 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => (
                  <tr key={req.id}>
                    <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>{req.id}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{req.title}</span>
                    </td>
                    <td style={{ color: 'var(--text-2)', maxWidth: 260 }}>
                      <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {req.subtitle}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-2)' }}>
                        {req.icon}
                      </code>
                    </td>
                    <td>
                      <span className={`badge ${badgeFor(CATEGORIES, req.category)}`}>{req.category}</span>
                    </td>
                    <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>{req.order}</td>
                    <td>
                      <button
                        id={`toggle-${req.id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={() => toggleActive(req)}
                        title={req.isActive ? 'Desactivar' : 'Activar'}
                        style={{ gap: 6, color: req.isActive ? 'var(--success)' : 'var(--text-3)' }}
                      >
                        {req.isActive
                          ? <><CheckCircle size={15} /> Activo</>
                          : <><XCircle size={15} /> Inactivo</>}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          id={`edit-${req.id}`}
                          className="btn btn-secondary btn-icon"
                          onClick={() => openEdit(req)}
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          id={`delete-${req.id}`}
                          className="btn btn-danger btn-icon"
                          onClick={() => setDeleting(req)}
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <RequirementModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
      <ConfirmDeleteModal
        item={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={load}
      />
    </Shell>
  );
}
