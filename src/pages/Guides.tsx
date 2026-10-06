import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, ClipboardList, CheckCircle, XCircle, X, Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import Shell from '../components/Shell';
import api from '../api';
import { useCategories, badgeFor } from '../hooks/useCategories';

interface Guide {
  id: number;
  category: string;
  title: string;
  description: string;
  icon: string;
  instructions: string;
  order: number;
  isActive: boolean;
}

interface GuideForm {
  category: string;
  title: string;
  description: string;
  icon: string;
  instructions: string;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM: GuideForm = {
  category: 'Sangre',
  title: '',
  description: '',
  icon: 'science',
  instructions: '[]',
  order: 0,
  isActive: true,
};


const ICON_OPTIONS = [
  'science', 'biotech', 'opacity', 'healing', 'water-drop',
  'bloodtype', 'monitor-heart', 'vaccines', 'medication',
  'medical-services', 'health-and-safety', 'visibility', 'hearing',
  'check-circle', 'info', 'warning', 'assignment', 'search',
  'favorite', 'history', 'restaurant', 'air', 'access-time',
];


function GuideModal({ open, editing, onClose, onSaved }: {
  open: boolean;
  editing: Guide | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { names: CATEGORIES } = useCategories('guide');
  const [form, setForm] = useState<GuideForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [instructionsList, setInstructionsList] = useState<string[]>([]);
  const [newInstruction, setNewInstruction] = useState('');

  useEffect(() => {
    if (open) {
      if (editing) {
        const parsed = parseInstructions(editing.instructions);
        setForm({
          category: editing.category,
          title: editing.title,
          description: editing.description,
          icon: editing.icon,
          instructions: editing.instructions,
          order: editing.order,
          isActive: editing.isActive,
        });
        setInstructionsList(parsed);
      } else {
        setForm({ ...EMPTY_FORM });
        setInstructionsList([]);
      }
      setError('');
      setNewInstruction('');
    }
  }, [open, editing]);

  const parseInstructions = (raw: string): string[] => {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return raw ? raw.split('\n').filter(Boolean) : [];
    }
  };

  const set = (field: keyof GuideForm, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const addInstruction = () => {
    if (!newInstruction.trim()) return;
    const updated = [...instructionsList, newInstruction.trim()];
    setInstructionsList(updated);
    set('instructions', JSON.stringify(updated));
    setNewInstruction('');
  };

  const removeInstruction = (index: number) => {
    const updated = instructionsList.filter((_, i) => i !== index);
    setInstructionsList(updated);
    set('instructions', JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('El título y la descripción son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, instructions: JSON.stringify(instructionsList) };
      if (editing) {
        await api.patch(`/guides/${editing.id}`, payload);
      } else {
        await api.post('/guides', payload);
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
              {editing ? 'Editar Guía' : 'Nueva Guía'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
              Las instrucciones de preparación se reflejarán en la app móvil.
            </p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="guide-title">Título del examen</label>
              <input id="guide-title" type="text" placeholder="Ej: Glucosa en Ayunas" value={form.title} onChange={e => set('title', e.target.value)} maxLength={200} />
            </div>

            <div className="form-group">
              <label htmlFor="guide-descripcion">Descripción</label>
              <textarea id="guide-descripcion" placeholder="Descripción general del examen..." value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label htmlFor="guide-category">Categoría</label>
                <select id="guide-category" value={form.category} onChange={e => set('category', e.target.value)}>
                  {!CATEGORIES.includes(form.category) && form.category && <option>{form.category}</option>}
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="guide-order">Orden</label>
                <input id="guide-order" type="number" min={0} value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} />
              </div>
            </div>

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
              <input id="guide-icon-text" type="text" placeholder="O escribe el nombre del ícono..." value={form.icon} onChange={e => set('icon', e.target.value)} style={{ marginTop: 8 }} />
            </div>

            <div className="form-group">
              <label>Instrucciones de preparación</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input type="text" placeholder="Ej: Ayuno de 8 horas..." value={newInstruction} onChange={e => setNewInstruction(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInstruction())} style={{ flex: 1 }} />
                <button type="button" className="btn btn-primary btn-sm" onClick={addInstruction}>Agregar</button>
              </div>
              {instructionsList.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-3)', fontStyle: 'italic' }}>No hay instrucciones agregadas.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {instructionsList.map((inst, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', minWidth: 20 }}>{i + 1}.</span>
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>{inst}</span>
                      <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => removeInstruction(i)} style={{ width: 28, height: 28 }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ marginBottom: 0 }}>Activo en la app</label>
              <label className="toggle">
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                <span className="toggle-slider" />
              </label>
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

function ConfirmDeleteModal({ item, onClose, onDeleted }: {
  item: Guide | null; onClose: () => void; onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      await api.delete(`/guides/${item.id}`);
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
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Eliminar Guía</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
            ¿Estás seguro de que deseas eliminar <strong>"{item.title}"</strong>?
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

export default function GuidesPage() {
  const { names: CATEGORIES } = useCategories('guide');
  const [items, setItems] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Todas');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Guide | null>(null);
  const [deleting, setDeleting] = useState<Guide | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<any>('/guides/admin');
      const guides = data.data || data;
      setItems(Array.isArray(guides) ? guides : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (item: Guide) => {
    await api.patch(`/guides/${item.id}`, { isActive: !item.isActive });
    setItems(prev => prev.map(r => r.id === item.id ? { ...r, isActive: !r.isActive } : r));
  };

  const parseInstructions = (raw: string): string[] => {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return raw ? raw.split('\n').filter(Boolean) : [];
    }
  };

  const filtered = items.filter(r => {
    const matchesCat = filterCat === 'Todas' || r.category === filterCat;
    const matchesSearch = !search.trim() ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeCount = items.filter(r => r.isActive).length;

  return (
    <Shell title="Guías de Preparación" subtitle="Administra las guías de preparación para exámenes de laboratorio">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Guías</div>
          <div className="stat-value">{items.length}</div>
          <div className="stat-sub">En la base de datos</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Activas en App</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{activeCount}</div>
          <div className="stat-sub">Visibles para el usuario</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Categorías</div>
          <div className="stat-value">{new Set(items.map(r => r.category)).size}</div>
          <div className="stat-sub">Tipos distintos</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inactivas</div>
          <div className="stat-value" style={{ color: 'var(--text-3)' }}>{items.length - activeCount}</div>
          <div className="stat-sub">Ocultas en la app</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar" style={{ flex: 1 }}>
            <div className="search-input-wrap">
              <Search size={16} />
              <input type="text" placeholder="Buscar guía..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
              <option value="Todas">Todas las categorías</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={16} /> Nueva Guía
          </button>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="page-loading" style={{ padding: '48px 0' }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
              <p>Cargando guías…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={48} />
              <p>{search || filterCat !== 'Todas' ? 'No hay resultados para tu búsqueda.' : 'No hay guías aún. Crea la primera.'}</p>
              {!search && filterCat === 'Todas' && (
                <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={14} /> Agregar</button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Órden</th>
                  <th>Instrucciones</th>
                  <th>Estado</th>
                  <th style={{ width: 120 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const insts = parseInstructions(item.instructions);
                  const isExpanded = expandedRow === item.id;
                  return (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>{item.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="material-icons" style={{ fontSize: 18, color: 'var(--brand)' }}>{item.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{item.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-3)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${badgeFor(CATEGORIES, item.category)}`}>{item.category}</span>
                      </td>
                      <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>{item.order}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => setExpandedRow(isExpanded ? null : item.id)} style={{ gap: 4 }}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {insts.length} instrucciones
                        </button>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(item)} style={{ gap: 6, color: item.isActive ? 'var(--success)' : 'var(--text-3)' }}>
                          {item.isActive ? <><CheckCircle size={15} /> Activo</> : <><XCircle size={15} /> Inactivo</>}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-icon" onClick={() => { setEditing(item); setModalOpen(true); }} title="Editar"><Pencil size={15} /></button>
                          <button className="btn btn-danger btn-icon" onClick={() => setDeleting(item)} title="Eliminar"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {expandedRow !== null && (
            <div style={{ padding: '12px 24px 20px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              {(() => {
                const item = items.find(i => i.id === expandedRow);
                if (!item) return null;
                const insts = parseInstructions(item.instructions);
                return (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Instrucciones de preparación</p>
                    {insts.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--text-3)', fontStyle: 'italic' }}>Sin instrucciones</p>
                    ) : (
                      <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {insts.map((inst, i) => (
                          <li key={i} style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{inst}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <GuideModal open={modalOpen} editing={editing} onClose={() => setModalOpen(false)} onSaved={load} />
      <ConfirmDeleteModal item={deleting} onClose={() => setDeleting(null)} onDeleted={load} />
    </Shell>
  );
}
