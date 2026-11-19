import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAdmin } from '../hooks/useQuiz';
import { formatDateTime, formatDuration } from '../utils/quizUtils';
import { quizConfig } from '../data/quizData';
import { ConfirmModal } from '../components/Modal';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useQuiz';
import { AdminDetailModal } from '../components/AdminDetailModal';

export const AdminDashboard = ({ user, onLogout }) => {
  const {
    attempts,
    stats,
    loading,
    error,
    filters,
    currentPage,
    pageSize,
    totalPages,
    selectedAttempt,
    setSelectedAttempt,
    fetchData,
    fetchAttemptDetails,
    exportCSV,
    updateFilters,
    clearFilters,
    setCurrentPage
  } = useAdmin();
  
  const { toasts, showToast, dismissToast } = useToast();
  const [showAttemptDetail, setShowAttemptDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  
  const handleViewAttempt = async (attempt) => {
    setDetailLoading(true);
    try {
      const data = await fetchAttemptDetails(attempt.id);
      if (data) {
        setDetailData(data);
        setShowAttemptDetail(true);
      }
    } catch (e) {
      showToast('Gagal memuat detail: ' + e.message, 'error');
    } finally {
      setDetailLoading(false);
    }
  };
  
  const handleExport = async () => {
    setShowExportConfirm(false);
    try {
      const success = await exportCSV();
      if (success) {
        showToast('CSV berhasil diekspor', 'success');
      }
    } catch (e) {
      showToast('Ekspor gagal: ' + e.message, 'error');
    }
  };
  
  const handleLogout = () => {
    supabase.auth.signOut();
    onLogout();
  };
  
  const getScoreClass = (score) => {
    const percentage = Math.round((score / quizConfig.totalPoints) * 100);
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'very-good';
    if (percentage >= 70) return 'good';
    if (percentage >= 60) return 'average';
    return 'needs-improvement';
  };
  
  const getGradeLabel = (score) => {
    const grade = quizConfig.grades.find(g => score >= g.min && score <= g.max);
    return grade?.label || '-'; 
  };
  
  if (!isSupabaseConfigured()) {
    const envExample = 'VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key';
    return (
      <div className="admin-main">
        <div className="card" style={{maxWidth: '600px', margin: '0 auto', textAlign: 'center'}}>
          <div className="card-body" style={{padding: '3rem'}}>
            <div style={{fontSize: '4rem', marginBottom: '1rem'}}>⚙️</div>
            <h2>Supabase Belum Dikonfigurasi</h2>
            <p style={{color: 'var(--color-text-muted)', marginBottom: '1.5rem'}}>
              Silakan atur environment variables VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env
            </p>
            <pre style={{textAlign: 'left', background: 'var(--color-bg-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', overflow: 'auto', fontSize: '0.875rem'}}>
              {envExample}
            </pre>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Admin Panel
          </h2>
        </div>
        <nav className="admin-nav">
          <button className="admin-nav-item active">
            <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
            Dashboard
          </button>
          <button className="admin-nav-item">
            <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Peserta
          </button>
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">{user?.email?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="admin-user-details">
              <div className="admin-user-name">{user?.email || 'Admin'}</div>
              <div className="admin-user-role">Administrator</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Keluar</button>
          </div>
        </div>
      </aside>
      
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-page-title">Dashboard</h1>
          <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
            <button className="btn btn-primary" onClick={() => setShowExportConfirm(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Ekspor CSV
            </button>
            <button className="btn btn-outline" onClick={fetchData} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              Refresh
            </button>
          </div>
        </header>
        
        {stats && (
          <div className="admin-stats-grid">
            <div className="stat-card">
              <div className="stat-icon participants">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalParticipants}</div>
                <div className="stat-label">Total Peserta</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon completed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalCompleted}</div>
                <div className="stat-label">Selesai</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon average">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.averageScore}</div>
                <div className="stat-label">Rata-rata Nilai</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon highest">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.highestScore}</div>
                <div className="stat-label">Nilai Tertinggi</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon lowest">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15l6-6 6 6"/></svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.lowestScore}</div>
                <div className="stat-label">Nilai Terendah</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="admin-filters">
          <div className="filter-group" style={{minWidth: '250px'}}>
            <label>Cari Nama</label>
            <input
              type="text"
              className="form-input"
              placeholder="Cari nama peserta..."
              value={filters.search}
              onChange={(e) => updateFilters({search: e.target.value})}
            />
          </div>
          <div className="filter-group" style={{minWidth: '140px'}}>
            <label>Nilai Min</label>
            <input
              type="number"
              className="form-input"
              placeholder="0"
              value={filters.scoreMin}
              onChange={(e) => updateFilters({scoreMin: e.target.value})}
              min={0}
              max={100}
            />
          </div>
          <div className="filter-group" style={{minWidth: '140px'}}>
            <label>Nilai Max</label>
            <input
              type="number"
              className="form-input"
              placeholder="100"
              value={filters.scoreMax}
              onChange={(e) => updateFilters({scoreMax: e.target.value})}
              min={0}
              max={100}
            />
          </div>
          <div className="filter-group" style={{minWidth: '180px'}}>
            <label>Dari Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={filters.dateFrom}
              onChange={(e) => updateFilters({dateFrom: e.target.value})}
            />
          </div>
          <div className="filter-group" style={{minWidth: '180px'}}>
            <label>Sampai Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={filters.dateTo}
              onChange={(e) => updateFilters({dateTo: e.target.value})}
            />
          </div>
          <div className="filter-group" style={{minWidth: '150px'}}>
            <label>Status</label>
            <select className="form-select" value={filters.status} onChange={(e) => updateFilters({status: e.target.value})}>
              <option value="">Semua</option>
              <option value="completed">Selesai</option>
              <option value="in_progress">Berlangsung</option>
              <option value="submitted">Dikumpulkan</option>
            </select>
          </div>
          {(filters.search || filters.scoreMin || filters.scoreMax || filters.dateFrom || filters.dateTo || filters.status) && (
            <button className="btn btn-outline" onClick={clearFilters} style={{height: 'fit-content'}}>
              Reset Filter
            </button>
          )}
        </div>
        
        <div className="admin-table-container">
          {loading ? (
            <div style={{padding: '3rem', textAlign: 'center'}}><div className="loading-overlay"><div className="spinner"/></div></div>
          ) : error ? (
            <div style={{padding: '2rem', textAlign: 'center', color: 'var(--color-error)'}}>{error}</div>
          ) : attempts.length === 0 ? (
            <div style={{padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)'}}>Belum ada data peserta</div>
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Nilai</th>
                    <th>Benar</th>
                    <th>Salah</th>
                    <th>Kosong</th>
                    <th>Durasi</th>
                    <th>%</th>
                    <th>Predikat</th>
                    <th>Status</th>
                    <th>Mulai</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td style={{fontWeight: 500}}>{attempt.participant_name}</td>
                      <td className={`score-cell ${getScoreClass(attempt.total_score)}`}>{attempt.total_score}</td>
                      <td style={{color: 'var(--color-success)'}}>{attempt.correct_answers}</td>
                      <td style={{color: 'var(--color-error)'}}>{attempt.incorrect_answers}</td>
                      <td style={{color: 'var(--color-warning)'}}>{attempt.unanswered_questions}</td>
                      <td>{formatDuration(attempt.duration_seconds || 0)}</td>
                      <td>{Math.round((attempt.total_score / quizConfig.totalPoints) * 100)}%</td>
                      <td>{getGradeLabel(attempt.total_score)}</td>
                      <td>
                        <span className={`status-badge ${attempt.status}`}>
                          {attempt.status === 'completed' ? 'Selesai' : attempt.status === 'in_progress' ? 'Berlangsung' : 'Dikumpulkan'}
                        </span>
                      </td>
                      <td>{formatDateTime(attempt.started_at).split(', ')[0]}</td>
                      <td>
                        <button className="action-btn" onClick={() => handleViewAttempt(attempt)} aria-label="Lihat detail">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div style={{padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)'}}>
                  <button className="btn btn-outline btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading}>Sebelumnya</button>
                  <span style={{padding: '0.5rem 1rem', color: 'var(--color-text-muted)'}}>Halaman {currentPage} dari {totalPages}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || loading}>Selanjutnya</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
