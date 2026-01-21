const express = require("express");
const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const Match = require("../models/Match");
const Application = require("../models/Application");
const { matchResume } = require("../services/geminiService");

const router = express.Router();

router.post("/:jobId/:candidateId", async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    const candidate = await Candidate.findById(req.params.candidateId);

    if (!job) return res.status(404).json({ error: "Job not found" });
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    // Require jobs to have declared skills to allow matching
    if (!Array.isArray(job.skills) || job.skills.length === 0) {
      return res.status(400).json({
        error: "Job must include a non-empty skills array to enable matching",
      });
    }

    const result = await matchResume(candidate.resumeText, job);

    const match = await Match.create({
      jobId: job._id,
      candidateId: candidate._id,
      ...result,
    });

    // Also update Application record with match results
    const application = await Application.findOne({
      candidateId: candidate._id,
      jobId: job._id
    });

    if (application) {
      application.matchScore = result.score;
      application.matchedSkills = result.matchedSkills || [];
      application.missingSkills = result.missingSkills || [];
      application.aiSummary = result.summary || "";
      await application.save();
    }

    res.json(result);
  } catch (error) {
    console.error("Match creation error:", error);
    res.status(500).json({
      error: "Failed to create match",
      details: error.message
    });
  }
});

router.get("/:jobId", async (req, res) => {
  try {
    const showRejected = req.query.showRejected !== "false"; // Default: show all

    const query = { jobId: req.params.jobId };
    if (!showRejected) {
      query.isMatch = true; // Only show matches
    }

    const data = await Match.find(query)
      .populate("candidateId", "name email")
      .sort({ score: -1 }); // Sort by score descending

    res.json(data);
  } catch (error) {
    console.error("Match retrieval error:", error);
    res.status(500).json({
      error: "Failed to retrieve matches",
      details: error.message
    });
  }
});

// Feedback route
router.put("/feedback/:matchId", async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.matchId,
      { feedback: req.body.feedback },
      { new: true }
    );
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json(match);
  } catch (error) {
    console.error("Feedback update error:", error);
    res.status(500).json({
      error: "Failed to update feedback",
      details: error.message
    });
  }
});

module.exports = router;
