import { useMemo } from 'react';

const OptionIcon = ({ type }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    {type === 'radio' && (
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
    )}
    {type === 'checkbox' && (
      <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
    )}
  </svg>
);

export const QuizQuestion = ({ 
  question, 
  answer, 
  onAnswerChange, 
  showExplanation = false,
  disabled = false
}) => {
  const { type, options, id, question: questionText, explanation, difficulty } = question;
  
  const handleChange = (value) => {
    if (!disabled) {
      onAnswerChange(id, value);
    }
  };
  
  const isAnswered = answer !== undefined && answer !== '' && !(Array.isArray(answer) && answer.length === 0);
  
  if (type === 'single') {
    return (
      <div className="quiz-question-card">
        <div className="question-header">
          <div className="question-meta">
            <span className="question-number">Soal {id} dari 10</span>
            <span className={`question-difficulty ${difficulty.toLowerCase()}`}>{difficulty}</span>
          </div>
          <p className="question-text">{questionText}</p>
        </div>
        <div className="question-body">
          <div className="radio-group" role="radiogroup" aria-label={questionText}>
            {options.map((option) => (
              <label
                key={option.key}
                className={`radio-label ${answer === option.key ? 'selected' : ''}`}
                onClick={() => handleChange(option.key)}
              >
                <input
                  type="radio"
                  name={`question-${id}`}
                  value={option.key}
                  checked={answer === option.key}
                  onChange={() => handleChange(option.key)}
                  disabled={disabled}
                  aria-label={option.text}
                />
                <span className="option-key">{option.key}</span>
                <span className="option-text">{option.text}</span>
              </label>
            ))}
          </div>
        </div>
        {showExplanation && explanation && (
          <div className="question-explanation show">
            <div className="explanation-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              Pembahasan
            </div>
            <p className="explanation-text">{explanation}</p>
          </div>
        )}
      </div>
    );
  }
  
  if (type === 'multiple') {
    return (
      <div className="quiz-question-card">
        <div className="question-header">
          <div className="question-meta">
            <span className="question-number">Soal {id} dari 10</span>
            <span className={`question-difficulty ${difficulty.toLowerCase()}`}>{difficulty}</span>
          </div>
          <p className="question-text">{questionText}</p>
          <p style={{fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem'}}>Pilih SEMUA yang benar. Penilaian exact match.</p>
        </div>
        <div className="question-body">
          <div className="checkbox-group" role="group" aria-label={questionText}>
            {options.map((option) => (
              <label
                key={option.key}
                className={`checkbox-label ${Array.isArray(answer) && answer.includes(option.key) ? 'selected' : ''}`}
                onClick={() => {
                  if (disabled) return;
                  const current = Array.isArray(answer) ? [...answer] : [];
                  const newAnswer = current.includes(option.key)
                    ? current.filter(k => k !== option.key)
                    : [...current, option.key];
                  handleChange(newAnswer.sort());
                }}
              >
                <input
                  type="checkbox"
                  value={option.key}
                  checked={Array.isArray(answer) && answer.includes(option.key)}
                  onChange={() => {}}
                  disabled={disabled}
                  aria-label={option.text}
                />
                <span className="option-key">{option.key}</span>
                <span className="option-text">{option.text}</span>
              </label>
            ))}
          </div>
        </div>
        {showExplanation && explanation && (
          <div className="question-explanation show">
            <div className="explanation-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              Pembahasan
            </div>
            <p className="explanation-text">{explanation}</p>
          </div>
        )}
      </div>
    );
  }
  
  if (type === 'essay') {
    const isImpossible = id === 10;
    
    return (
      <div className="quiz-question-card">
        <div className="question-header">
          <div className="question-meta">
            <span className="question-number">Soal {id} dari 10</span>
            <span className={`question-difficulty ${difficulty.toLowerCase()}`}>{difficulty}</span>
            {isImpossible && (
              <span style={{marginLeft: 'auto', padding: '0.25rem 0.75rem', background: 'linear-gradient(135deg, var(--color-gold) 0%, #b09000 100%)', color: 'var(--color-white)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                IMPOSSIBLE CHALLENGE
              </span>
            )}
          </div>
          <p className="question-text">{questionText}</p>
          {isImpossible && (
            <p style={{fontSize: '0.875rem', color: 'var(--color-error)', marginTop: '0.5rem', fontWeight: '500'}}>
              ⚠ Soal ini sengaja tidak dapat dijawab berdasarkan materi. Tunjukkan integritas intelektual Anda.
            </p>
          )}
        </div>
        <div className="question-body">
          <textarea
            className="form-textarea essay-textarea"
            placeholder={isImpossible ? 'Jelaskan mengapa soal ini tidak dapat dijawab berdasarkan materi yang tersedia...' : 'Tulis jawaban Anda di sini...'}
            value={answer || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            rows={8}
            aria-label={questionText}
          />
          <p className="form-hint">{isImpossible ? 'Tidak ada jawaban benar/salah. Nilai penuh jika Anda menyadari keterbatasan informasi.' : 'Jawaban akan dinilai berdasarkan kualitas argumentasi dan kelengkapan konsep.'}</p>
        </div>
        {showExplanation && explanation && (
          <div className="question-explanation show">
            <div className="explanation-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              Pembahasan
            </div>
            <p className="explanation-text">{explanation}</p>
          </div>
        )}
      </div>
    );
  }
  
  return null;
};
