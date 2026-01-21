const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
  score: Number,
  matchedSkills: [String],
  missingSkills: [String],
  feedback: String,
  isMatch: { type: Boolean, default: false }, // Quick filter for accepted matches
  rejectionReason: String, // Why the candidate was rejected
  aiSummary: String, // Gemini's analysis summary
  confidenceLevel: { type: String, enum: ["high", "medium", "low"], default: "low" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Match", matchSchema);
