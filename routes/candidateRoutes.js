const express = require("express");
const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const pdfjsLib = require("pdfjs-dist/legacy/build/pdf"); // Removed

const Candidate = require("../models/Candidate");
const { protect } = require("../middleware/auth");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/upload", protect, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // const filePath = path.join(__dirname, "../uploads", req.file.filename);
    const pdfParse = require("pdf-parse"); // Add this line
    const dataBuffer = req.file.buffer;

    // Extract text using pdf-parse
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    // Auto-fill name and email from logged-in user
    const candidate = await Candidate.create({
      name: req.user.name,  // From logged-in user
      email: req.user.email, // From logged-in user
      resumeText: text,
      userId: req.user.id,
    });

    // fs.unlinkSync(filePath);
    res.json(candidate);
  } catch (err) {
    console.error("Resume Upload Error:", err);
    res.status(500).json({
      error: "Resume parsing failed",
      details: err.message // Expose exact error for debugging
    });
  }
});

router.get("/", protect, async (req, res) => {
  let query = {};

  // Candidates see only their own resumes
  if (req.user.role === "candidate") {
    query.userId = req.user.id;
  }
  // Recruiters and admins see all candidates

  const candidates = await Candidate.find(query);
  res.json(candidates);
});

// APPLY TO JOB - Candidate applies for a specific job
router.post("/apply/:jobId", protect, async (req, res) => {
  try {
    const { jobId } = req.params;
    const Application = require("../models/Application");
    const Job = require("../models/Job");

    // Find candidate by userId
    const candidate = await Candidate.findOne({ userId: req.user.id });

    if (!candidate) {
      return res.status(404).json({
        error: "Please upload your resume first before applying to jobs"
      });
    }

    // Find job and get recruiter ID
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Check if already applied (check Application model)
    const existingApplication = await Application.findOne({
      candidateId: candidate._id,
      jobId: jobId
    });

    if (existingApplication) {
      return res.status(400).json({
        error: "You have already applied to this job"
      });
    }

    // Create Application record
    const application = await Application.create({
      candidateId: candidate._id,
      jobId: jobId,
      recruiterId: job.createdBy,
      status: "pending"
    });

    // Also update candidate's appliedJobs array (for backward compatibility)
    if (!candidate.appliedJobs.includes(jobId)) {
      candidate.appliedJobs.push(jobId);
      await candidate.save();
    }

    res.json({
      message: "Successfully applied to job!",
      application
    });
  } catch (err) {
    console.error("Apply to job error:", err);
    res.status(500).json({ error: "Failed to apply to job" });
  }
});

// GET APPLICANTS FOR SPECIFIC JOB
router.get("/applicants/:jobId", protect, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Find all candidates who applied for this job
    const applicants = await Candidate.find({
      appliedJobs: jobId
    }).select('name email resumeText appliedJobs uploadedAt');

    res.json(applicants);
  } catch (err) {
    console.error("Get applicants error:", err);
    res.status(500).json({ error: "Failed to get applicants" });
  }
});

module.exports = router;
