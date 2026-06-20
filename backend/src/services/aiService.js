const axios = require("axios");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// Axios instance with 10s timeout
const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: 10000,
});

exports.checkDuplicate = async (userData, existingParticipants) => {
  let attempts = 0;
  const maxRetries = 2;

  while (attempts <= maxRetries) {
    try {
      const payload = {
        name: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "0000000000",
        college: userData.institution || "Unknown",
        skills: Array.isArray(userData.skills) ? userData.skills : (typeof userData.skills === 'string' ? userData.skills.split(',') : [])
      };
      
      const response = await aiClient.post("/api/duplicate-check", payload);
      return response.data;
    } catch (err) {
      attempts++;
      if (attempts > maxRetries) {
        console.error("AI Service completely failed after retries:", err.message);
        throw new Error("AI_SERVICE_UNAVAILABLE");
      }
      console.warn(`AI Service failed, retrying (${attempts}/${maxRetries})...`);
    }
  }
};

exports.formTeams = async (participants, config) => {
  try {
    const response = await aiClient.post("/api/team-form", {
      participants,
      config,
    });
    return response.data;
  } catch (err) {
    console.error("AI Team formation failed:", err.message);
    throw new Error("Failed to form teams via AI Service");
  }
};

exports.assignReviewers = async (judges, projects, config) => {
  try {
    const payload = { judges, projects, ...config };
    const response = await aiClient.post("/api/reviewer-assign", payload);
    return response.data; // { assignments: [{ projectId, reviewerIds: [] }] }
  } catch (err) {
    console.error("AI Reviewer assignment failed:", err.message);
    throw new Error("Failed to assign reviewers via AI Service");
  }
};

exports.detectBias = async (feedbackText, scores, rubric) => {
  try {
    const response = await aiClient.post("/api/bias-detect", {
      feedbackText,
      scores,
      rubric,
    });
    return response.data; // { biasDetected: boolean, flags: string[], confidence: number }
  } catch (err) {
    console.warn("AI Bias Detection failed, bypassing check:", err.message);
    return { biasDetected: false, flags: [], confidence: 0 };
  }
};

exports.getReviewSuggestions = async (projectData, rubric) => {
  try {
    const response = await aiClient.post("/api/review-agent", {
      projectData,
      rubric,
    });
    return response.data; // { suggestedScores: { criteria: score }, rationale: string }
  } catch (err) {
    console.warn("AI Review Agent failed:", err.message);
    return null;
  }
};

exports.checkHealth = async () => {
  try {
    const response = await aiClient.get("/health");
    return response.data;
  } catch (err) {
    return { status: "down", error: err.message };
  }
};

exports.extractTextFromResume = async (fileBuffer, mimeType) => {
  try {
    if (mimeType === "application/pdf") {
      const data = await pdf(fileBuffer);
      return data.text;
    } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    }
    // Generic fallback for plain text or doc types
    return fileBuffer.toString("utf8");
  } catch (err) {
    console.error("Failed to extract text from resume:", err);
    return ""; // Proceed with empty text if parsing fails
  }
};
