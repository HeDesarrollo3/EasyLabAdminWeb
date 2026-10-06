import { useEffect, useState, useCallback } from 'react';
import { Send, Bell, History, Loader2, CheckCircle, Clock, XCircle, Calendar } from 'lucide-react';
import Shell from '../components/Shell';
import api from '../api';

interface Log {
  id: number;
  title: string;
  body: string;
  sentAt?: string;
  scheduledAt?: string;
  target: string;
  sendType: string;
  status: string;
}

export default function NotificationsPage() {
  const [history, setHistory] = useState<Log[]>([]);
  const [pending, setPending] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<'INSTANT' | 'SCHEDULED'>('INSTANT');
  
  const [form, setForm] = useState({
    title: '',
    body: '',
    target: 'ALL',
    scheduledAt: ''
  });
  
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [histRes, pendRes] = await Promise.all([
        api.get<any>('/notifications/history'),
        api.get<any>('/notifications/pending')
      ]);
      
      const histData = histRes.data.data || histRes.data;
      const pendData = pendRes.data.data || pendRes.data;
      
      setHistory(Array.isArray(histData) ? histData : []);
      setPending(Array.isArray(pendData) ? pendData : []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'INSTANT') {
      if (!confirm('¿Estás seguro de enviar esta notificación INMEDIATAMENTE a TODOS los usuarios?')) return;
      setSending(true);
      try {
        await api.post('/notifications/send', {
          title: form.title,
          body: form.body,
          target: form.target
        });
        setForm({ ...form, title: '', body: '' });
        showSuccess('Notificación enviada con éxito.');
        loadData();
      } finally {
        setSending(false);
      }
    } else {
      if (!form.scheduledAt) {
        alert('Debe seleccionar una fecha y hora.');
        return;
      }
      
      if (new Date(form.scheduledAt) <= new Date()) {
        alert('La fecha y hora programada debe ser en el futuro.');
        return;
      }

      if (!confirm('¿Estás seguro de PROGRAMAR esta notificación?')) return;
      setSending(true);
      try {
        await api.post('/notifications/schedule', form);
        setForm({ ...form, title: '', body: '', scheduledAt: '' });
        showSuccess('Notificación programada con éxito.');
        loadData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error al programar');
      } finally {
        setSending(false);
      }
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('¿Cancelar este envío programado?')) return;
    try {
      await api.patch(`/notifications/${id}/cancel`);
      showSuccess('Notificación cancelada.');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error al cancelar la notificación');
    }
  };

  return (
    <Shell title="Mensajería Masiva" subtitle="Envía anuncios y notificaciones push a los donantes">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Composer */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700 }}><Send size={16} style={{ verticalAlign: 'middle' }} /> Redactar Mensaje</div>
            
            {/* Toggle Mode */}
            <div style={{ display: 'flex', background: 'var(--surface-2)', padding: 4, borderRadius: 'var(--radius)' }}>
              <button 
                type="button"
                onClick={() => setMode('INSTANT')}
                style={{
                  padding: '6px 12px', fontSize: 13, fontWeight: mode === 'INSTANT' ? 600 : 400,
                  background: mode === 'INSTANT' ? 'var(--surface)' : 'transparent',
                  color: mode === 'INSTANT' ? 'var(--brand)' : 'var(--text-2)',
                  border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  boxShadow: mode === 'INSTANT' ? 'var(--shadow-sm)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 6, transition: 'var(--transition)'
                }}
              >
                <Bell size={14} /> Ahora
              </button>
              <button 
                type="button"
                onClick={() => setMode('SCHEDULED')}
                style={{
                  padding: '6px 12px', fontSize: 13, fontWeight: mode === 'SCHEDULED' ? 600 : 400,
                  background: mode === 'SCHEDULED' ? 'var(--surface)' : 'transparent',
                  color: mode === 'SCHEDULED' ? 'var(--info)' : 'var(--text-2)',
                  border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  boxShadow: mode === 'SCHEDULED' ? 'var(--shadow-sm)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 6, transition: 'var(--transition)'
                }}
              >
                <Calendar size={14} /> Programar
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSend} className="card-body">
            {successMsg && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                <CheckCircle size={16} /> {successMsg}
              </div>
            )}
            
            <div className="form-group">
              <label>Título del Anuncio</label>
              <input 
                type="text" 
                placeholder="Ej: ¡Hoy gran jornada de donación!" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Contenido del Mensaje</label>
              <textarea 
                rows={4} 
                placeholder="Describe la noticia o el aviso importante..." 
                value={form.body} 
                onChange={e => setForm({...form, body: e.target.value})} 
                required
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface-1)', color: 'var(--text-1)' }}
              />
            </div>
            
            <div className="form-group">
              <label>Destinatarios</label>
              <select value={form.target} onChange={e => setForm({...form, target: e.target.value})}>
                <option value="ALL">Todos los usuarios registrados</option>
              </select>
            </div>

            {mode === 'SCHEDULED' && (
              <div className="form-group" style={{ padding: '16px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--info)' }}>
                  <Clock size={16} /> Fecha y Hora de Envío
                </label>
                <input 
                  type="datetime-local" 
                  value={form.scheduledAt}
                  onChange={e => setForm({...form, scheduledAt: e.target.value})}
                  required={mode === 'SCHEDULED'}
                  style={{ width: '100%', padding: '10px', marginTop: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                />
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                  El sistema revisará automáticamente y enviará la notificación a la hora indicada.
                </p>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                marginTop: 16, 
                background: mode === 'SCHEDULED' ? 'var(--info)' : 'var(--brand)' 
              }} 
              disabled={sending}
            >
              {sending ? (
                <Loader2 className="spinner" size={18} />
              ) : mode === 'SCHEDULED' ? (
                <><Calendar size={18} /> Programar Notificación</>
              ) : (
                <><Bell size={18} /> Enviar Ahora</>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Pending & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Pending Scheduled */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} color="var(--warning)" /> 
                Envíos Programados Pendientes
              </div>
            </div>
            <div style={{ maxHeight: 250, overflowY: 'auto' }}>
              {loading ? <div className="page-loading" style={{ height: 100 }}><div className="spinner" /></div> : (
                pending.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                    No hay notificaciones programadas.
                  </div>
                ) : (
                  pending.map(log => (
                    <div key={log.id} style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{log.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                            Programado para: <strong style={{ color: 'var(--info)' }}>{new Date(log.scheduledAt!).toLocaleString()}</strong>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleCancel(log.id)}
                          style={{ 
                            background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer',
                            padding: 4, borderRadius: 'var(--radius-sm)'
                          }}
                          title="Cancelar envío"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* History */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <History size={16} /> Historial de Envíos
              </div>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {loading ? <div className="page-loading" style={{ height: 100 }}><div className="spinner" /></div> : (
                history.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                    Aún no se han enviado notificaciones.
                  </div>
                ) : (
                  history.map(log => (
                    <div key={log.id} style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{log.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(log.sentAt!).toLocaleString()}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{log.body}</div>
                      <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className="badge badge-slate" style={{ fontSize: 10 }}>Para: {log.target}</span>
                        {log.sendType === 'SCHEDULED' ? (
                          <span className="badge badge-blue" style={{ fontSize: 10 }}><Clock size={10} style={{marginRight:4}}/> Programado</span>
                        ) : (
                          <span className="badge badge-green" style={{ fontSize: 10 }}><Bell size={10} style={{marginRight:4}}/> Inmediato</span>
                        )}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

        </div>
      </div>
    </Shell>
  );
}
