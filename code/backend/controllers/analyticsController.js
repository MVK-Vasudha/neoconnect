const Case = require("../models/Case");
const Poll = require("../models/Poll");

const getAnalytics = async (_req, res) => {
  try {
    const [byDepartment, byCategory, byStatus, recentCases, recentPolls, hotspotRaw] = await Promise.all([
      Case.aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Case.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Case.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Case.find().sort({ createdAt: -1 }).limit(10).select("trackingId category department severity status createdAt"),
      Poll.find().sort({ createdAt: -1 }).limit(5).select("question options createdAt"),
      Case.aggregate([
        { $group: { _id: { department: "$department", category: "$category" }, count: { $sum: 1 } } },
        { $match: { count: { $gte: 5 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const normalize = (items, key) => items.map((item) => ({ [key]: item._id || "Unknown", count: item.count }));

    const hotspots = hotspotRaw.map((item) => ({
      department: item._id.department,
      category: item._id.category,
      count: item.count,
      isHotspot: true,
    }));

    return res.json({
      byDepartment: normalize(byDepartment, "department"),
      byCategory: normalize(byCategory, "category"),
      byStatus: normalize(byStatus, "status"),
      hotspots,
      recentCases,
      recentPolls,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch analytics." });
  }
};

module.exports = { getAnalytics };
