import { useState } from 'react';
import { quizConfig } from '../data/quizData';

export const Home = ({ onStartQuiz }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Nama panggilan wajib diisi');
      return;
    }
    if (trimmed.length < 2) {
      setError('Nama minimal 2 karakter');
      return;
    }
    if (trimmed.length > 50) {
      setError('Nama maksimal 50 karakter');
      return;
    }
    if (!/^[a-zA-Z0-9\s\-\.']+$/.test(trimmed)) {
      setError('Nama hanya boleh mengandung huruf, angka, spasi, titik, strip, dan apostrof');
      return;
    }
    setError('');
    onStartQuiz(trimmed);
  };
  
  return (
    <div className="page">
      <div className="container">
        <div className="home-hero">
          <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', marginBottom: '1.5rem', color: 'var(--color-white)', fontSize: '2.5rem'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <h1 className="home-title">{quizConfig.title}</h1>
          <p className="home-subtitle">{quizConfig.description}</p>
        </div>
        
        <div className="card" style={{maxWidth: '600px', margin: '0 auto'}}>
          <div className="card-body">
            <div className="home-info-cards">
              <div className="info-card">
                <div className="info-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
                </div>
                <div className="info-card-value">{quizConfig.totalQuestions}</div>
                <div className="info-card-label">Soal</div>
              </div>
              <div className="info-card">
                <div className="info-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="info-card-value">{quizConfig.timeLimitMinutes} Menit</div>
                <div className="info-card-label">Waktu</div>
              </div>
              <div className="info-card">
                <div className="info-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <div className="info-card-value">{quizConfig.totalPoints}</div>
                <div className="info-card-label">Total Poin</div>
              </div>
              <div className="info-card">
                <div className="info-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div className="info-card-value">Easy-Impossible</div>
                <div className="info-card-label">Tingkat</div>
              </div>
            </div>
            
            <form className="home-start-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="participantName">Nama Panggilan</label>
                <input
                  type="text"
                  id="participantName"
                  className="form-input"
                  placeholder="Masukkan nama panggilan Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  autoFocus
                  maxLength={50}
                />
                {error && <p className="form-error">{error}</p>}
                <p className="form-hint">Nama akan ditampilkan di sertifikat hasil ujian.</p>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                MULAI KUIS
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
