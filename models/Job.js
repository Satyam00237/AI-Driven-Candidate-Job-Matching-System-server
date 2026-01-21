const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  skills: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Optional for backward compatibility
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Job", jobSchema);
