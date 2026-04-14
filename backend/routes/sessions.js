const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');
const User = require('../models/User');

// Create session request
router.post('/', auth, async (req, res) => {
  try {
    const { teacherId, skillId, title, scheduledDate, duration, notes } = req.body;
    const session = new Session({
      teacher: teacherId,
      learner: req.user._id,
      skill: skillId,
      title,
      scheduledDate,
      duration: duration || 60,
      notes,
      creditsCharged: 5
    });
    await session.save();
    await session.populate(['teacher', 'learner', 'skill']);
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my sessions (as teacher or learner)
router.get('/mine', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ teacher: req.user._id }, { learner: req.user._id }]
    })
      .populate('teacher', 'name email rating')
      .populate('learner', 'name email rating')
      .populate('skill', 'name category')
      .sort({ scheduledDate: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update session status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = status;

    // Deduct/refund credits on completion/cancellation
    if (status === 'completed') {
      await User.findByIdAndUpdate(session.learner, { $inc: { credits: -session.creditsCharged, sessionsCompleted: 1 } });
      await User.findByIdAndUpdate(session.teacher, { $inc: { credits: session.creditsCharged, sessionsCompleted: 1 } });
    }

    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
