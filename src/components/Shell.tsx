import { type ReactNode, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ListChecks,
  LogOut,
  Droplets,
  Image as ImageIcon,
  Bus,
  MapPin,
  Bell,
  Building2,
  ClipboardList,
  User,
  ChevronRight,
  LifeBuoy,
  Phone,
  Info,
  Tags
} from 'lucide-react';

interface Props { children: ReactNode; title: string; subtitle?: string; }

const navItems = [
  { id: 'nav-dash', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'nav-reqs', label: 'Requisitos',  icon: ListChecks,      path: '/requirements' },
  { id: 'nav-banners', label: 'Publicidad',  icon: ImageIcon,       path: '/banners' },
  { id: 'nav-mobiles', label: 'Móviles',     icon: Bus,             path: '/mobiles' },
  { id: 'nav-sedes', label: 'Sedes Lab',     icon: Building2,       path: '/sedes' },
  { id: 'nav-points', label: 'Puntos Fijos', icon: MapPin,          path: '/points' },
  { id: 'nav-notify', label: 'Mensajería',   icon: Bell,            path: '/notifications' },
  { id: 'nav-guides', label: 'Guías de Prep.', icon: ClipboardList,   path: '/guides' },
  { id: 'nav-help', label: 'Centro de Ayuda', icon: LifeBuoy,      path: '/help' },
  { id: 'nav-contact', label: 'Contacto y Redes', icon: Phone,     path: '/contact' },
  { id: 'nav-about', label: 'Quiénes Somos', icon: Info,           path: '/about' },
  { id: 'nav-categories', label: 'Categorías', icon: Tags,         path: '/categories' },
];

export default function Shell({ children, title, subtitle }: Props) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e: any) => {
      setScrolled(e.target.scrollTop > 20);
    };
    const content = document.getElementById('main-content');
    if (content) content.addEventListener('scroll', handleScroll);
    return () => {
      if (content) content.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-dot"><Droplets size={20} strokeWidth={2.5} /></div>
          <div>
            <div className="sidebar-brand-title">EasyLab</div>
            <div className="sidebar-brand-sub">Admin Center</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={path}
              id={id}
              className={`sidebar-nav-item ${location.pathname === path ? 'active' : ''}`}
              onClick={() => navigate(path)}
            >
              <span className="sidebar-nav-icon"><Icon size={18} strokeWidth={location.pathname === path ? 2.5 : 2} /></span>
              <span style={{ flex: 1 }}>{label}</span>
              {location.pathname === path && <ChevronRight size={14} opacity={0.5} />}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button id="btn-logout" className="sidebar-nav-item" onClick={logout} style={{ color: 'var(--text-3)' }}>
            <span className="sidebar-nav-icon"><LogOut size={18} /></span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="topbar" style={{ 
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
          borderBottomColor: scrolled ? 'transparent' : 'rgba(226, 232, 240, 0.6)'
        }}>
          <div>
            <div className="topbar-title">{title}</div>
            {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
          </div>
          
          <div className="topbar-actions">
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 12, 
              padding: '6px 12px', background: 'var(--surface-2)', 
              borderRadius: '99px', border: '1px solid var(--border)' 
            }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', 
                background: 'var(--brand-light)', color: 'var(--brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <User size={16} strokeWidth={2.5} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', paddingRight: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.1 }}>Administrador</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>Higuera Escalante</span>
              </div>
            </div>
          </div>
        </header>
        <main id="main-content" className="content">{children}</main>
      </div>
    </div>
  );
}
