const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    let token;

    console.log("Cookies:", req.cookies); // Debug log
    console.log("Authorization:", req.headers.authorization); // Debug log

    // Check for token in cookies or Authorization header
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ error: "Not authorized to access this route" });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

        // Get user from token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ error: "User not found" });
        }

        next();
    } catch (err) {
        return res.status(401).json({ error: "Not authorized to access this route" });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};
