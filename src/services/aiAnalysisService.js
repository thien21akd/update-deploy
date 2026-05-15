import { PROBLEM_TOPIC_MAP } from "../data/problemTopicMapping";

const API_BASE = "/api";

// ============================================================
// HELPERS
// ============================================================

function validateSubmission(submission) {
  const required = ["probId", "pass", "time"];

  for (const field of required) {
    if (!(field in submission)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

function parseTimeToSeconds(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return 0;

  const parts = timeStr.split(":");
  if (parts.length !== 2) return 0;

  const mins = parseInt(parts[0], 10);
  const secs = parseInt(parts[1], 10);

  return isNaN(mins) || isNaN(secs) ? 0 : mins * 60 + secs;
}

// ============================================================
// FEATURE RESOLVERS
// ============================================================

function getTopicsForProblem(problemId, catalogProblems = []) {
  const mapped = PROBLEM_TOPIC_MAP?.[String(problemId)];
  if (mapped?.length) return mapped;

  const problem = catalogProblems.find(
    p => String(p.id) === String(problemId)
  );

  if (problem?.topics?.length) return problem.topics;

  return ["unknown"];
}

function getDifficultyForProblem(problemId, catalogProblems = []) {
  const problem = catalogProblems.find(
    p => String(p.id) === String(problemId)
  );

  return problem?.diff?.toLowerCase() || "easy";
}

// ============================================================
// TRANSFORM
// ============================================================

function transformSubmission(sub, catalogProblems = []) {
  validateSubmission(sub);

  const topics = getTopicsForProblem(sub.probId, catalogProblems);
  const difficulty = getDifficultyForProblem(sub.probId, catalogProblems);

  return {
    userId: sub.userId || "user",
    problemId: String(sub.probId),
    topic: topics[0],
    difficulty,
    result: sub.pass ? "AC" : "WA",
    timeSpent: parseTimeToSeconds(sub.time),
    wrongCount: sub.wrongCount || 0
  };
}

// ============================================================
// API CALL
// ============================================================

export async function analyzeWeakness(submissions, catalogProblems = []) {
  const payload = {
    submissions: submissions.map(sub =>
      transformSubmission(sub, catalogProblems)
    )
  };

 const res = await fetch(`${API_BASE}/predict`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
// ============================================================
// FORMAT SUBMISSIONS FOR MODEL
// ============================================================

/**
 * Convert React submissions to FastAPI model input format
 *
 * React format:
 * {
 *   id: string,
 *   probId: number | string,
 *   pass: boolean,
 *   lang: string,
 *   time: "MM:SS",
 *   createdAt: timestamp
 * }
 *
 * Model format (one submission per topic):
 * {
 *   userId: string,
 *   problemId: string,
 *   topic: string,
 *   difficulty: string,
 *   result: "AC" | "WA" | "TLE" | "RE",
 *   timeSpent: integer (seconds),
 *   wrongCount: integer
 * }
 */
export function formatSubmissionsForModel(submissions, catalogProblems, userId) {
  if (!Array.isArray(submissions) || submissions.length === 0) {
    throw new Error("Submissions array is empty");
  }

  if (!userId) {
    throw new Error("userId is required");
  }

  if (!Array.isArray(catalogProblems)) {
    throw new Error("catalogProblems must be an array");
  }

  const modelSubmissions = [];

  for (const submission of submissions) {
    try {
      validateSubmission(submission);

      const problemId = submission.probId;
      const topics = getTopicsForProblem(problemId, catalogProblems);
      const difficulty = getDifficultyForProblem(problemId, catalogProblems);
      const timeSpent = parseTimeToSeconds(submission.time);

      // For each topic the problem covers, create a submission record
      for (const topic of topics) {
        modelSubmissions.push({
          userId: String(userId),
          problemId: String(problemId),
          topic: String(topic).toLowerCase().trim(),
          difficulty: String(difficulty).toLowerCase(),
          result: submission.pass ? "AC" : "WA",
          timeSpent: Math.max(0, timeSpent),
          wrongCount: submission.wrongCount || 0,
        });
      }
    } catch (error) {
      console.error(`Error processing submission ${submission.id}:`, error);
      // Skip this submission and continue
    }
  }

  if (modelSubmissions.length === 0) {
    throw new Error(
      "No valid submissions after transformation. Check your data format."
    );
  }

  return modelSubmissions;
}

// ============================================================
// CALL AI BACKEND
// ============================================================

/**
 * Call FastAPI backend to get predictions
 * @param {Array} modelSubmissions - list of formatted submissions
 * @returns {Promise<Object>} backend result with top5 and all weaknesses
 */
export async function callAIBackend(modelSubmissions) {
  if (!Array.isArray(modelSubmissions) || modelSubmissions.length === 0) {
    throw new Error("No submissions to send to backend");
  }

  const requestPayload = { submissions: modelSubmissions };

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status;

      if (status === 503) {
        throw new Error(
          "AI model not loaded. Make sure to train and save rf_multioutput.pkl"
        );
      }

      if (status === 400) {
        throw new Error(`Invalid request format: ${errorText}`);
      }

      throw new Error(`API error ${status}: ${errorText}`);
    }

    const result = await response.json();

    // Validate response structure
    if (!result.top5 || !Array.isArray(result.top5)) {
      throw new Error("Invalid response format: missing top5 field");
    }

    if (!result.all || typeof result.all !== "object") {
      throw new Error("Invalid response format: missing all field");
    }

    return result;
  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      throw new Error(
        `Cannot connect to AI backend at ${API_BASE}. Make sure FastAPI is running: 'python -m uvicorn api:app --reload'`
      );
    }
    throw error;
  }
}

// ============================================================
// FORMAT MODEL OUTPUT FOR UI
// ============================================================

/**
 * Convert FastAPI model output to UI-friendly format
 *
 * Model response:
 * {
 *   threshold: float,
 *   top5: [{tag, prob, weak}],
 *   all: {tag: {prob, weak}}
 * }
 *
 * UI format:
 * {
 *   skillScore: number,
 *   avgTime: number,
 *   acProbability: number,
 *   predictedLevel: number,
 *   topics: [{label, value, color}],
 *   suggestions: [{id, name, reason}],
 *   feedback: [{tone, title, body}],
 *   modelVersion: string
 * }
 */
export function formatModelOutputForUI(
  modelPrediction,
  solvedProblems,
  catalogProblems,
  problemStatuses
) {
  if (!modelPrediction || !modelPrediction.all) {
    throw new Error("Invalid model prediction format");
  }

  const all = modelPrediction.all || {};
  const top5 = modelPrediction.top5 || [];

  // ============================================================
  // CALCULATE METRICS
  // ============================================================

  // Count weaknesses (tags where weak=1)
  const weaknessCount = Object.values(all).filter(
    (x) => x && x.weak === 1
  ).length;

  // Skill score: based on weakness count
  // Formula: high weaknesses = lower score
  const skillScore = Math.max(30, Math.min(100, 100 - weaknessCount * 6));

  // Average time estimate (in minutes)
  // Based on weakness count and baseline difficulty
  const avgTime = Math.max(12, 70 - weaknessCount * 4);

  // AC (Accepted) probability estimate
  // Users with fewer weaknesses have higher probability of solving new problems
  const acProbability = Math.max(15, Math.min(100, 100 - weaknessCount * 7));

  // Predicted level (1-15 scale)
  // Rough correlation: fewer weaknesses = higher level
  const predictedLevel = Math.max(1, Math.min(15, Math.round(skillScore / 7)));

  // ============================================================
  // BUILD TOPIC CHART DATA
  // ============================================================

  // Use top5 for chart - strength = 1 - weakness probability
  const topics = top5
    .filter((t) => t && t.tag)
    .map((t) => ({
      label: t.tag,
      // Inverted: high prob weak = low value (0-50 range)
      value: Math.round(Math.max(0, 100 - t.prob * 100) / 2),
      color: "var(--indigo)",
      weakness_prob: t.prob,
    }));

  // ============================================================
  // BUILD RECOMMENDATIONS
  // ============================================================

  const suggestions = [];

  // Get solved problem IDs
  const solvedProblemIds = new Set();
  if (problemStatuses && typeof problemStatuses === "object") {
    Object.entries(problemStatuses).forEach(([probId, status]) => {
      if (status === "done") {
        solvedProblemIds.add(Number(probId));
      }
    });
  }

  // For each weak topic, find unsolved problems
  for (const weak of top5.slice(0, 5)) {
    const targetTag = weak.tag;

    // Find problems matching this topic that are NOT solved
    const topicProblems = catalogProblems
      .filter((p) => {
        const pId = Number(p.id);
        // Check if problem has this topic in its mapping
        const problemTopics = PROBLEM_TOPIC_MAP[String(p.id)] || [];
        return (
          problemTopics.includes(targetTag) &&
          !solvedProblemIds.has(pId)
        );
      })
      .sort((a, b) => {
        // Prefer easier problems for weak topics
        const diffMap = { easy: 0, medium: 1, hard: 2 };
        const diffA = diffMap[a.diff] || 1;
        const diffB = diffMap[b.diff] || 1;
        return diffA - diffB;
      });

    if (topicProblems.length > 0) {
      const pick = topicProblems[0];
      suggestions.push({
        id: pick.id,
        name: pick.name || `Problem ${pick.id}`,
        difficulty: pick.diff || "?",
        reason: `Luyện chủ đề "${targetTag}" (yếu ${(weak.prob * 100).toFixed(0)}%)`,
        topic: targetTag,
      });
    }
  }

  // Limit to 3-5 suggestions
  const finalSuggestions = suggestions.slice(0, 4);

  // ============================================================
  // BUILD FEEDBACK MESSAGES
  // ============================================================

  const feedback = [];

  // Strength assessment
  if (weaknessCount <= 3) {
    feedback.push({
      tone: "positive",
      title: "Điểm mạnh 💪",
      body: `Bạn có nền tảng khá tốt! Hiện tại yếu ở ${weaknessCount} chủ đề thôi.`,
    });
  } else if (weaknessCount <= 8) {
    feedback.push({
      tone: "warn",
      title: "Cần cải thiện ⚠️",
      body: `Bạn đang yếu ở khoảng ${weaknessCount} chủ đề. Nên tập trung top 3 yếu nhất trước.`,
    });
  } else {
    feedback.push({
      tone: "warn",
      title: "Yếu khá nhiều mảng 🚨",
      body: `Hệ thống phát hiện ${weaknessCount} chủ đề yếu. Kiên trì luyện tập từng chủ đề một!`,
    });
  }

  // Top weaknesses
  if (top5.length > 0) {
    const topTags = top5
      .slice(0, 3)
      .map((x) => `"${x.tag}"`)
      .join(", ");

    feedback.push({
      tone: "info",
      title: "Top 3 yếu nhất 📊",
      body: `Các tag cần ưu tiên: ${topTags}`,
    });
  }

  // Recommendations
  if (finalSuggestions.length > 0) {
    feedback.push({
      tone: "info",
      title: "Gợi ý luyện tập 🎯",
      body: `${finalSuggestions.length} bài được gợi ý để cải thiện các điểm yếu.`,
    });
  } else {
    feedback.push({
      tone: "info",
      title: "Tiếp tục luyện tập 📚",
      body: `Hãy luyện thêm các bài về chủ đề yếu để nâng cao kỹ năng.`,
    });
  }

  // ============================================================
  // RETURN FORMATTED RESULT
  // ============================================================

  return {
    skillScore,
    avgTime,
    acProbability,
    predictedLevel,
    topics,
    suggestions: finalSuggestions,
    feedback,
    modelVersion: "RF v2 (MultiOutput + Probability Threshold)",
    metadata: {
      weaknessCount,
      topicsAnalyzed: Object.keys(all).length,
      solvedCount: solvedProblems,
      threshold: modelPrediction.threshold,
    },
  };
}

// ============================================================
// MAIN ANALYSIS FUNCTION
// ============================================================

/**
 * Main function to analyze user capability using ML model
 * Coordinates the full pipeline: format -> predict -> format UI
 */
export async function analyzeUserCapability(
  submissions,
  userId,
  catalogProblems,
  problemStatuses
) {
  try {
    // ============================================================
    // STEP 1: VALIDATE INPUTS
    // ============================================================

    if (!Array.isArray(submissions)) {
      throw new Error("submissions must be an array");
    }

    if (submissions.length === 0) {
      throw new Error("No submissions to analyze");
    }

    if (!userId) {
      throw new Error("userId is required");
    }

    if (!Array.isArray(catalogProblems) || catalogProblems.length === 0) {
      throw new Error("catalogProblems array is required and must not be empty");
    }

    // ============================================================
    // STEP 2: FORMAT SUBMISSIONS FOR MODEL
    // ============================================================

    const modelSubmissions = formatSubmissionsForModel(
      submissions,
      catalogProblems,
      userId
    );

    console.log(
      `📤 Formatted ${modelSubmissions.length} submission records for model`
    );

    // ============================================================
    // STEP 3: CALL AI BACKEND
    // ============================================================

    console.log("🤖 Calling AI backend for predictions...");
    const prediction = await callAIBackend(modelSubmissions);

    console.log(`✅ Backend returned predictions for ${Object.keys(prediction.all).length} topics`);

    // ============================================================
    // STEP 4: FORMAT OUTPUT FOR UI
    // ============================================================

    const solvedProblems = submissions.filter((s) => s.pass).length;

    const result = formatModelOutputForUI(
      prediction,
      solvedProblems,
      catalogProblems,
      problemStatuses
    );

    console.log("📊 Analysis complete:", {
      skillScore: result.skillScore,
      weaknesses: result.metadata.weaknessCount,
    });

    // ============================================================
    // STEP 5: RETURN SUCCESS RESPONSE
    // ============================================================

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Analysis error:", error);

    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================
// HEALTH CHECK
// ============================================================

/**
 * Check if backend is alive and model is loaded
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) {
      return {
        online: false,
        message: `Backend returned status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      online: true,
      modelLoaded: data.model_loaded,
      numFeatures: data.num_features,
      numLabels: data.num_labels,
      threshold: data.threshold,
    };
  } catch (error) {
    return {
      online: false,
      message: `Cannot reach backend: ${error.message}`,
    };
  }
}