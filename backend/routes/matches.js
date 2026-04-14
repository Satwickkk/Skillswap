const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Skill = require('../models/Skill');

// Get skill matches for current user
router.get('/', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user._id).populate('skillsOffered').populate('skillsWanted');

    const myOfferedNames = me.skillsOffered.map(s => s.name.toLowerCase());
    const myWantedNames = me.skillsWanted.map(s => s.name.toLowerCase());

    const allUsers = await User.find({ _id: { $ne: req.user._id }, isActive: true })
      .populate('skillsOffered')
      .populate('skillsWanted')
      .select('-password');

    const matches = allUsers
      .map(user => {
        const theirOffered = user.skillsOffered.map(s => s.name.toLowerCase());
        const theirWanted = user.skillsWanted.map(s => s.name.toLowerCase());

        // They can teach what I want to learn
        const canTeachMe = theirOffered.filter(s => myWantedNames.includes(s));
        // I can teach what they want to learn
        const iCanTeach = myOfferedNames.filter(s => theirWanted.includes(s));

        const score = canTeachMe.length + iCanTeach.length;
        if (score === 0) return null;

        return {
          user: { id: user._id, name: user.name, role: user.role, rating: user.rating, credits: user.credits },
          canTeachMe: canTeachMe,
          iCanTeach: iCanTeach,
          matchScore: score,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
