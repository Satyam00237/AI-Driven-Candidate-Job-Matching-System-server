const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  resumeText: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Optional for backward compatibility
  },
  appliedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  }],
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Candidate", candidateSchema);
