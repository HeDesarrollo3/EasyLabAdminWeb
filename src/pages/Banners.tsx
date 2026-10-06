import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, Save, X, Loader2, AlertTriangle } from 'lucide-react';
import Shell from '../components/Shell';
import api, { API_BASE_URL } from '../api';

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  order: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: '', linkUrl: '', order: 0, isActive: true });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<any>('/banners/admin');
      const data = response.data.data || response.data;
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading banners:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (b: Banner | null = null) => {
    setEditing(b);
    setForm(
      b
        ? { title: b.title, linkUrl: b.linkUrl || '', order: b.order, isActive: b.isActive }
        : { title: '', linkUrl: '', order: 0, isActive: true },
    );
    setFile(null);
    setFileError(null);
    setModalOpen(true);
  };

  const handleFileChange = (f: File | null) => {
    setFileError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError(`La imagen pesa ${(f.size / 1024 / 1024).toFixed(2)} MB. Máximo permitido: 5 MB.`);
      setFile(null);
      return;
    }
    if (!f.type.match(/\/(jpg|jpeg|png|webp)$/)) {
      setFileError('Solo se permiten imágenes JPG, PNG o WEBP.');
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        // 1. Actualizar metadata (title, linkUrl, order, isActive)
        await api.patch(`/banners/${editing.id}`, form);

        // 2. Si hay nueva imagen, subirla por endpoint separado
        if (file) {
          const imgFormData = new FormData();
          imgFormData.append('image', file);
          await api.patch(`/banners/${editing.id}/image`, imgFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        // Crear con imagen obligatoria
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('linkUrl', form.linkUrl);
        formData.append('order', form.order.toString());
        formData.append('isActive', form.isActive.toString());
        if (file) formData.append('image', file);

        await api.post('/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      load();
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error saving banner:', err);
      alert(err?.response?.data?.message || 'Error al guardar el banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      load();
    } catch (err) {
      console.error('Error deleting banner:', err);
      alert('Error al eliminar el banner');
    }
  };

  const resolveImageSrc = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  return (
    <Shell title="Publicidad y Banners" subtitle="Administra las imágenes que aparecen en la app móvil">
      <div className="card">
        <div className="card-header">
          <div style={{ fontWeight: 700 }}>Listado de Banners</div>
          <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
            <Plus size={16} /> Agregar Banner
          </button>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="page-loading">
              <div className="spinner" />
            </div>
          ) : banners.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
              No hay banners registrados. Haz clic en "Agregar Banner" para crear uno.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Título</th>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th style={{ width: 100 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <img
                        src={resolveImageSrc(b.imageUrl)}
                        alt={b.title}
                        style={{
                          width: 120,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 8,
                          background: 'var(--surface-2)',
                        }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.title}</div>
                      {b.linkUrl && (
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{b.linkUrl}</div>
                      )}
                    </td>
                    <td>{b.order}</td>
                    <td>
                      <span className={`badge ${b.isActive ? 'badge-green' : 'badge-slate'}`}>
                        {b.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          onClick={() => openModal(b)}
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => handleDelete(b.id)}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
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

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>
                {editing ? 'Editar Banner' : 'Nuevo Banner'}
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Título del Banner</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="Ej: Check-up Familiar 20% OFF"
                  />
                </div>

                {/* ✅ Imagen: siempre visible (crear + editar) */}
                <div className="form-group">
                  <label>
                    Imagen {editing ? '(nueva, opcional)' : 'del Banner'} —{' '}
                    <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>
                      recomendado 1024×512 (2:1)
                    </span>
                  </label>
                  <div
                    className="file-upload-zone"
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 12,
                      padding: 16,
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => document.getElementById('banner-input')?.click()}
                  >
                    {file ? (
                      <div style={{ position: 'relative' }}>
                        <img
                          src={URL.createObjectURL(file)}
                          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }}
                          alt="preview"
                        />
                        <div style={{ fontSize: 11, marginTop: 8, color: 'var(--text-2)' }}>
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setFileError(null);
                          }}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            padding: '4px 8px',
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          Cambiar
                        </button>
                      </div>
                    ) : editing && editing.imageUrl ? (
                      <div style={{ position: 'relative' }}>
                        <img
                          src={resolveImageSrc(editing.imageUrl)}
                          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }}
                          alt="actual"
                        />
                        <div style={{ fontSize: 11, marginTop: 8, color: 'var(--text-3)' }}>
                          Imagen actual (clic para cambiarla)
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: 20 }}>
                        <ImageIcon
                          size={32}
                          style={{ color: 'var(--text-3)', marginBottom: 8 }}
                        />
                        <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                          Haz clic para seleccionar imagen
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                          JPG, PNG o WEBP — máx. 5 MB
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    id="banner-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    required={!editing}
                    style={{ display: 'none' }}
                  />
                  {fileError && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 8,
                        background: '#fef2f2',
                        color: '#dc2626',
                        borderRadius: 8,
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <AlertTriangle size={14} />
                      {fileError}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Enlace (URL opcional)</label>
                  <input
                    type="text"
                    value={form.linkUrl}
                    onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label>Orden de visualización</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div
                  className="form-group"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <label style={{ marginBottom: 0 }}>Activo</label>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !!fileError}
                >
                  {saving ? (
                    <>
                      <Loader2 className="spinner" size={16} /> Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Guardar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}