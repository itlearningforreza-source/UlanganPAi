import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured, generateUUID, formatISODate, calculateDuration, TABLES } from '../lib/supabase';
import { quizQuestions, quizConfig } from '../data/quizData';
import { 
  calculateTotalScore, 
  saveQuizState, 
  loadQuizState, 
  saveAnswers, 
  loadAnswers, 
  clearQuizData,
  generateAttemptId,
  validateParticipantName,
  formatDuration,
  formatDateTime,
  STORAGE_KEYS
} from '../utils/quizUtils';

/**
 * Main quiz hook - handles all quiz logic
 */
export const useQuiz = () => {
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(() => loadAnswers());
  const [participantName, setParticipantName] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [attemptId, setAttemptId] = useState(() => localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPT_ID) || null);
  const [status, setStatus] = useState('idle');
  const [timeRemaining, setTimeRemaining] = useState(quizConfig.timeLimitMinutes * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  
  // Refs
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const isSubmittingRef = useRef(false);
  
  // Current question
  const currentQuestion = quizQuestions[currentQuestionIndex];
  
  // Progress
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  const answeredCount = Object.keys(answers).filter(key => {
    const val = answers[key];
    return val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0);
  }).length;
  
  // Initialize quiz from localStorage
  useEffect(() => {
    const savedState = loadQuizState();
    if (savedState) {
      if (savedState.currentQuestionIndex !== undefined) {
        setCurrentQuestionIndex(savedState.currentQuestionIndex);
      }
      if (savedState.participantName) {
        setParticipantName(savedState.participantName);
      }
      if (savedState.startTime) {
        setStartTime(savedState.startTime);
        startTimeRef.current = new Date(savedState.startTime);
      }
      if (savedState.attemptId) {
        setAttemptId(savedState.attemptId);
      }
      if (savedState.status) {
        setStatus(savedState.status);
      }
      if (savedState.timeRemaining !== undefined) {
        setTimeRemaining(savedState.timeRemaining);
      }
    }
  }, []);
  
  // Persist state to localStorage
  const persistState = useCallback((newState) => {
    saveQuizState({
      currentQuestionIndex,
      participantName,
      startTime: startTimeRef.current?.toISOString() || startTime,
      attemptId,
      status,
      timeRemaining,
      ...newState
    });
  }, [currentQuestionIndex, participantName, startTime, attemptId, status, timeRemaining]);
  
  // Timer logic
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          persistState({ timeRemaining: newTime });
          if (newTime <= 0) {
            setTimerActive(false);
            handleTimeUp();
          }
          return newTime;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive, timeRemaining, persistState]);
  
  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Handle answer change
  const handleAnswerChange = useCallback((questionId, answer) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: answer };
      saveAnswers(newAnswers);
      return newAnswers;
    });
  }, []);
  
  // Navigate to question
  const goToQuestion = useCallback((index) => {
    if (index >= 0 && index < quizQuestions.length) {
      setCurrentQuestionIndex(index);
      persistState({ currentQuestionIndex: index });
    }
  }, [persistState]);
  
  const goToPrevious = useCallback(() => {
    goToQuestion(currentQuestionIndex - 1);
  }, [currentQuestionIndex, goToQuestion]);
  
  const goToNext = useCallback(() => {
    goToQuestion(currentQuestionIndex + 1);
  }, [currentQuestionIndex, goToQuestion]);
  
  // Start quiz
  const startQuiz = useCallback((name) => {
    const validation = validateParticipantName(name);
    if (!validation.valid) {
      setError(validation.error);
      return false;
    }
    
    const newAttemptId = generateAttemptId();
    const now = new Date();
    
    setParticipantName(validation.name);
    setAttemptId(newAttemptId);
    setStartTime(now.toISOString());
    startTimeRef.current = now;
    setStatus('started');
    setTimerActive(true);
    setTimeRemaining(quizConfig.timeLimitMinutes * 60);
    setError(null);
    
    localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPT_ID, newAttemptId);
    localStorage.setItem(STORAGE_KEYS.PARTICIPANT_NAME, validation.name);
    localStorage.setItem(STORAGE_KEYS.QUIZ_START_TIME, now.toISOString());
    
    persistState({ 
      participantName: validation.name,
      attemptId: newAttemptId,
      startTime: now.toISOString(),
      status: 'started',
      timeRemaining: quizConfig.timeLimitMinutes * 60
    });
    
    if (isSupabaseConfigured()) {
      createAttemptInDb(newAttemptId, validation.name, now.toISOString()).catch(console.error);
    }
    
    return true;
  }, [persistState]);
  
  // Create attempt in database
  const createAttemptInDb = async (id, name, startedAt) => {
    try {
      await supabase
        .from(TABLES.QUIZ_ATTEMPTS)
        .insert({
          id,
          participant_name: name,
          started_at: startedAt,
          status: 'in_progress',
          total_score: 0,
          correct_answers: 0,
          incorrect_answers: 0,
          unanswered_questions: quizQuestions.length
        });
    } catch (e) {
      console.error('Failed to create attempt in DB:', e);
    }
  };
  
  // Handle time up
  const handleTimeUp = useCallback(async () => {
    setTimerActive(false);
    await submitQuiz(true);
  }, []);
  
  // Submit quiz
  const submitQuiz = useCallback(async (isAutoSubmit = false) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    
    setStatus('submitting');
    setError(null);
    persistState({ status: 'submitting' });
    
    try {
      const endTime = new Date();
      const duration = startTimeRef.current ? calculateDuration(startTimeRef.current, endTime) : 0;
      
      // Calculate score
      const scored = calculateTotalScore(answers);
      const grade = quizConfig.grades.find(g => scored.percentage >= g.min && scored.percentage <= g.max) || quizConfig.grades[quizConfig.grades.length - 1];
      
      const result = {
        participantName,
        attemptId,
        startedAt: startTimeRef.current?.toISOString() || startTime,
        submittedAt: endTime.toISOString(),
        durationSeconds: duration,
        totalScore: scored.totalScore,
        correctAnswers: scored.correctAnswers,
        incorrectAnswers: scored.incorrectAnswers,
        unansweredQuestions: scored.unansweredQuestions,
        percentage: scored.percentage,
        grade,
        questionResults: scored.questionResults,
        answers
      };
      
      // Save to Supabase if configured
      let dbSuccess = false;
      if (isSupabaseConfigured() && isOnline) {
        try {
          dbSuccess = await submitToDatabase(result);
        } catch (e) {
          console.error('Database submission failed:', e);
        }
      }
      
      if (!dbSuccess && isSupabaseConfigured() && !isOnline) {
        queueForRetry(result);
      }
      
      setSubmissionResult(result);
      setStatus('submitted');
      setTimerActive(false);
      persistState({ status: 'submitted' });
      
      if (dbSuccess || !isSupabaseConfigured()) {
        clearQuizData();
      }
      
      isSubmittingRef.current = false;
      return result;
    } catch (e) {
      console.error('Submission error:', e);
      setError('Gagal mengumpulkan ujian. Silakan coba lagi.');
      setStatus('error');
      persistState({ status: 'error' });
      isSubmittingRef.current = false;
      throw e;
    }
  }, [answers, participantName, attemptId, startTime, isOnline, persistState]);
  
  // Submit to database
  const submitToDatabase = async (result) => {
    try {
      const { error: attemptError } = await supabase
        .from(TABLES.QUIZ_ATTEMPTS)
        .update({
          submitted_at: result.submittedAt,
          duration_seconds: result.durationSeconds,
          total_score: result.totalScore,
          correct_answers: result.correctAnswers,
          incorrect_answers: result.incorrectAnswers,
          unanswered_questions: result.unansweredQuestions,
          status: 'completed'
        })
        .eq('id', result.attemptId);
      
      if (attemptError) throw attemptError;
      
      const answerRecords = result.questionResults.map(qr => ({
        attempt_id: result.attemptId,
        question_number: qr.questionId,
        answer: qr.userAnswer,
        is_correct: qr.isCorrect,
        score: qr.pointsEarned
      }));
      
      const { error: answersError } = await supabase
        .from(TABLES.QUIZ_ANSWERS)
        .upsert(answerRecords, { onConflict: 'attempt_id,question_number' });
      
      if (answersError) throw answersError;
      
      return true;
    } catch (e) {
      console.error('Database submission error:', e);
      return false;
    }
  };
  
  // Queue for retry when offline
  const queueForRetry = (result) => {
    try {
      const queue = JSON.parse(localStorage.getItem('marriage_quiz_retry_queue') || '[]');
      queue.push({
        ...result,
        queuedAt: new Date().toISOString(),
        retries: 0
      });
      localStorage.setItem('marriage_quiz_retry_queue', JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to queue for retry:', e);
    }
  };
  
  // Retry submission
  const retrySubmission = useCallback(async () => {
    if (!isOnline) {
      setError('Masih offline. Coba lagi nanti.');
      return false;
    }
    
    try {
      const queue = JSON.parse(localStorage.getItem('marriage_quiz_retry_queue') || '[]');
      if (queue.length === 0) return true;
      
      const item = queue[0];
      const success = await submitToDatabase(item);
      
      if (success) {
        queue.shift();
        localStorage.setItem('marriage_quiz_retry_queue', JSON.stringify(queue));
        clearQuizData();
        return true;
      } else {
        item.retries++;
        localStorage.setItem('marriage_quiz_retry_queue', JSON.stringify(queue));
        return false;
      }
    } catch (e) {
      console.error('Retry failed:', e);
      return false;
    }
  }, [isOnline]);
  
  // Check if has pending retry
  const hasPendingRetry = useCallback(() => {
    try {
      const queue = JSON.parse(localStorage.getItem('marriage_quiz_retry_queue') || '[]');
      return queue.length > 0;
    } catch {
      return false;
    }
  }, []);
  
  // Reset quiz
  const resetQuiz = useCallback(() => {
    clearQuizData();
    setCurrentQuestionIndex(0);
    setAnswers({});
    setParticipantName('');
    setStartTime(null);
    setAttemptId(null);
    setStatus('idle');
    setTimeRemaining(quizConfig.timeLimitMinutes * 60);
    setTimerActive(false);
    setSubmissionResult(null);
    setError(null);
    startTimeRef.current = null;
    isSubmittingRef.current = false;
  }, []);
  
  // Format time remaining
  const formatTimeRemaining = useCallback(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
  }, [timeRemaining]);
  
  // Timer status class
  const getTimerStatus = useCallback(() => {
    if (timeRemaining <= 60) return 'danger';
    if (timeRemaining <= 180) return 'warning';
    return 'normal';
  }, [timeRemaining]);
  
  return {
    currentQuestionIndex,
    currentQuestion,
    answers,
    participantName,
    startTime,
    attemptId,
    status,
    timeRemaining,
    timerActive,
    submissionResult,
    error,
    isOnline,
    progress,
    answeredCount,
    totalQuestions: quizQuestions.length,
    quizConfig,
    formatTimeRemaining,
    getTimerStatus,
    hasPendingRetry,
    handleAnswerChange,
    goToQuestion,
    goToPrevious,
    goToNext,
    startQuiz,
    submitQuiz,
    retrySubmission,
    resetQuiz,
    setError
  };
};

/**
 * Hook for admin dashboard
 */
export const useAdmin = () => {
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    scoreMin: '',
    scoreMax: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  
  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from(TABLES.QUIZ_ATTEMPTS)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      
      if (filters.search) {
        query = query.ilike('participant_name', '%' + filters.search + '%');
      }
      if (filters.scoreMin) {
        query = query.gte('total_score', parseInt(filters.scoreMin));
      }
      if (filters.scoreMax) {
        query = query.lte('total_score', parseInt(filters.scoreMax));
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59');
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data, error: fetchError, count } = await query;
      
      if (fetchError) throw fetchError;
      
      setAttempts(data || []);
      
      const { data: statsData } = await supabase
        .from(TABLES.QUIZ_ATTEMPTS)
        .select('total_score, status');
      
      if (statsData) {
        const completed = statsData.filter(s => s.status === 'completed');
        const scores = completed.map(s => s.total_score);
        setStats({
          totalParticipants: statsData.length,
          totalCompleted: completed.length,
          averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
          highestScore: scores.length > 0 ? Math.max(...scores) : 0,
          lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
          totalCount: count || 0
        });
      }
    } catch (e) {
      console.error('Failed to fetch admin data:', e);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const fetchAttemptDetails = useCallback(async (attemptId) => {
    if (!isSupabaseConfigured()) return null;
    
    try {
      const { data: attempt, error: attemptError } = await supabase
        .from(TABLES.QUIZ_ATTEMPTS)
        .select('*')
        .eq('id', attemptId)
        .single();
      
      if (attemptError) throw attemptError;
      
      const { data: answers, error: answersError } = await supabase
        .from(TABLES.QUIZ_ANSWERS)
        .select('*')
        .eq('attempt_id', attemptId)
        .order('question_number');
      
      if (answersError) throw answersError;
      
      return { ...attempt, answers: answers || [] };
    } catch (e) {
      console.error('Failed to fetch attempt details:', e);
      setError('Gagal memuat detail peserta.');
      return null;
    }
  }, []);
  
  const exportCSV = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    
    try {
      const { data, error } = await supabase
        .from(TABLES.QUIZ_ATTEMPTS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const headers = [
        'Nama Peserta',
        'Nilai',
        'Benar',
        'Salah',
        'Kosong',
        'Durasi',
        'Persentase',
        'Predikat',
        'Mulai',
        'Dikumpulkan'
      ];
      
      const rows = data.map(a => {
        const grade = quizConfig.grades.find(g => a.total_score >= g.min && a.total_score <= g.max);
        return [
          a.participant_name,
          a.total_score,
          a.correct_answers,
          a.incorrect_answers,
          a.unanswered_questions,
          formatDuration(a.duration_seconds || 0),
          Math.round((a.total_score / quizConfig.totalPoints) * 100) + '%',
          grade?.label || '-',
          formatDateTime(a.started_at),
          a.submitted_at ? formatDateTime(a.submitted_at) : '-'
        ];
      });
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(','))
        .join('\n');
      
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'marriage-quiz-export-' + new Date().toISOString().split('T')[0] + '.csv';
      link.click();
      URL.revokeObjectURL(link.href);
      
      return true;
    } catch (e) {
      console.error('Export failed:', e);
      setError('Gagal mengekspor CSV.');
      return false;
    }
  }, []);
  
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      scoreMin: '',
      scoreMax: '',
      dateFrom: '',
      dateTo: '',
      status: ''
    });
    setCurrentPage(1);
  }, []);
  
  return {
    attempts,
    stats,
    loading,
    error,
    filters,
    currentPage,
    pageSize,
    totalPages: Math.ceil((stats?.totalCount || 0) / pageSize),
    selectedAttempt,
    setSelectedAttempt,
    fetchData,
    fetchAttemptDetails,
    exportCSV,
    updateFilters,
    clearFilters,
    setCurrentPage
  };
};

/**
 * Hook for toast notifications
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    
    return id;
  }, []);
  
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  return { toasts, showToast, dismissToast };
};
