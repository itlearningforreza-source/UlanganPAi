import { useEffect, useState } from 'react';
import { ScoreCircle, ScoreDetail, MetaCard, ReviewItem } from '../components/Result';
import { quizConfig } from '../data/quizData';
import { formatDuration, formatDateTime } from '../utils/quizUtils';
import { useQuiz } from '../hooks/useQuiz';

export const Result = () => {
  const { submissionResult, resetQuiz, status } = useQuiz();
  const [showReview, setShowReview] = useState(false);
  
  if (!submissionResult || status !== 'submitted') {
    return null;
  }
  
  const { 
    participantName, 
    totalScore, 
    correctAnswers, 
    incorrectAnswers, 
    unansweredQuestions, 
    durationSeconds, 
    percentage, 
    grade, 
    questionResults,
    startedAt,
    submittedAt
  } = submissionResult;
  
  useEffect(() => {
    // Trigger animation
  }, []);
  
  return (
    <div className="page">
      <div className="container">
        <div className="result-container">
          <div className="result-header">
            <h1 className="result-title">Hasil Ujian</h1>
            <div className="result-grade" style={{background: grade.color}}>
              {grade.label}
            </div>
          </div>
          
          <div className="card" style={{marginBottom: '2rem'}}>
            <div className="card-body" style={{textAlign: 'center', paddingTop: '1rem'}}>
              <p style={{fontSize: '1.125rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem'}}>Selamat, <strong>{participantName}</strong>!</p>
              <p style={{color: 'var(--color-text-muted)'}}>Anda menyelesaikan Marriage Knowledge Challenge</p>
            </div>
          </div>
          
          <div className="result-score">
            <ScoreCircle percentage={percentage} score={totalScore} totalScore={quizConfig.totalPoints} />
            <div className="score-details">
              <ScoreDetail label="Benar" value={correctAnswers} type="correct" />
              <ScoreDetail label="Salah" value={incorrectAnswers} type="incorrect" />
              <ScoreDetail label="Kosong" value={unansweredQuestions} type="unanswered" />
            </div>
          </div>
          
          <div className="result-meta">
            <MetaCard label="Persentase" value={percentage + '%'} />
            <MetaCard label="Durasi" value={formatDuration(durationSeconds)} />
            <MetaCard label="Mulai" value={formatDateTime(startedAt).split(', ')[1] || '-'} />
            <MetaCard label="Selesai" value={formatDateTime(submittedAt).split(', ')[1] || '-'} />
          </div>
          
          <div className="result-actions">
            <button className="btn btn-outline" onClick={() => setShowReview(!showReview)}>
              {showReview ? 'Sembunyikan Pembahasan' : 'Lihat Pembahasan'}
            </button>
            <button className="btn btn-primary" onClick={resetQuiz}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              Ulangi Kuis
            </button>
          </div>
          
          {showReview && (
            <div className="review-section">
              <h2 className="review-title">Pembahasan Soal</h2>
              <div className="review-list">
                {questionResults.map((qr, index) => (
                  <ReviewItem key={qr.questionId} {...qr} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
