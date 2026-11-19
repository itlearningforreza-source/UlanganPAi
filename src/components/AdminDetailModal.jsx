import { formatDateTime, formatDuration } from '../utils/quizUtils';
import { quizConfig } from '../data/quizData';

export const AdminDetailModal = ({ isOpen, onClose, attempt, answers, loading }) => {
  if (!isOpen || !attempt) return null;
  
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
  
  const getAnswerDisplay = (ans) => {
    if (ans === undefined || ans === null || ans === '' || (Array.isArray(ans) && ans.length === 0)) {
      return <span style={{color: 'var(--color-text-muted)', fontStyle: 'italic'}}>Tidak dijawab</span>;
    }
    if (Array.isArray(ans)) {
      return ans.map((a, i) => <span key={i} style={{display: 'inline-block', marginRight: '0.5rem', marginBottom: '0.25rem', padding: '0.25rem 0.5rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem'}}>{a}</span>);
    }
    return String(ans);
  };
  
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
      <div className="modal" style={{maxWidth: '700px'}} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="detail-modal-title" className="modal-title">Detail Peserta: {attempt.participant_name}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Tutup"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div className="modal-body" style={{maxHeight: '70vh', overflow: 'auto'}}>
          {loading ? (
            <div style={{textAlign: 'center', padding: '2rem'}}><div className="loading-overlay"><div className="spinner"/></div></div>
          ) : (
            <>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)'}}>
                <div>
                  <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Nilai Total</div>
                  <div className={`stat-value ${getScoreClass(attempt.total_score)}`} style={{fontSize: '1.5rem'}}>{attempt.total_score} / {quizConfig.totalPoints}</div>
                </div>
                <div>
                  <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Persentase</div>
                  <div className="stat-value" style={{fontSize: '1.5rem'}}>{Math.round((attempt.total_score / quizConfig.totalPoints) * 100)}%</div>
                </div>
                <div>
                  <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Predikat</div>
                  <div className="stat-value" style={{fontSize: '1.5rem', color: 'var(--color-primary)'}}>{getGradeLabel(attempt.total_score)}</div>
                </div>
                <div>
                  <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Durasi</div>
                  <div className="stat-value" style={{fontSize: '1.5rem', fontFamily: 'var(--font-mono)'}}>{formatDuration(attempt.duration_seconds || 0)}</div>
                </div>
                <div>
                  <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Benar / Salah / Kosong</div>
                  <div className="stat-value" style={{fontSize: '1.5rem', fontFamily: 'var(--font-mono)'}}>{attempt.correct_answers} / {attempt.incorrect_answers} / {attempt.unanswered_questions}</div>
                </div>
                <div>
                  <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Status</div>
                  <div className="stat-value" style={{fontSize: '1rem'}}><span className={`status-badge ${attempt.status}`}>{attempt.status === 'completed' ? 'Selesai' : 'Berlangsung'}</span></div>
                </div>
              </div>
              
              <div style={{marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem'}}>
                  <div><strong>Mulai:</strong> {formatDateTime(attempt.started_at)}</div>
                  <div><strong>Dikumpulkan:</strong> {attempt.submitted_at ? formatDateTime(attempt.submitted_at) : '-'}</div>
                  <div><strong>Dibuat:</strong> {formatDateTime(attempt.created_at)}</div>
                </div>
              </div>
              
              <h3 style={{marginBottom: '1rem', fontSize: '1rem', color: 'var(--color-primary-dark)'}}>Detail Jawaban</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                {answers.map((answer, index) => (
                  <div key={answer.id || answer.question_number} style={{border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden'}}>
                    <div style={{padding: '0.75rem 1rem', background: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
                      <span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', fontWeight: '700', fontSize: '0.8125rem', background: answer.is_correct ? 'rgba(39, 174, 96, 0.15)' : 'rgba(192, 57, 43, 0.15)', color: answer.is_correct ? 'var(--color-success)' : 'var(--color-error)'}}>
                        {answer.question_number}
                      </span>
                      <span style={{fontWeight: 600, flex: 1, minWidth: '200px'}}>Soal {answer.question_number}</span>
                      <span style={{fontSize: '0.8125rem', fontWeight: 600, color: answer.is_correct ? 'var(--color-success)' : 'var(--color-error)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', background: answer.is_correct ? 'rgba(39, 174, 96, 0.1)' : 'rgba(192, 57, 43, 0.1)'}}>
                        {answer.is_correct ? 'Benar' : 'Salah'}
                      </span>
                      <span style={{fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)'}}>{answer.score}/{quizConfig.totalPoints > 0 ? quizConfig.totalPoints : 0} poin</span>
                    </div>
                    <div style={{padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', fontSize: '0.875rem'}}>
                      <div>
                        <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Jawaban Peserta</div>
                        <div>{getAnswerDisplay(answer.answer)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
