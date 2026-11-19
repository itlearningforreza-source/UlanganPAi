-- Migration: Create quiz_attempts and quiz_answers tables
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  total_score INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  incorrect_answers INTEGER NOT NULL DEFAULT 0,
  unanswered_questions INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'submitted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create quiz_answers table
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  answer JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_participant_name ON quiz_attempts(participant_name);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON quiz_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_number ON quiz_answers(question_number);

-- Enable Row Level Security (RLS)
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert their own quiz attempts
CREATE POLICY "Allow anonymous insert quiz_attempts" ON quiz_attempts
  FOR INSERT TO anon
  WITH CHECK (true);

-- Policy: Allow anonymous users to update their own quiz attempts (for submission)
CREATE POLICY "Allow anonymous update quiz_attempts" ON quiz_attempts
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anonymous users to insert quiz answers
CREATE POLICY "Allow anonymous insert quiz_answers" ON quiz_answers
  FOR INSERT TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated admin users to read all quiz attempts
CREATE POLICY "Allow admin read quiz_attempts" ON quiz_attempts
  FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated admin users to read all quiz answers
CREATE POLICY "Allow admin read quiz_answers" ON quiz_answers
  FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated admin users to update quiz attempts (for admin operations)
CREATE POLICY "Allow admin update quiz_attempts" ON quiz_attempts
  FOR UPDATE TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Function to calculate quiz score server-side
CREATE OR REPLACE FUNCTION calculate_quiz_score(
  p_attempt_id UUID,
  p_answers JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_score NUMERIC := 0;
  v_correct_count INTEGER := 0;
  v_incorrect_count INTEGER := 0;
  v_unanswered_count INTEGER := 0;
  v_question_record RECORD;
  v_user_answer JSONB;
  v_is_correct BOOLEAN;
  v_points NUMERIC;
BEGIN
  -- Question configurations with correct answers and points
  -- This mirrors the client-side configuration for server-side validation
  FOR v_question_record IN 
    SELECT * FROM jsonb_array_elements(p_answers) AS q
  LOOP
    v_user_answer := v_question_record->>'answer';
    v_points := 0;
    v_is_correct := FALSE;
    
    -- Question 1: Single choice, 5 points
    IF (v_question_record->>'questionId')::INT = 1 THEN
      v_points := 5;
      v_is_correct := (v_user_answer = '"B"');
    -- Question 2: Single choice, 5 points
    ELSIF (v_question_record->>'questionId')::INT = 2 THEN
      v_points := 5;
      v_is_correct := (v_user_answer = '"B"');
    -- Question 3: Single choice, 5 points
    ELSIF (v_question_record->>'questionId')::INT = 3 THEN
      v_points := 5;
      v_is_correct := (v_user_answer = '"B"');
    -- Question 4: Single choice, 7 points
    ELSIF (v_question_record->>'questionId')::INT = 4 THEN
      v_points := 7;
      v_is_correct := (v_user_answer = '"B"');
    -- Question 5: Single choice, 7 points
    ELSIF (v_question_record->>'questionId')::INT = 5 THEN
      v_points := 7;
      v_is_correct := (v_user_answer = '"A"');
    -- Question 6: Single choice, 7 points
    ELSIF (v_question_record->>'questionId')::INT = 6 THEN
      v_points := 7;
      v_is_correct := (v_user_answer = '"B"');
    -- Question 7: Multiple choice, 10 points (exact match)
    ELSIF (v_question_record->>'questionId')::INT = 7 THEN
      v_points := 10;
      v_is_correct := (v_user_answer = '["A","B","C","E","F"]' OR v_user_answer = '["A", "B", "C", "E", "F"]');
    -- Question 8: Essay, 15 points (keyword-based)
    ELSIF (v_question_record->>'questionId')::INT = 8 THEN
      v_points := 15;
      -- Check for keywords in the answer
      v_is_correct := (
        v_user_answer ILIKE '%biologis%' AND
        v_user_answer ILIKE '%ibadah%' AND
        v_user_answer ILIKE '%tanggung jawab%' AND
        (v_user_answer ILIKE '%sakinah%' OR v_user_answer ILIKE '%ketenteraman%') AND
        (v_user_answer ILIKE '%keturunan%' OR v_user_answer ILIKE '%generasi%')
      );
    -- Question 9: Essay, 20 points (argument quality)
    ELSIF (v_question_record->>'questionId')::INT = 9 THEN
      v_points := 20;
      -- Check for at least 4 cause-effect relationships
      v_is_correct := (
        (v_user_answer ILIKE '%ketaatan%' OR v_user_answer ILIKE '%allah%') AND
        (v_user_answer ILIKE '%sunah%' OR v_user_answer ILIKE '%rasul%') AND
        (v_user_answer ILIKE '%kehormatan%' OR v_user_answer ILIKE '%zina%') AND
        (v_user_answer ILIKE '%sakinah%' OR v_user_answer ILIKE '%keluarga%') AND
        (v_user_answer ILIKE '%keturunan%' OR v_user_answer ILIKE '%generasi%') AND
        (v_user_answer ILIKE '%silaturahmi%' OR v_user_answer ILIKE '%kasih sayang%')
      );
    -- Question 10: Impossible, 14 points (epistemological trap)
    ELSIF (v_question_record->>'questionId')::INT = 10 THEN
      v_points := 14;
      v_is_correct := (
        v_user_answer ILIKE '%tidak ada informasi%' OR
        v_user_answer ILIKE '%tidak dapat dijawab%' OR
        v_user_answer ILIKE '%informasi tidak tersedia%' OR
        v_user_answer ILIKE '%jebakan epistemologis%' OR
        v_user_answer ILIKE '%materi yang tersedia%'
      );
    END IF;
    
    IF v_user_answer IS NULL OR v_user_answer = '""' OR v_user_answer = '[]' THEN
      v_unanswered_count := v_unanswered_count + 1;
      v_points := 0;
      v_is_correct := FALSE;
    ELSIF v_is_correct THEN
      v_correct_count := v_correct_count + 1;
      v_total_score := v_total_score + v_points;
    ELSE
      v_incorrect_count := v_incorrect_count + 1;
    END IF;
    
    -- Insert answer record
    INSERT INTO quiz_answers (attempt_id, question_number, answer, is_correct, score)
    VALUES (p_attempt_id, (v_question_record->>'questionId')::INT, v_user_answer, v_is_correct, v_points)
    ON CONFLICT (attempt_id, question_number) DO UPDATE SET
      answer = EXCLUDED.answer,
      is_correct = EXCLUDED.is_correct,
      score = EXCLUDED.score;
  END LOOP;
  
  RETURN jsonb_build_object(
    'total_score', v_total_score,
    'correct_answers', v_correct_count,
    'incorrect_answers', v_incorrect_count,
    'unanswered_questions', v_unanswered_count
  );
END;
$$;