const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "have", "has",
  "will", "your", "you", "are", "but", "not", "can", "our"
]);

// Normalize text for comparison
function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Extract meaningful words from text
function wordsFrom(text) {
  return normalize(text)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// Check if a phrase/skill is present in text
function phrasePresent(phrase, text) {
  const p = normalize(phrase).trim();
  const t = normalize(text);
  if (!p) return false;

  const isSingle = p.split(/\s+/).length === 1;
  if (isSingle) {
    const esc = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("\\b" + esc + "\\b", "i");
    return re.test(t);
  }
  return t.includes(p);
}

// Calculate basic keyword overlap score
function calculateKeywordScore(resumeText, jobDescription) {
  const jobWords = [...new Set(wordsFrom(jobDescription))];
  const resumeWords = [...new Set(wordsFrom(resumeText))];

  if (jobWords.length === 0) return 0;

  const matched = jobWords.filter((w) => resumeWords.includes(w));
  return matched.length / jobWords.length;
}

// Main matching function with Gemini AI integration
async function matchResume(resume, job) {
  const resumeText = normalize(resume || "");
  const jobDescription = job?.description ? String(job.description) : "";
  const jobTitle = job?.title ? String(job.title) : "";
  const declaredSkills = Array.isArray(job.skills) ? job.skills : [];

  // Validation
  if (!resumeText || resumeText.length < 20) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: declaredSkills.slice(0, 8),
      isMatch: false,
      rejectionReason: "Resume text is too short or empty",
      aiSummary: "Unable to analyze - insufficient resume content",
      confidenceLevel: "low",
    };
  }

  if (declaredSkills.length === 0) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: [],
      isMatch: false,
      rejectionReason: "Job must have declared skills for matching",
      aiSummary: "Job posting lacks required skills list",
      confidenceLevel: "low",
    };
  }

  // Step 1: Basic skill matching
  const matchedSkills = [];
  const missingSkills = [];

  declaredSkills.forEach((skill) => {
    if (!skill) return;
    if (phrasePresent(skill, resumeText)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const skillRatio = declaredSkills.length > 0
    ? matchedSkills.length / declaredSkills.length
    : 0;

  // Step 2: Keyword overlap analysis
  const keywordScore = calculateKeywordScore(resumeText, jobDescription);

  // Step 3: Use Gemini AI for intelligent analysis
  let aiAnalysis = null;
  let aiScore = 0;
  let aiSummary = "";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });



    const prompt = `You are an expert recruiter analyzing candidate-job fit.

Job Title: ${jobTitle}
Required Skills: ${declaredSkills.join(", ")}
Job Description: ${jobDescription.substring(0, 500)}

Candidate Resume: ${resume.substring(0, 1000)}

Task: Analyze if this candidate is a good match for this job. Consider:
1. Skills alignment (technical and soft skills)
2. Experience relevance
3. Domain knowledge
4. Overall fit

Respond in JSON format:
{
  "matchScore": <number 0-100>,
  "isRelevant": <boolean>,
  "summary": "<2-3 sentence analysis>",
  "confidence": "<high/medium/low>",
  "keyStrengths": ["<strength1>", "<strength2>"],
  "concerns": ["<concern1>", "<concern2>"]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiAnalysis = JSON.parse(jsonMatch[0]);
      aiScore = aiAnalysis.matchScore || 0;
      aiSummary = aiAnalysis.summary || "";
    }
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    // Fallback if Gemini fails - use basic scoring
    aiScore = Math.round((skillRatio * 0.6 + keywordScore * 0.4) * 100);
    aiSummary = "AI analysis unavailable - using basic keyword matching";
  }

  // Step 4: Calculate final score (weighted combination)
  const skillScore = Math.round(skillRatio * 100);
  const keywordScorePercent = Math.round(keywordScore * 100);

  // Weighted scoring: AI (50%), Skills (30%), Keywords (20%)
  const finalScore = aiAnalysis
    ? Math.round(aiScore * 0.5 + skillScore * 0.3 + keywordScorePercent * 0.2)
    : Math.round(skillScore * 0.6 + keywordScorePercent * 0.4);

  // Step 5: Determine match status with strict thresholds
  const MIN_SCORE = 30; // Minimum 30% to be considered a match
  const MIN_SKILLS = 3; // Or at least 3 matching skills
  const MIN_SKILL_RATIO = 0.4; // Or 40% of required skills

  const isMatch = finalScore >= MIN_SCORE &&
    (matchedSkills.length >= MIN_SKILLS || skillRatio >= MIN_SKILL_RATIO);

  // Step 6: Determine confidence level
  let confidenceLevel = "low";
  if (finalScore >= 70 && matchedSkills.length >= 5) {
    confidenceLevel = "high";
  } else if (finalScore >= 50 && matchedSkills.length >= 3) {
    confidenceLevel = "medium";
  }

  // Step 7: Generate rejection reason if not a match
  let rejectionReason = "";
  if (!isMatch) {
    if (matchedSkills.length === 0) {
      rejectionReason = "No matching skills found - completely different profile";
    } else if (skillRatio < MIN_SKILL_RATIO) {
      rejectionReason = `Only ${matchedSkills.length}/${declaredSkills.length} required skills matched (need ${Math.ceil(declaredSkills.length * MIN_SKILL_RATIO)}+)`;
    } else if (finalScore < MIN_SCORE) {
      rejectionReason = `Match score ${finalScore}% is below minimum threshold of ${MIN_SCORE}%`;
    } else {
      rejectionReason = "Insufficient overall relevance to job requirements";
    }
  }

  // Step 8: Enhance AI summary
  if (!aiSummary && aiAnalysis) {
    const strengths = aiAnalysis.keyStrengths?.join(", ") || "";
    const concerns = aiAnalysis.concerns?.join(", ") || "";
    aiSummary = `Strengths: ${strengths}. Concerns: ${concerns}`;
  } else if (!aiSummary) {
    aiSummary = isMatch
      ? `Candidate shows ${confidenceLevel} alignment with job requirements`
      : `Candidate profile does not align with job requirements`;
  }

  return {
    score: finalScore,
    matchedSkills: matchedSkills.slice(0, 8),
    missingSkills: missingSkills.slice(0, 8),
    isMatch,
    rejectionReason,
    aiSummary,
    confidenceLevel,
  };
}

module.exports = { matchResume };
