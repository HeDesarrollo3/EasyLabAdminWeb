import { useEffect, useState, useCallback } from 'react';
import { Plus, Phone, Clock, Trash2, Save, X, Pencil, LocateFixed, Building2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Shell from '../components/Shell';
import api from '../api';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Sede {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  hours: string;
  isActive: boolean;
}

function LocationPicker({ pos, setPos }: { pos: [number, number], setPos: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPos([e.latlng.lat, e.latlng.lng]);
    },
  });
  return pos ? <Marker position={pos} draggable={true} eventHandlers={{
    dragend: (e) => {
      const marker = e.target;
      const position = marker.getLatLng();
      setPos([position.lat, position.lng]);
    }
  }} /> : null;
}

export default function SedesPage() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sede | null>(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', hours: '', isActive: true });
  const [mapPos, setMapPos] = useState<[number, number]>([7.119, -73.122]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<any>('/sedes/admin');
      setSedes(data.data || data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openModal = (s: Sede | null = null) => {
    setEditing(s);
    if (s) {
      setForm({
        name: s.name,
        address: s.address,
        phone: s.phone,
        hours: s.hours,
        isActive: s.isActive
      });
      setMapPos([s.latitude || 7.119, s.longitude || -73.122]);
    } else {
      setForm({ name: '', address: '', phone: '', hours: '', isActive: true });
      setMapPos([7.119, -73.122]);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, latitude: mapPos[0], longitude: mapPos[1] };
    if (editing) {
      await api.patch(`/sedes/${editing.id}`, payload);
    } else {
      await api.post('/sedes', payload);
    }
    load();
    setModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta sede de laboratorio?')) return;
    await api.delete(`/sedes/${id}`);
    load();
  };

  return (
    <Shell title="Sedes Laboratorio" subtitle="Administra las sedes de Higuera Escalante que aparecen en la app">
      <div className="card">
        <div className="card-header">
          <div style={{ fontWeight: 700 }}>Sedes Laboratorio Clínico</div>
          <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
            <Plus size={16} /> Agregar Sede
          </button>
        </div>
        <div className="table-wrap">
          {loading ? <div className="page-loading"><div className="spinner" /></div> : (
            <table>
              <thead>
                <tr>
                  <th>Sede</th>
                  <th>Ubicación</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sedes.map(s => (
                  <tr key={s.id}>
                    <td><strong><Building2 size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />{s.name}</strong></td>
                    <td>
                      <div>{s.address}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.latitude?.toFixed(5)}, {s.longitude?.toFixed(5)}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {s.phone}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {s.hours}</div>
                    </td>
                    <td>
                      <span className={`badge ${s.isActive ? 'badge-green' : 'badge-slate'}`}>{s.isActive ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-icon" onClick={() => openModal(s)}><Pencil size={14} /></button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button>
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
          <div className="modal" style={{ maxWidth: 900, width: '90%' }}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 700 }}>{editing ? 'Editar Sede' : 'Nueva Sede'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div className="form-group">
                    <label>Nombre de la Sede</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Dirección</label>
                    <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Horario de Atención</label>
                    <input type="text" value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} placeholder="Ej: 06:00 AM - 08:00 PM" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Latitud</label>
                      <input type="number" step="any" value={mapPos[0]} readOnly style={{ opacity: 0.7 }} />
                    </div>
                    <div className="form-group">
                      <label>Longitud</label>
                      <input type="number" step="any" value={mapPos[1]} readOnly style={{ opacity: 0.7 }} />
                    </div>
                  </div>
                  <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ marginBottom: 0 }}>Sede Activa</label>
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
                  </div>
                </div>

                <div style={{ height: 400, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <MapContainer center={mapPos} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker pos={mapPos} setPos={setMapPos} />
                  </MapContainer>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, textAlign: 'center' }}>
                    <LocateFixed size={10} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Ajusta el marcador para fijar la ubicación.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Guardar Sede</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
