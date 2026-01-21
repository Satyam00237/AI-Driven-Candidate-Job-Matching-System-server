const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Please provide all fields" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || "candidate", // Default to candidate
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Server error during signup" });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: "Please provide email and password" });
        }

        // Check for user (include password field)
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get("/me", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user / clear cookie
// @access  Private
router.post("/logout", protect, (req, res) => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.json({
        success: true,
        message: "Logged out successfully",
    });
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    // Set secure flag in production
    if (process.env.NODE_ENV === "production") {
        options.secure = true;
    }

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

module.exports = router;
