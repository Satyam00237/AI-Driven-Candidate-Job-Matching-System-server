const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "shortlisted", "rejected"],
        default: "pending",
    },
    matchScore: {
        type: Number,
        default: null,
    },
    matchedSkills: {
        type: [String],
        default: [],
    },
    missingSkills: {
        type: [String],
        default: [],
    },
    aiSummary: {
        type: String,
        default: "",
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    },
    reviewedAt: {
        type: Date,
        default: null,
    },
    emailSent: {
        type: Boolean,
        default: false,
    },
    emailSentAt: {
        type: Date,
        default: null,
    },
});

// Compound index to prevent duplicate applications
ApplicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("Application", ApplicationSchema);
