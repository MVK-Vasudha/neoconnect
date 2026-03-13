const Minutes = require("../models/Minutes");

const uploadMinutes = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({ message: "Title and PDF file are required." });
    }
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed for minutes." });
    }

    const minutes = await Minutes.create({
      title,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
    });

    return res.status(201).json(minutes);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Minutes upload failed." });
  }
};

const getMinutes = async (req, res) => {
  try {
    const { search } = req.query;
    const query = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    const items = await Minutes.find(query)
      .populate("uploadedBy", "name role")
      .sort({ createdAt: -1 });

    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch minutes." });
  }
};

module.exports = { uploadMinutes, getMinutes };
