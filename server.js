require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const app = express();
connectDB();

const url = process.env.CLIENT_URL;
// console.log(url);

// Middleware
const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.CLIENT_URL,
];

app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                return callback(new Error("The CORS policy for this site does not allow access from the specified Origin."), false);
            }
            return callback(null, true);
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/JobRoutes"));
app.use("/api/candidates", require("./routes/candidateRoutes"));
app.use("/api/match", require("./routes/matchRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));

// app.get("/" , (req, res)
// res.send("server is running")
// )

app.get("/", (req, res) => {
    res.send("server is running...");
});




app.listen(5000, () => console.log("Server running on 5000"));


// Trigger restart
