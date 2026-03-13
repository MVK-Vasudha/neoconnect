const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const caseSchema = new mongoose.Schema(
  {
    trackingId: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["Safety", "Policy", "Facilities", "HR", "Other"],
      required: true,
    },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    anonymous: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["New", "Assigned", "In Progress", "Pending", "Resolved", "Escalated"],
      default: "New",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    notes: [noteSchema],
    attachment: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedAt: { type: Date, default: null },
    lastCaseManagerResponseAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
