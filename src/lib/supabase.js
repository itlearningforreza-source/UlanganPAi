import { createClient } from '@supabase/supabase-js';

// Supabase configuration - uses environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'marriage-knowledge-challenge'
    }
  }
});

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Database table names
export const TABLES = {
  QUIZ_ATTEMPTS: 'quiz_attempts',
  QUIZ_ANSWERS: 'quiz_answers'
};

// Generate UUID v4
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Format date to ISO string with timezone
export const formatISODate = (date = new Date()) => {
  return date.toISOString();
};

// Calculate duration in seconds between two dates
export const calculateDuration = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.floor((endDate - startDate) / 1000);
};