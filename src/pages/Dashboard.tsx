import { useEffect, useState } from 'react';
import { Droplets, ListChecks, CheckCircle, XCircle, ArrowRight, Activity, Users, FileText, Building2, MapPin, Bus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import api from '../api';

interface Requirement {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  isActive: boolean;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [activeSedes, setActiveSedes] = useState<number | null>(null);
  const [activePoints, setActivePoints] = useState<number | null>(null);
  const [activeMobiles, setActiveMobiles] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    Promise.all([
      api.get<any>('/requirements/admin'),
      api.get<any>('/sedes/admin'),
      api.get<any>('/points/admin'),
      api.get<any>('/mobiles/units')
    ]).then(([reqRes, sedesRes, pointsRes, mobilesRes]) => {
      // Requisitos
      const reqData = reqRes.data.data || reqRes.data;
      setRequirements(Array.isArray(reqData) ? reqData : []);
      
      // Sedes (filtrar activas)
      const sedesData = sedesRes.data.data || sedesRes.data;
      setActiveSedes(Array.isArray(sedesData) ? sedesData.filter((s: any) => s.isActive).length : 0);

      // Puntos (filtrar activos)
      const pointsData = pointsRes.data.data || pointsRes.data;
      setActivePoints(Array.isArray(pointsData) ? pointsData.filter((p: any) => p.isActive).length : 0);

      // Moviles (filtrar activos)
      const mobilesData = mobilesRes.data.data || mobilesRes.data;
      setActiveMobiles(Array.isArray(mobilesData) ? mobilesData.filter((m: any) => m.isActive).length : 0);
    }).finally(() => setLoading(false));
  }, []);

  const active = requirements.filter(r => r.isActive);
  const recent = [...requirements].reverse().slice(0, 5);

  return (
    <Shell title="Dashboard" subtitle="Centro de Mando EasyLab">
      
      {/* Welcome Banner */}
      <div style={{
        background: 'var(--brand-gradient)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 40px',
        color: 'white',
        marginBottom: 32,
        boxShadow: 'var(--shadow-brand)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute', right: '-5%', top: '-20%', width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
            {greeting}, Admin 👋
          </h1>
          <p style={{ fontSize: 15, opacity: 0.9, maxWidth: 500, lineHeight: 1.5 }}>
            Aquí tienes un resumen en tiempo real del estado de EasyLab. Todos los cambios que realices se sincronizan instantáneamente con la aplicación móvil.
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.2)', padding: '16px 24px', borderRadius: 'var(--radius)', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, opacity: 0.9 }}>Estado del Sistema</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 16, fontWeight: 700 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
            Todos los servicios online
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        
        <div 
          className="stat-card" 
          onClick={() => navigate('/requirements')}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div>
            <div className="stat-label">Requisitos Activos</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{loading ? '—' : active.length}</div>
            <div className="stat-sub">De {requirements.length} en total</div>
          </div>
          <div style={{ padding: 12, background: '#dcfce7', borderRadius: 'var(--radius)', color: 'var(--success)' }}>
            <Activity size={24} />
          </div>
        </div>

        <div 
          className="stat-card" 
          onClick={() => navigate('/sedes')}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div>
            <div className="stat-label">Sedes Lab Activas</div>
            <div className="stat-value" style={{ color: 'var(--info)' }}>{loading || activeSedes === null ? '—' : activeSedes}</div>
            <div className="stat-sub">Sedes físicas</div>
          </div>
          <div style={{ padding: 12, background: '#dbeafe', borderRadius: 'var(--radius)', color: 'var(--info)' }}>
            <Building2 size={24} />
          </div>
        </div>

        <div 
          className="stat-card" 
          onClick={() => navigate('/points')}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div>
            <div className="stat-label">Puntos Fijos</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{loading || activePoints === null ? '—' : activePoints}</div>
            <div className="stat-sub">Puntos de atención</div>
          </div>
          <div style={{ padding: 12, background: '#fef3c7', borderRadius: 'var(--radius)', color: '#d97706' }}>
            <MapPin size={24} />
          </div>
        </div>

        <div 
          className="stat-card" 
          onClick={() => navigate('/mobiles')}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div>
            <div className="stat-label">Móviles Activos</div>
            <div className="stat-value" style={{ color: 'var(--brand)' }}>{loading || activeMobiles === null ? '—' : activeMobiles}</div>
            <div className="stat-sub">Unidades móviles</div>
          </div>
          <div style={{ padding: 12, background: 'var(--brand-light)', borderRadius: 'var(--radius)', color: 'var(--brand)' }}>
            <Bus size={24} />
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24 }}>
        {/* Quick actions */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <div style={{ fontWeight: 800, fontSize: 16 }}>Acciones Rápidas</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/requirements')}
              style={{ justifyContent: 'space-between', padding: '16px 20px', fontSize: 15 }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ListChecks size={20} /> Gestionar Requisitos
              </span>
              <ArrowRight size={20} />
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/notifications')}
              style={{ justifyContent: 'space-between', padding: '16px 20px', fontSize: 15 }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={20} /> Enviar Notificación Push
              </span>
              <ArrowRight size={20} />
            </button>

            <div style={{ 
              padding: '16px', background: 'var(--brand-light)', 
              borderRadius: 'var(--radius)', fontSize: 13, 
              color: 'var(--brand-dark)', lineHeight: 1.6, marginTop: 8 
            }}>
              <Droplets size={16} style={{ display: 'inline', marginRight: 6, marginBottom: -3 }} />
              Cualquier cambio realizado en los módulos se verá reflejado <strong>en tiempo real</strong> en la aplicación móvil de los pacientes.
            </div>
          </div>
        </div>

        {/* Recent items */}
        <div className="card">
          <div className="card-header">
            <div style={{ fontWeight: 800, fontSize: 16 }}>Últimos Requisitos Modificados</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/requirements')} style={{ fontWeight: 700 }}>
              Ver todos
            </button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {loading ? (
              <div className="page-loading" style={{ padding: '40px 0' }}>
                <div className="spinner" />
              </div>
            ) : recent.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <FileText size={48} />
                <p>No hay requisitos registrados aún</p>
              </div>
            ) : recent.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 24px', borderBottom: '1px solid var(--border)',
                transition: 'background var(--transition)', cursor: 'default'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 'var(--radius-sm)', 
                    background: r.isActive ? '#dcfce7' : 'var(--surface-2)',
                    color: r.isActive ? 'var(--success)' : 'var(--text-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {r.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ 
                        background: 'var(--surface-2)', padding: '2px 8px', 
                        borderRadius: 99, fontSize: 11, fontWeight: 600, color: 'var(--text-2)' 
                      }}>
                        {r.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: r.isActive ? 'var(--success)' : 'var(--text-3)' }}>
                  {r.isActive ? 'Público' : 'Oculto'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
