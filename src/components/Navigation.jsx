export const Navigation = ({ 
  currentIndex, 
  totalQuestions, 
  onPrevious, 
  onNext, 
  onSubmit,
  canGoPrevious,
  canGoNext,
  isLastQuestion,
  submitting,
  disabled = false
}) => {
  return (
    <div className="quiz-navigation">
      <div className="nav-buttons">
        <button
          className="btn btn-secondary"
          onClick={onPrevious}
          disabled={!canGoPrevious || disabled || submitting}
          aria-label="Soal sebelumnya"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Sebelumnya
        </button>
        
        {isLastQuestion ? (
          <button
            className="btn btn-gold"
            onClick={onSubmit}
            disabled={disabled || submitting}
          >
            {submitting ? (
              <>
                <svg className="loading-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeDashoffset="31.4"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></circle></svg>
                Mengumpulkan...
              </>
            ) : (
              <>
                Kumpulkan Ujian
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                </svg>
              </>
            )}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onNext}
            disabled={!canGoNext || disabled || submitting}
            aria-label="Soal selanjutnya"
          >
            Selanjutnya
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
