import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!isSupabaseConfigured()) {
        setError('Supabase belum dikonfigurasi. Silakan atur environment variables.');
        setLoading(false);
        return;
      }
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw authError;
      
      onLogin(data.user);
    } catch (e) {
      setError(e.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="page" style={{alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem'}}>
      <div className="card" style={{maxWidth: '420px', width: '100%'}}>
        <div className="card-header" style={{textAlign: 'center'}}>
          <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', marginBottom: '1rem', color: 'var(--color-white)', fontSize: '1.75rem'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h2 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>Admin Dashboard</h2>
          <p style={{color: 'var(--color-text-muted)'}}>Masuk untuk melihat statistik dan data peserta</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
            {error && (
              <div className="form-error" style={{marginBottom: '1rem', padding: '0.75rem', background: 'rgba(192, 57, 43, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(192, 57, 43, 0.2)'}}>
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <>
                  <svg className="loading-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeDashoffset="31.4"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></circle></svg>
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
          <p className="form-hint" style={{marginTop: '1.5rem', textAlign: 'center'}}>
            Hanya akun administrator yang berwenang dapat mengakses dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
