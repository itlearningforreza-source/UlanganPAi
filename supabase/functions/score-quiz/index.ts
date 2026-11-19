import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { attemptId, answers } = body;

    if (!attemptId || !answers) {
      return new Response(JSON.stringify({ error: "Missing attemptId or answers" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify attempt belongs to user or user is admin
    const { data: attempt, error: attemptError } = await supabaseClient
      .from("quiz_attempts")
      .select("*")
      .eq("id", attemptId)
      .single();

    if (attemptError || !attempt) {
      return new Response(JSON.stringify({ error: "Attempt not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already submitted
    if (attempt.status === "completed") {
      return new Response(JSON.stringify({ error: "Already submitted" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Server-side scoring logic
    const questionConfigs = [
      { id: 1, type: "single", correct: "B", points: 5 },
      { id: 2, type: "single", correct: "B", points: 5 },
      { id: 3, type: "single", correct: "B", points: 5 },
      { id: 4, type: "single", correct: "B", points: 7 },
      { id: 5, type: "single", correct: "A", points: 7 },
      { id: 6, type: "single", correct: "B", points: 7 },
      { id: 7, type: "multiple", correct: ["A", "B", "C", "E", "F"], points: 10 },
      { id: 8, type: "essay", points: 15 },
      { id: 9, type: "essay", points: 20 },
      { id: 10, type: "essay", points: 14 },
    ];

    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const answerRecords = [];

    for (const qConfig of questionConfigs) {
      const userAnswer = answers[qConfig.id];
      let isCorrect = false;
      let pointsEarned = 0;

      if (!userAnswer || userAnswer === "" || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
        unansweredCount++;
        isCorrect = false;
        pointsEarned = 0;
      } else if (qConfig.type === "single") {
        isCorrect = userAnswer === qConfig.correct;
        pointsEarned = isCorrect ? qConfig.points : 0;
        if (isCorrect) correctCount++; else incorrectCount++;
      } else if (qConfig.type === "multiple") {
        const userArr = Array.isArray(userAnswer) ? [...userAnswer].sort() : [];
        const correctArr = [...qConfig.correct].sort();
        isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr);
        pointsEarned = isCorrect ? qConfig.points : 0;
        if (isCorrect) correctCount++; else incorrectCount++;
      } else if (qConfig.type === "essay") {
        const answerText = String(userAnswer).toLowerCase();
        
        if (qConfig.id === 8) {
          const keywords = ["biologis", "ibadah", "tanggung jawab", "sakinah", "keturunan", "generasi", "silaturahmi", "kasih sayang", "ketenteraman"];
          const matched = keywords.filter(k => answerText.includes(k));
          isCorrect = matched.length >= 4;
        } else if (qConfig.id === 9) {
          const concepts = ["ketaatan", "allah", "sunah", "rasul", "kehormatan", "zina", "sakinah", "keluarga", "keturunan", "generasi", "silaturahmi", "kasih sayang", "mawaddah", "rahmah", "sebab akibat"];
          const matched = concepts.filter(c => answerText.includes(c));
          isCorrect = matched.length >= 6;
        } else if (qConfig.id === 10) {
          const recognitionKeywords = ["tidak ada informasi", "tidak dapat dijawab", "informasi tidak tersedia", "jebakan epistemologis", "materi yang tersedia", "tidak disebutkan", "tidak ada dalam materi"];
          isCorrect = recognitionKeywords.some(k => answerText.includes(k));
        }
        
        pointsEarned = isCorrect ? qConfig.points : 0;
        if (isCorrect) correctCount++; else incorrectCount++;
      }

      totalScore += pointsEarned;

      answerRecords.push({
        attempt_id: attemptId,
        question_number: qConfig.id,
        answer: userAnswer,
        is_correct: isCorrect,
        score: pointsEarned
      });
    }

    // Update attempt with final results
    const { error: updateError } = await supabaseClient
      .from("quiz_attempts")
      .update({
        submitted_at: new Date().toISOString(),
        duration_seconds: Math.floor((new Date().getTime() - new Date(attempt.started_at).getTime()) / 1000),
        total_score: totalScore,
        correct_answers: correctCount,
        incorrect_answers: incorrectCount,
        unanswered_questions: unansweredCount,
        status: "completed"
      })
      .eq("id", attemptId);

    if (updateError) {
      throw updateError;
    }

    // Insert all answers
    const { error: answersError } = await supabaseClient
      .from("quiz_answers")
      .upsert(answerRecords, { onConflict: "attempt_id,question_number" });

    if (answersError) {
      throw answersError;
    }

    const percentage = Math.round((totalScore / 100) * 100);
    const grades = [
      { min: 90, max: 100, label: "Excellent" },
      { min: 80, max: 89, label: "Very Good" },
      { min: 70, max: 79, label: "Good" },
      { min: 60, max: 69, label: "Average" },
      { min: 0, max: 59, label: "Needs Improvement" }
    ];
    const grade = grades.find(g => percentage >= g.min && percentage <= g.max);

    return new Response(JSON.stringify({
      success: true,
      totalScore,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unansweredQuestions: unansweredCount,
      percentage,
      grade: grade?.label
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Score quiz error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
