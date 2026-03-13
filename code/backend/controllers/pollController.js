const Poll = require("../models/Poll");

const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "Question and at least two options are required." });
    }

    const normalizedOptions = options
      .map((option) => ({ text: String(option).trim() }))
      .filter((option) => option.text.length > 0);

    if (normalizedOptions.length < 2) {
      return res.status(400).json({ message: "At least two valid options are required." });
    }

    const poll = await Poll.create({
      question,
      options: normalizedOptions,
      createdBy: req.user._id,
    });

    return res.status(201).json(poll);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Poll creation failed." });
  }
};

const getPolls = async (_req, res) => {
  try {
    const polls = await Poll.find()
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });
    return res.json(polls);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch polls." });
  }
};

const votePoll = async (req, res) => {
  try {
    const { pollId, optionId } = req.body;

    if (!pollId || !optionId) {
      return res.status(400).json({ message: "pollId and optionId are required." });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found." });
    }

    const hasVoted = poll.options.some((option) =>
      option.voters.some((voterId) => String(voterId) === String(req.user._id))
    );

    if (hasVoted) {
      return res.status(400).json({ message: "You can vote only once per poll." });
    }

    const option = poll.options.id(optionId);
    if (!option) {
      return res.status(404).json({ message: "Option not found." });
    }

    option.votes += 1;
    option.voters.push(req.user._id);

    await poll.save();

    return res.json(poll);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Voting failed." });
  }
};

module.exports = { createPoll, getPolls, votePoll };
