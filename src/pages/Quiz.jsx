import { useEffect, useCallback, useState, useMemo } from 'react';
import { QuizQuestion } from '../components/QuizQuestion';
import { Timer } from '../components/Timer';
import { ProgressBar } from '../components/Progress';
import { Navigation } from '../components/Navigation';
import { ConfirmModal } from '../components/Modal';
import { useQuiz } from '../hooks/useQuiz';

export const Quiz = () => {
  const {
    currentQuestionIndex,
    currentQuestion,
    answers,
    status,
    timeRemaining,
    timerActive,
    progress,
    answeredCount,
    totalQuestions,
    formatTimeRemaining,
    getTimerStatus,
    handleAnswerChange,
    goToQuestion,
    goToPrevious,
    goToNext,
    submitQuiz,
    setError,
    hasPendingRetry
  } = useQuiz();
  
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  
  // Check for time up
  useEffect(() => {
    if (timeRemaining <= 0 && timerActive) {
      setShowTimeUpModal(true);
    }
  }, [timeRemaining, timerActive]);
  
  // Handle before unload warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (status === 'started') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);
  
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const answeredIndices = useMemo(() => 
    Object.keys(answers).filter(key => {
      const val = answers[key];
      return val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0);
    }).map(Number),
  [answers]);
  
  const handleSubmitClick = () => {
    setShowSubmitConfirm(true);
  };
  
  const handleConfirmSubmit = async () => {
    setShowSubmitConfirm(false);
    await submitQuiz();
  };
  
  const handleTimeUpSubmit = async () => {
    setShowTimeUpModal(false);
    await submitQuiz(true);
  };
  
  if (status !== 'started') {
    return null;
  }
  
  return (
    <div className="page">
      <div className="container">
        <header className="quiz-header">
          <h1 className="quiz-title">{currentQuestion.difficulty} - Soal {currentQuestionIndex + 1}</h1>
          <Timer timeRemaining={timeRemaining} active={timerActive} />
        </header>
        
        <ProgressBar
          current={currentQuestionIndex}
          total={totalQuestions}
          answeredIndices={answeredIndices}
          impossibleIndex={9}
          onGoToQuestion={goToQuestion}
        />
        
        <QuizQuestion
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          onAnswerChange={handleAnswerChange}
          showExplanation={false}
          disabled={false}
        />
        
        <Navigation
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onSubmit={handleSubmitClick}
          canGoPrevious={currentQuestionIndex > 0}
          canGoNext={currentQuestionIndex < totalQuestions - 1}
          isLastQuestion={isLastQuestion}
          submitting={false}
        />
        
        <ConfirmModal
          isOpen={showSubmitConfirm}
          onClose={() => setShowSubmitConfirm(false)}
          onConfirm={handleConfirmSubmit}
          title="Kumpulkan Ujian?"
          message="Apakah Anda yakin ingin mengumpulkan ujian? Anda tidak dapat mengubah jawaban setelah dikumpulkan."
          confirmText="Ya, Kumpulkan"
          cancelText="Batal"
          variant="gold"
        />
        
        <ConfirmModal
          isOpen={showTimeUpModal}
          onClose={() => setShowTimeUpModal(false)}
          onConfirm={handleTimeUpSubmit}
          title="Waktu Habis"
          message="Waktu pengerjaan telah habis. Ujian akan dikumpulkan secara otomatis."
          confirmText="Kumpulkan Sekarang"
          cancelText="Tunggu"
          variant="primary"
        />
      </div>
    </div>
  );
};
