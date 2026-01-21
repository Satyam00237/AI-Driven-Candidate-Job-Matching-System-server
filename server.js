require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const app = express();
connectDB();

const url = process.env.CLIENT_URL;
// console.log(url);

// Middleware
app.use(cors({ origin: url, credentials: true }));
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
