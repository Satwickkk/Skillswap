const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Session = require('../models/Session');

// Submit feedback
router.post('/', auth, async (req, res) => {
  try {
    const { sessionId, revieweeId, rating, comment } = req.body;

    const existing = await Feedback.findOne({ session: sessionId, reviewer: req.user._id });
    if (existing) return res.status(400).json({ message: 'Feedback already submitted' });

    const feedback = new Feedback({
      session: sessionId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating,
      comment
    });
    await feedback.save();

    // Update reviewee's average rating
    const allFeedback = await Feedback.find({ reviewee: revieweeId });
    const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
    await User.findByIdAndUpdate(revieweeId, { rating: avgRating.toFixed(1), totalRatings: allFeedback.length });

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get feedback for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name')
      .populate('session', 'title')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
