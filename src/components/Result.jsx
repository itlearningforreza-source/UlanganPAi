export const ScoreCircle = ({ percentage, score, totalScore }) => {
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="score-circle">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle
          className="score-circle-bg"
          cx="80"
          cy="80"
          r="70"
        />
        <circle
          className="score-circle-progress"
          cx="80"
          cy="80"
          r="70"
          style={{strokeDasharray: circumference, strokeDashoffset: offset}}
        />
      </svg>
      <div className="score-circle-text">{score}/{totalScore}</div>
    </div>
  );
};

export const ScoreDetail = ({ label, value, icon, type }) => {
  const icons = {
    correct: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    incorrect: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    unanswered: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    )
  };
  
  return (
    <div className={`score-detail`}>
      <div className={`score-detail-icon ${type}`}>
        {icons[type]}
      </div>
      <div className="score-detail-info">
        <div className="score-detail-value">{value}</div>
        <div className="score-detail-label">{label}</div>
      </div>
    </div>
  );
};

export const MetaCard = ({ label, value }) => (
  <div className="meta-card">
    <div className="meta-card-value">{value}</div>
    <div className="meta-card-label">{label}</div>
  </div>
);

export const ReviewItem = ({ question, userAnswer, correctAnswer, isCorrect, pointsEarned, maxPoints, explanation, index }) => {
  const getAnswerDisplay = (ans) => {
    if (ans === undefined || ans === '' || (Array.isArray(ans) && ans.length === 0)) {
      return <span style={{color: 'var(--color-text-muted)', fontStyle: 'italic'}}>Tidak dijawab</span>;
    }
    if (Array.isArray(ans)) {
      return ans.map((a, i) => <span key={i} style={{display: 'inline-block', marginRight: '0.5rem', padding: '0.25rem 0.5rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem'}}>{a}</span>);
    }
    return String(ans);
  };
  
  return (
    <div className="review-item">
      <div className="review-item-header">
        <div className={`review-item-number ${isCorrect ? 'correct' : userAnswer === undefined || userAnswer === '' || (Array.isArray(userAnswer) && userAnswer.length === 0) ? 'unanswered' : 'incorrect'}`}>
          {index + 1}
        </div>
        <p className="review-item-question">{question}</p>
        <span className="review-item-points">{pointsEarned}/{maxPoints} poin</span>
      </div>
      <div className="review-item-body">
        <div className={`review-answer-row ${userAnswer === undefined || userAnswer === '' || (Array.isArray(userAnswer) && userAnswer.length === 0) ? '' : isCorrect ? 'correct' : 'user'}`}>
          <span className="review-answer-label">Jawaban Anda</span>
          <span className="review-answer-value">{getAnswerDisplay(userAnswer)}</span>
        </div>
        {!isCorrect && userAnswer !== undefined && userAnswer !== '' && !(Array.isArray(userAnswer) && userAnswer.length === 0) && (
          <div className="review-answer-row correct">
            <span className="review-answer-label">Jawaban Benar</span>
            <span className="review-answer-value">{getAnswerDisplay(correctAnswer)}</span>
          </div>
        )}
        {explanation && (
          <div className="review-explanation">
            <div className="review-explanation-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              Pembahasan
            </div>
            <p className="review-explanation-text">{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};
