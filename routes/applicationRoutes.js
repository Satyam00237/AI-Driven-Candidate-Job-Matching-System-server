const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");
const { protect, authorize } = require("../middleware/auth");
const { sendShortlistEmail } = require("../utils/emailService");

// GET ALL APPLICATIONS FOR RECRUITER (with filters)
router.get("/", protect, authorize("recruiter", "admin"), async (req, res) => {
    try {
        const { status } = req.query;

        const filter = {};
        if (req.user.role === "recruiter") {
            filter.recruiterId = req.user.id;
        }
        if (status) {
            filter.status = status;
        }

        const applications = await Application.find(filter)
            .populate("candidateId", "name email resumeText uploadedAt")
            .populate("jobId", "title description skills")
            .sort({ appliedAt: -1 });

        res.json(applications);
    } catch (err) {
        console.error("Get applications error:", err);
        res.status(500).json({ error: "Failed to get applications" });
    }
});

// SHORTLIST APPLICATION
router.post("/:applicationId/shortlist", protect, authorize("recruiter", "admin"), async (req, res) => {
    try {
        const application = await Application.findById(req.params.applicationId)
            .populate("candidateId", "name email")
            .populate("jobId", "title");

        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Check authorization
        if (req.user.role === "recruiter" && application.recruiterId.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        application.status = "shortlisted";
        application.reviewedAt = new Date();
        await application.save();

        res.json({
            message: `${application.candidateId.name} shortlisted for ${application.jobId.title}!`,
            application,
        });
    } catch (err) {
        console.error("Shortlist error:", err);
        res.status(500).json({ error: "Failed to shortlist candidate" });
    }
});

// REJECT APPLICATION
router.post("/:applicationId/reject", protect, authorize("recruiter", "admin"), async (req, res) => {
    try {
        const application = await Application.findById(req.params.applicationId)
            .populate("candidateId", "name email")
            .populate("jobId", "title");

        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Check authorization
        if (req.user.role === "recruiter" && application.recruiterId.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        application.status = "rejected";
        application.reviewedAt = new Date();
        await application.save();

        res.json({
            message: `${application.candidateId.name} rejected for ${application.jobId.title}`,
            application,
        });
    } catch (err) {
        console.error("Reject error:", err);
        res.status(500).json({ error: "Failed to reject candidate" });
    }
});

// GET SHORTLISTED APPLICATIONS
router.get("/shortlisted", protect, authorize("recruiter", "admin"), async (req, res) => {
    try {
        const filter = { status: "shortlisted" };
        if (req.user.role === "recruiter") {
            filter.recruiterId = req.user.id;
        }

        const applications = await Application.find(filter)
            .populate("candidateId", "name email resumeText uploadedAt")
            .populate("jobId", "title description skills")
            .sort({ reviewedAt: -1 });

        res.json(applications);
    } catch (err) {
        console.error("Get shortlisted error:", err);
        res.status(500).json({ error: "Failed to get shortlisted candidates" });
    }
});

// GET REJECTED APPLICATIONS
router.get("/rejected", protect, authorize("recruiter", "admin"), async (req, res) => {
    try {
        const filter = { status: "rejected" };
        if (req.user.role === "recruiter") {
            filter.recruiterId = req.user.id;
        }

        const applications = await Application.find(filter)
            .populate("candidateId", "name email resumeText uploadedAt")
            .populate("jobId", "title description skills")
            .sort({ reviewedAt: -1 });

        res.json(applications);
    } catch (err) {
        console.error("Get rejected error:", err);
        res.status(500).json({ error: "Failed to get rejected candidates" });
    }
});

// SEND SHORTLIST NOTIFICATION EMAIL
router.post("/:applicationId/send-email", protect, authorize("recruiter", "admin"), async (req, res) => {
    console.log("📧 Send email route hit - Application ID:", req.params.applicationId);
    try {
        const application = await Application.findById(req.params.applicationId)
            .populate("candidateId", "name email")
            .populate("jobId", "title");

        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Check authorization
        if (req.user.role === "recruiter" && application.recruiterId.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Check if candidate is shortlisted
        if (application.status !== "shortlisted") {
            return res.status(400).json({
                error: "Can only send emails to shortlisted candidates"
            });
        }

        // Send email
        const emailResult = await sendShortlistEmail(
            application.candidateId.name,
            application.candidateId.email,
            application.jobId.title,
            req.user.name
        );

        if (emailResult.success) {
            // Update application to mark email as sent
            application.emailSent = true;
            application.emailSentAt = new Date();
            await application.save();

            res.json({
                message: `Shortlist notification email sent to ${application.candidateId.name}`,
                previewUrl: emailResult.previewUrl, // For testing with Ethereal
            });
        } else {
            res.status(500).json({
                error: "Failed to send email",
                details: emailResult.error
            });
        }
    } catch (err) {
        console.error("❌ SEND EMAIL ERROR:", err);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        res.status(500).json({
            error: "Failed to send notification email",
            details: err.message
        });
    }
});

module.exports = router;
