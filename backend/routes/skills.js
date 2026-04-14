const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Skill = require('../models/Skill');
const User = require('../models/User');

// Add a skill
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, description, level, type } = req.body;
    const skill = new Skill({ name, category, description, level, type, owner: req.user._id });
    await skill.save();

    // Push to user's skill list
    const field = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    await User.findByIdAndUpdate(req.user._id, { $push: { [field]: skill._id } });

    res.status(201).json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my skills
router.get('/mine', auth, async (req, res) => {
  try {
    const skills = await Skill.find({ owner: req.user._id });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a skill
router.delete('/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findOne({ _id: req.params.id, owner: req.user._id });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    await skill.deleteOne();
    const field = skill.type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    await User.findByIdAndUpdate(req.user._id, { $pull: { [field]: skill._id } });

    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
