import { useEffect, useState, useCallback } from 'react';
import { Plus, Bus, Trash2, Save, X, Navigation, LocateFixed } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Shell from '../components/Shell';
import api from '../api';

// Fix for default marker icon in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Unit { 
  id: number; 
  name: string; 
  plate: string; 
  isActive: boolean; 
  gps_id: string;
  latitude: number;
  longitude: number;
  last_address: string;
  hours: string;
  last_update: string;
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

export default function MobilesPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form, setForm] = useState({ 
    name: '', 
    plate: '', 
    isActive: true, 
    gps_id: '',
    latitude: 7.119,
    longitude: -73.122,
    last_address: '',
    hours: ''
  });

  const [mapPos, setMapPos] = useState<[number, number]>([7.119, -73.122]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/mobiles/units');
      const data = res.data.data || res.data;
      setUnits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading mobiles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openModal = (u: Unit | null = null) => {
    setEditing(u);
    if (u) {
      setForm({
        name: u.name,
        plate: u.plate,
        isActive: u.isActive,
        gps_id: u.gps_id || '',
        latitude: u.latitude || 7.119,
        longitude: u.longitude || -73.122,
        last_address: u.last_address || '',
        hours: u.hours || ''
      });
      setMapPos([u.latitude || 7.119, u.longitude || -73.122]);
    } else {
      setForm({ name: '', plate: '', isActive: true, gps_id: '', latitude: 7.119, longitude: -73.122, last_address: '', hours: '' });
      setMapPos([7.119, -73.122]);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, latitude: mapPos[0], longitude: mapPos[1] };
    if (editing) {
      await api.patch(`/mobiles/units/${editing.id}`, payload);
    } else {
      await api.post('/mobiles/units', payload);
    }
    load();
    setModalOpen(false);
  };

  const deleteUnit = async (id: number) => {
    if (!confirm('¿Eliminar esta unidad móvil permanentemente?')) return;
    await api.delete(`/mobiles/units/${id}`);
    load();
  };

  return (
    <Shell title="Unidades Móviles (Buses)" subtitle="Gestiona la ubicación actual de tus buses en tiempo real">
      <div className="card">
        <div className="card-header">
          <div style={{ fontWeight: 700 }}><Bus size={16} /> Listado de Unidades</div>
          <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
            <Plus size={16} /> Registrar Bus
          </button>
        </div>
        <div className="table-wrap">
          {loading ? <div className="page-loading"><div className="spinner" /></div> : (
            <table>
              <thead>
                <tr>
                  <th>Bus / Unidad</th>
                  <th>ID GPS</th>
                  <th>Ubicación Actual</th>
                  <th>Horario</th>
                  <th>Última Act.</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {units.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Placa: {u.plate}</div>
                    </td>
                    <td><code style={{ background: 'var(--surface-2)', padding: '2px 4px', borderRadius: 4 }}>{u.gps_id || 'N/A'}</code></td>
                    <td>
                      <div style={{ fontSize: 13 }}>{u.last_address || 'Sin dirección registrada'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.latitude?.toFixed(5)}, {u.longitude?.toFixed(5)}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{u.hours || 'Sin horario'}</div>
                    </td>
                    <td>{u.last_update ? new Date(u.last_update).toLocaleString() : '---'}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-slate'}`}>{u.isActive ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-icon" onClick={() => openModal(u)}><Navigation size={14} /></button>
                        <button className="btn btn-danger btn-icon" onClick={() => deleteUnit(u.id)}><Trash2 size={14} /></button>
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
              <h2 style={{ fontWeight: 700 }}>{editing ? 'Actualizar Bus / Ubicación' : 'Nuevo Bus'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div className="form-group">
                    <label>Nombre de la Unidad</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Placa del Vehículo</label>
                    <input type="text" value={form.plate} onChange={e => setForm({...form, plate: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>ID de Seguimiento (GPS)</label>
                    <input type="text" value={form.gps_id} onChange={e => setForm({...form, gps_id: e.target.value})} placeholder="Opcional" />
                  </div>
                  <div className="form-group">
                    <label>Dirección Manual (Referencia)</label>
                    <input type="text" value={form.last_address} onChange={e => setForm({...form, last_address: e.target.value})} placeholder="Ej: Centro Comercial Parque Caracolí" />
                  </div>
                  <div className="form-group">
                    <label>Horario / Disponibilidad</label>
                    <input type="text" value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} placeholder="Ej: 8:00 AM - 4:00 PM" />
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
                    <label style={{ marginBottom: 0 }}>Unidad Activa (Visible en App)</label>
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
                  </div>
                </div>

                <div style={{ height: 400, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <MapContainer center={mapPos} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker pos={mapPos} setPos={setMapPos} />
                  </MapContainer>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, textAlign: 'center' }}>
                    <LocateFixed size={10} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Haz clic en el mapa o arrastra el marcador para fijar la ubicación actual.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
