import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Home } from './pages/Home';
import { Quiz } from './pages/Quiz';
import { Result } from './pages/Result';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDetailModal } from './components/AdminDetailModal';
import { ToastContainer } from './components/Toast';
import { useQuiz, useToast } from './hooks/useQuiz';
import './index.css';

function App() {
  const [view, setView] = useState('home'); // home, quiz, result, admin-login, admin
  const [adminUser, setAdminUser] = useState(null);
  
  const { 
    status, 
    submissionResult, 
    resetQuiz, 
    hasPendingRetry, 
    retrySubmission 
  } = useQuiz();
  
  const { toasts, showToast, dismissToast } = useToast();
  
  // Check for existing auth session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setAdminUser(session.user);
        setView('admin');
      } else if (event === 'SIGNED_OUT') {
        setAdminUser(null);
        if (view === 'admin') setView('home');
      }
    });
    
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAdminUser(session.user);
        setView('admin');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [view]);
  
  // Handle pending retry notification
  useEffect(() => {
    if (hasPendingRetry()) {
      showToast('Ada data ujian yang belum terkirim ke server. Klik untuk mencoba lagi.', 'warning', 0);
    }
  }, [hasPendingRetry, showToast]);
  
  // Determine which view to show based on quiz status
  useEffect(() => {
    if (view === 'home' || view === 'admin' || view === 'admin-login') return;
    
    if (status === 'started') {
      setView('quiz');
    } else if (status === 'submitted' && submissionResult) {
      setView('result');
    } else {
      setView('home');
    }
  }, [status, submissionResult, view]);
  
  const handleStartQuiz = (name) => {
    setView('quiz');
  };
  
  const handleAdminLogin = (user) => {
    setAdminUser(user);
    setView('admin');
  };
  
  const handleLogout = () => {
    setAdminUser(null);
    setView('home');
  };
  
  const handleResetQuiz = () => {
    resetQuiz();
    setView('home');
  };
  
  // Render appropriate view
  const renderView = () => {
    switch (view) {
      case 'quiz':
        return <Quiz />;
      case 'result':
        return (
          <>
            <Result />
            <button 
              className="btn btn-outline" 
              style={{position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100, boxShadow: 'var(--shadow-lg)'}}
              onClick={handleResetQuiz}
            >
              Kembali ke Beranda
            </button>
          </>
        );
      case 'admin-login':
        return <AdminLogin onLogin={handleAdminLogin} />;
      case 'admin':
        return <AdminDashboard user={adminUser} onLogout={handleLogout} />;
      default:
        return <Home onStartQuiz={handleStartQuiz} />;
    }
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <div className="header-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            Marriage Knowledge Challenge
          </div>
          <nav style={{display: 'flex', gap: '0.5rem'}}>
            {view === 'home' && (
              <button className="btn btn-outline btn-sm" onClick={() => setView('admin-login')}>
                Admin Login
              </button>
            )}
            {view === 'admin' && adminUser && (
              <span style={{display: 'flex', alignItems: 'center', padding: '0 1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem'}}>
                {adminUser.email}
              </span>
            )}
          </nav>
        </div>
      </header>
      
      <main id="main-content">
        {renderView()}
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <p>Marriage Knowledge Challenge - Ujian Pernikahan dalam Islam</p>
          <p style={{marginTop: '0.25rem', fontSize: '0.75rem'}}>Sumber: Hikmah Pernikahan, Tujuan Pernikahan, Dalil & Hadis, Surah Ar-Rum 21, An-Nahl 72, An-Nur 32</p>
        </div>
      </footer>
      
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
