const express = require("express");
const Job = require("../models/Job");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

// CREATE JOB (Protected - Recruiter/Admin only)
router.post("/", protect, authorize("recruiter", "admin"), async (req, res) => {
  const { title, description, skills } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({
      error: "Provide a non-empty skills array",
    });
  }

  // Auto-assign createdBy to logged-in user
  const job = await Job.create({
    title,
    description,
    skills,
    createdBy: req.user.id
  });
  res.json(job);
});

// GET JOBS (Protected - show based on role)
router.get("/", protect, async (req, res) => {
  let query = {};

  // If recruiter, show only their jobs
  if (req.user.role === "recruiter") {
    query.createdBy = req.user.id;
  }
  // Admin sees all jobs
  // Candidate sees all jobs (to apply/match)

  const jobs = await Job.find(query);
  res.json(jobs);
});

// DELETE JOB (Protected - only owner or admin)
router.delete("/:id", protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Check ownership (only owner or admin can delete)
    // Convert both to string for proper comparison
    const jobOwnerId = job.createdBy ? job.createdBy.toString() : null;
    const currentUserId = req.user.id.toString();

    if (jobOwnerId && jobOwnerId !== currentUserId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete this job" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job Deleted" });
  } catch (err) {
    console.error("Delete job error:", err);
    res.status(500).json({ error: "Server error while deleting job" });
  }
});

module.exports = router;
