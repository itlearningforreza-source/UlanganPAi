import { quizQuestions, quizConfig } from '../data/quizData';

/**
 * Quiz scoring utilities
 * Handles client-side scoring for immediate feedback
 * Server-side validation happens in Supabase Edge Function
 */

// Grade thresholds
export const getGrade = (score) => {
  return quizConfig.grades.find(g => score >= g.min && score <= g.max) || quizConfig.grades[quizConfig.grades.length - 1];
};

// Format duration in seconds to human readable
export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

// Format timestamp to Indonesian locale
export const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  });
};

// Format date only
export const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  });
};

// Score a single answer
export const scoreAnswer = (question, userAnswer) => {
  const { type, correctAnswer, points } = question;
  
  if (!userAnswer || userAnswer === '' || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
    return { isCorrect: false, pointsEarned: 0, maxPoints: points };
  }
  
  if (type === 'single') {
    const isCorrect = userAnswer === correctAnswer;
    return { isCorrect, pointsEarned: isCorrect ? points : 0, maxPoints: points };
  }
  
  if (type === 'multiple') {
    // Exact match required for multiple choice
    const userArr = Array.isArray(userAnswer) ? [...userAnswer].sort() : [];
    const correctArr = Array.isArray(correctAnswer) ? [...correctAnswer].sort() : [];
    const isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr);
    return { isCorrect, pointsEarned: isCorrect ? points : 0, maxPoints: points };
  }
  
  if (type === 'essay') {
    // Keyword-based scoring for essay questions
    const answerText = String(userAnswer).toLowerCase();
    let isCorrect = false;
    
    if (question.id === 8) {
      // Question 8: Biological needs, ibadah, responsibility, sakinah, offspring, silaturahmi
      const keywords = [
        'biologis',
        'ibadah',
        'tanggung jawab',
        'sakinah',
        'keturunan',
        'generasi',
        'silaturahmi',
        'kasih sayang',
        'ketenteraman'
      ];
      const matchedKeywords = keywords.filter(k => answerText.includes(k));
      isCorrect = matchedKeywords.length >= 4; // At least 4 keywords
    } else if (question.id === 9) {
      // Question 9: Cause-effect relationships
      const concepts = [
        'ketaatan',
        'allah',
        'sunah',
        'rasul',
        'kehormatan',
        'zina',
        'sakinah',
        'keluarga',
        'keturunan',
        'generasi',
        'silaturahmi',
        'kasih sayang',
        'mawaddah',
        'rahmah',
        'sebab akibat'
      ];
      const matchedConcepts = concepts.filter(c => answerText.includes(c));
      isCorrect = matchedConcepts.length >= 6; // At least 6 concepts showing relationships
    } else if (question.id === 10) {
      // Question 10: Impossible challenge - must recognize information not available
      const recognitionKeywords = [
        'tidak ada informasi',
        'tidak dapat dijawab',
        'informasi tidak tersedia',
        'jebakan epistemologis',
        'materi yang tersedia',
        'tidak disebutkan',
        'tidak ada dalam materi'
      ];
      isCorrect = recognitionKeywords.some(k => answerText.includes(k));
    }
    
    return { isCorrect, pointsEarned: isCorrect ? points : 0, maxPoints: points };
  }
  
  return { isCorrect: false, pointsEarned: 0, maxPoints: points };
};

// Calculate total score from all answers
export const calculateTotalScore = (answers) => {
  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  const questionResults = [];
  
  quizQuestions.forEach(question => {
    const userAnswer = answers[question.id];
    const result = scoreAnswer(question, userAnswer);
    
    if (!userAnswer || userAnswer === '' || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
      unansweredCount++;
    } else if (result.isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }
    
    totalScore += result.pointsEarned;
    
    questionResults.push({
      questionId: question.id,
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: result.isCorrect,
      pointsEarned: result.pointsEarned,
      maxPoints: result.maxPoints,
      explanation: question.explanation
    });
  });
  
  return {
    totalScore,
    correctAnswers: correctCount,
    incorrectAnswers: incorrectCount,
    unansweredQuestions: unansweredCount,
    percentage: Math.round((totalScore / quizConfig.totalPoints) * 100),
    questionResults
  };
};

// LocalStorage keys
export const STORAGE_KEYS = {
  QUIZ_STATE: 'marriage_quiz_state',
  QUIZ_ANSWERS: 'marriage_quiz_answers',
  QUIZ_START_TIME: 'marriage_quiz_start_time',
  QUIZ_ATTEMPT_ID: 'marriage_quiz_attempt_id',
  PARTICIPANT_NAME: 'marriage_quiz_participant_name'
};

// Save quiz state to localStorage
export const saveQuizState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_STATE, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save quiz state:', e);
  }
};

// Load quiz state from localStorage
export const loadQuizState = () => {
  try {
    const state = localStorage.getItem(STORAGE_KEYS.QUIZ_STATE);
    return state ? JSON.parse(state) : null;
  } catch (e) {
    console.error('Failed to load quiz state:', e);
    return null;
  }
};

// Save answers to localStorage
export const saveAnswers = (answers) => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_ANSWERS, JSON.stringify(answers));
  } catch (e) {
    console.error('Failed to save answers:', e);
  }
};

// Load answers from localStorage
export const loadAnswers = () => {
  try {
    const answers = localStorage.getItem(STORAGE_KEYS.QUIZ_ANSWERS);
    return answers ? JSON.parse(answers) : {};
  } catch (e) {
    console.error('Failed to load answers:', e);
    return {};
  }
};

// Clear all quiz data from localStorage
export const clearQuizData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Failed to clear ${key}:`, e);
    }
  });
};

// Generate attempt ID
export const generateAttemptId = () => {
  return 'attempt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Validate participant name
export const validateParticipantName = (name) => {
  const trimmed = name?.trim();
  if (!trimmed) return { valid: false, error: 'Nama panggilan wajib diisi' };
  if (trimmed.length < 2) return { valid: false, error: 'Nama minimal 2 karakter' };
  if (trimmed.length > 50) return { valid: false, error: 'Nama maksimal 50 karakter' };
  if (!/^[a-zA-Z0-9s-.']+$/.test(trimmed)) {
    return { valid: false, error: 'Nama hanya boleh mengandung huruf, angka, spasi, titik, strip, dan apostrof' };
  }
  return { valid: true, name: trimmed };
};

// Debounce function
export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Throttle function
export const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Deep clone
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if online
export const isOnline = () => {
  return navigator.onLine;
};

// Format number with Indonesian locale
export const formatNumber = (num) => {
  return new Intl.NumberFormat('id-ID').format(num);
};