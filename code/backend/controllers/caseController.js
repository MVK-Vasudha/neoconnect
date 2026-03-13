const Case = require("../models/Case");
const { generateTrackingId } = require("../utils/trackingId");

const createCase = async (req, res) => {
  try {
    const { category, department, location, severity, description, anonymous } = req.body;

    if (!category || !department || !location || !severity || !description) {
      return res.status(400).json({ message: "Missing required complaint fields." });
    }

    const trackingId = await generateTrackingId();
    const attachment = req.file ? `/uploads/${req.file.filename}` : "";

    const createdCase = await Case.create({
      trackingId,
      category,
      department,
      location,
      severity,
      description,
      anonymous: anonymous === "true" || anonymous === true,
      attachment,
      createdBy: req.user._id,
    });

    return res.status(201).json(createdCase);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Case creation failed." });
  }
};

const getCases = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === "staff") {
      query.createdBy = req.user._id;
    }

    if (req.user.role === "caseManager") {
      query.assignedTo = req.user._id;
    }

    const cases = await Case.find(query)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.json(cases);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch cases." });
  }
};

const getCaseById = async (req, res) => {
  try {
    const oneCase = await Case.findById(req.params.id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("notes.author", "name role");

    if (!oneCase) {
      return res.status(404).json({ message: "Case not found." });
    }

    if (
      req.user.role === "staff" &&
      String(oneCase.createdBy._id) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Forbidden." });
    }

    if (
      req.user.role === "caseManager" &&
      String(oneCase.assignedTo?._id) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Forbidden." });
    }

    return res.json(oneCase);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch case." });
  }
};

const assignCase = async (req, res) => {
  try {
    const { caseId, caseManagerId } = req.body;

    if (!caseId || !caseManagerId) {
      return res.status(400).json({ message: "caseId and caseManagerId are required." });
    }

    const updated = await Case.findByIdAndUpdate(
      caseId,
      {
        assignedTo: caseManagerId,
        status: "Assigned",
        assignedAt: new Date(),
      },
      { new: true }
    ).populate("assignedTo", "name email role");

    if (!updated) {
      return res.status(404).json({ message: "Case not found." });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Case assignment failed." });
  }
};

const updateCaseStatus = async (req, res) => {
  try {
    const { caseId, status, note } = req.body;

    if (!caseId || !status) {
      return res.status(400).json({ message: "caseId and status are required." });
    }

    const oneCase = await Case.findById(caseId);
    if (!oneCase) {
      return res.status(404).json({ message: "Case not found." });
    }

    if (
      req.user.role === "caseManager" &&
      String(oneCase.assignedTo) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "You can update only assigned cases." });
    }

    oneCase.status = status;

    if (note) {
      oneCase.notes.push({
        content: note,
        author: req.user._id,
        createdAt: new Date(),
      });
    }

    if (req.user.role === "caseManager") {
      oneCase.lastCaseManagerResponseAt = new Date();
    }

    await oneCase.save();

    const populated = await Case.findById(caseId)
      .populate("assignedTo", "name email role")
      .populate("notes.author", "name role");

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Status update failed." });
  }
};

const getResolvedCases = async (_req, res) => {
  try {
    const cases = await Case.find({ status: "Resolved" })
      .select("trackingId category department description notes createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(cases);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch resolved cases." });
  }
};

module.exports = {
  createCase,
  getCases,
  getCaseById,
  assignCase,
  updateCaseStatus,
  getResolvedCases,
};
