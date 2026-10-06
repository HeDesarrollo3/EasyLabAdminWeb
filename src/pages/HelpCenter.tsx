import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, HelpCircle, CheckCircle, XCircle, X, Save, Loader2 } from 'lucide-react';
import Shell from '../components/Shell';
import ContentSection from '../components/ContentSection';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useCategories, badgeFor } from '../hooks/useCategories';
import api from '../api';

interface Faq {
  id: number;
  category: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

type FaqForm = Omit<Faq, 'id'>;

function FaqModal({ open, editing, categories, nextOrder, onClose, onSaved }: {
  open: boolean;
  editing: Faq | null;
  categories: string[];
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FaqForm>({ category: '', question: '', answer: '', order: 0, isActive: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (editing) {
      const { id: _id, ...rest } = editing;
      setForm(rest);
    } else {
      setForm({ category: categories[0] ?? 'General', question: '', answer: '', order: nextOrder, isActive: true });
    }
  }, [open, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof FaqForm>(field: K, value: FaqForm[K]) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      setError('La pregunta y la respuesta son obligatorias.');
      return;
    }
    setSaving(true);
    try {
      if (editing) await api.patch(`/faqs/${editing.id}`, form);
      else await api.post('/faqs', form);
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
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{editing ? 'Editar Pregunta' : 'Nueva Pregunta'}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Se mostrará en Preguntas frecuentes del Centro de ayuda.</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label htmlFor="faq-question">Pregunta</label>
              <input id="faq-question" type="text" placeholder="Ej: ¿Cuánto tiempo tardan mis resultados?" value={form.question} onChange={e => set('question', e.target.value)} maxLength={300} />
            </div>
            <div className="form-group">
              <label htmlFor="faq-answer">Respuesta</label>
              <textarea id="faq-answer" value={form.answer} onChange={e => set('answer', e.target.value)} rows={5} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label htmlFor="faq-category">Categoría</label>
                <select id="faq-category" value={form.category} onChange={e => set('category', e.target.value)}>
                  {!categories.includes(form.category) && form.category && <option>{form.category}</option>}
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="faq-order">Orden</label>
                <input id="faq-order" type="number" min={0} value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ marginBottom: 0 }}>Visible en la app</label>
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

export default function HelpCenterPage() {
  const { names: categories } = useCategories('faq');
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [deleting, setDeleting] = useState<Faq | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<any>('/faqs/admin');
      const list = data.data || data;
      setItems(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (item: Faq) => {
    await api.patch(`/faqs/${item.id}`, { isActive: !item.isActive });
    setItems(prev => prev.map(r => r.id === item.id ? { ...r, isActive: !r.isActive } : r));
  };

  const q = search.trim().toLowerCase();
  const filtered = items.filter(r =>
    (filterCat === 'Todas' || r.category === filterCat) &&
    (!q || r.question.toLowerCase().includes(q) || r.answer.toLowerCase().includes(q))
  );
  const nextOrder = items.length ? Math.max(...items.map(i => i.order)) + 1 : 0;
  const openNew = () => { setEditing(null); setModalOpen(true); };

  return (
    <Shell title="Centro de Ayuda" subtitle="Bloque PQRS y preguntas frecuentes de la app">
      <ContentSection
        section="pqrs"
        title="Bloque PQRS"
        description="Tarjeta destacada al inicio del Centro de ayuda, con el botón que abre el formulario de PQRS."
        itemName="bloque"
        emptyText="No hay bloque PQRS. La app mostrará el texto por defecto."
        fields={{
          title: 'Título',
          titlePlaceholder: 'PQRS',
          subtitle: 'Texto del botón',
          body: 'Descripción',
          bodyRows: 3,
          url: 'Enlace del formulario PQRS',
          urlPlaceholder: 'https://www.higueraescalante.com/fqrs/',
          icon: true,
        }}
        iconOptions={['rate-review', 'feedback', 'support-agent', 'forum', 'report']}
      />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Preguntas</div>
          <div className="stat-value">{items.length}</div>
          <div className="stat-sub">En la base de datos</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Visibles</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{items.filter(i => i.isActive).length}</div>
          <div className="stat-sub">Publicadas en la app</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Categorías</div>
          <div className="stat-value">{new Set(items.map(i => i.category)).size}</div>
          <div className="stat-sub">En uso</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar" style={{ flex: 1 }}>
            <div className="search-input-wrap">
              <Search size={16} />
              <input type="text" placeholder="Buscar pregunta..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
              <option value="Todas">Todas las categorías</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Nueva Pregunta</button>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="page-loading" style={{ padding: '48px 0' }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
              <p>Cargando preguntas…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <HelpCircle size={48} />
              <p>{q || filterCat !== 'Todas' ? 'No hay resultados para tu búsqueda.' : 'No hay preguntas frecuentes aún.'}</p>
              {!q && filterCat === 'Todas' && <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={14} /> Agregar</button>}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Pregunta</th>
                  <th>Categoría</th>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th style={{ width: 120 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{item.question}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', maxWidth: 480, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.answer}>{item.answer}</div>
                    </td>
                    <td><span className={`badge ${badgeFor(categories, item.category)}`}>{item.category}</span></td>
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

      <FaqModal open={modalOpen} editing={editing} categories={categories} nextOrder={nextOrder} onClose={() => setModalOpen(false)} onSaved={load} />
      <ConfirmDeleteModal
        open={!!deleting}
        title="Eliminar Pregunta"
        itemName={deleting?.question ?? ''}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) { await api.delete(`/faqs/${deleting.id}`); load(); } }}
      />
    </Shell>
  );
}
