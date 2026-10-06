import { useEffect, useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import api from '../api';

export interface ContentBlock {
  id: number;
  section: string;
  key: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  url: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  updatedAt?: string;
}

type Form = Omit<ContentBlock, 'id' | 'updatedAt'>;

/** Qué campos muestra el formulario y con qué etiquetas, según la sección. */
export interface FieldConfig {
  title: string;
  titlePlaceholder?: string;
  subtitle?: string;
  body?: string;
  bodyRows?: number;
  url?: string;
  urlPlaceholder?: string;
  icon?: boolean;
}

interface Props {
  open: boolean;
  section: string;
  editing: ContentBlock | null;
  fields: FieldConfig;
  heading: string;
  hint?: string;
  iconOptions?: string[];
  nextOrder?: number;
  onClose: () => void;
  onSaved: () => void;
}

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function ContentBlockModal({
  open, section, editing, fields, heading, hint, iconOptions = [], nextOrder = 0, onClose, onSaved,
}: Props) {
  const [form, setForm] = useState<Form>({
    section, key: '', title: '', subtitle: '', body: '', url: '', icon: '', order: 0, isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (editing) {
      const { id: _id, updatedAt: _u, ...rest } = editing;
      setForm({ ...rest, subtitle: rest.subtitle ?? '', body: rest.body ?? '', url: rest.url ?? '', icon: rest.icon ?? '' });
    } else {
      setForm({
        section, key: '', title: '', subtitle: '', body: '', url: '',
        icon: iconOptions[0] ?? '', order: nextOrder, isActive: true,
      });
    }
  }, [open, editing, section, nextOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Form>(field: K, value: Form[K]) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError(`El campo "${fields.title}" es obligatorio.`);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        key: form.key || `${section}-${slugify(form.title)}-${Date.now().toString(36)}`,
        subtitle: form.subtitle || null,
        body: form.body || null,
        url: form.url || null,
        icon: form.icon || null,
      };
      if (editing) await api.patch(`/content/${editing.id}`, payload);
      else await api.post('/content', payload);
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
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{heading}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{hint ?? 'Los cambios se reflejarán en la app móvil.'}</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="cb-title">{fields.title}</label>
              <input id="cb-title" type="text" placeholder={fields.titlePlaceholder} value={form.title} onChange={e => set('title', e.target.value)} maxLength={200} />
            </div>

            {fields.subtitle && (
              <div className="form-group">
                <label htmlFor="cb-subtitle">{fields.subtitle}</label>
                <input id="cb-subtitle" type="text" value={form.subtitle ?? ''} onChange={e => set('subtitle', e.target.value)} maxLength={200} />
              </div>
            )}

            {fields.body && (
              <div className="form-group">
                <label htmlFor="cb-body">{fields.body}</label>
                <textarea id="cb-body" value={form.body ?? ''} onChange={e => set('body', e.target.value)} rows={fields.bodyRows ?? 3} />
              </div>
            )}

            {fields.url && (
              <div className="form-group">
                <label htmlFor="cb-url">{fields.url}</label>
                <input id="cb-url" type="text" placeholder={fields.urlPlaceholder} value={form.url ?? ''} onChange={e => set('url', e.target.value)} maxLength={500} />
              </div>
            )}

            {fields.icon && (
              <div className="form-group">
                <label>Ícono <span className="label-hint">(Material Icons)</span></label>
                {iconOptions.length > 0 && (
                  <div className="icon-grid">
                    {iconOptions.map(icon => (
                      <button key={icon} type="button" className={`icon-option ${form.icon === icon ? 'selected' : ''}`} onClick={() => set('icon', icon)} title={icon}>
                        <span className="material-icons" style={{ fontSize: 18 }}>{icon}</span>
                        <span style={{ fontSize: 9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{icon}</span>
                      </button>
                    ))}
                  </div>
                )}
                <input type="text" placeholder="O escribe el nombre del ícono..." value={form.icon ?? ''} onChange={e => set('icon', e.target.value)} style={{ marginTop: 8 }} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'end' }}>
              <div className="form-group">
                <label htmlFor="cb-order">Orden</label>
                <input id="cb-order" type="number" min={0} value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} />
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
