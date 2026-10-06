import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">E</div>
        <h1 className="auth-title">EasyLab Admin</h1>
        <p className="auth-subtitle">Inicia sesión para gestionar el contenido</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="admin@easylab.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="btn-login"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 8, justifyContent: 'center', padding: '14px' }}
          >
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Verificando…</> : 'Iniciar Sesión'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
          Panel exclusivo para administradores de EasyLab
        </p>
      </div>
    </div>
  );
}
