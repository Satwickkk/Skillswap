// =======================================================
// SkillSwap - MongoDB Seed Script
// Run: node seed.js
// This creates demo users, skills, sessions & feedback
// =======================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ---- Inline Models (no imports needed) ----

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, default: 'student' }, bio: String, avatar: String,
  skillsOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  skillsWanted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  credits: { type: Number, default: 10 }, rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }, sessionsCompleted: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false }, isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const skillSchema = new mongoose.Schema({
  name: String, category: String, description: String,
  level: { type: String, default: 'beginner' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, createdAt: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
  title: String, scheduledDate: Date, duration: { type: Number, default: 60 },
  status: { type: String, default: 'pending' }, creditsCharged: { type: Number, default: 5 },
  notes: String, createdAt: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number, comment: String, createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Skill = mongoose.model('Skill', skillSchema);
const Session = mongoose.model('Session', sessionSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillswap');
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Skill.deleteMany({});
  await Session.deleteMany({});
  await Feedback.deleteMany({});
  console.log('🧹 Cleared existing data');

  const hash = (pwd) => bcrypt.hashSync(pwd, 10);

  // ---- Create Users ----
  const users = await User.insertMany([
    {
      name: 'Sagar Raj', email: 'sagar@demo.com', password: hash('password123'),
      role: 'student', bio: 'CS student passionate about web dev and UI/UX design.', credits: 20, rating: 4.8, totalRatings: 5, sessionsCompleted: 8
    },
    {
      name: 'Priya Sharma', email: 'priya@demo.com', password: hash('password123'),
      role: 'professional', bio: 'Full-stack developer with 4 years experience. Love teaching React.', credits: 35, rating: 4.9, totalRatings: 12, sessionsCompleted: 15
    },
    {
      name: 'Arjun Mehta', email: 'arjun@demo.com', password: hash('password123'),
      role: 'student', bio: 'Designer learning to code. I can teach Figma and UI principles.', credits: 15, rating: 4.5, totalRatings: 4, sessionsCompleted: 5
    },
    {
      name: 'Divya Nair', email: 'divya@demo.com', password: hash('password123'),
      role: 'professional', bio: 'Data scientist offering Python & ML sessions. Looking to learn music.', credits: 28, rating: 4.7, totalRatings: 8, sessionsCompleted: 10
    },
    {
      name: 'Admin User', email: 'admin@skillswap.com', password: hash('admin123'),
      role: 'professional', bio: 'Platform administrator.', credits: 100, isAdmin: true
    }
  ]);

  const [sagar, priya, arjun, divya] = users;
  console.log(`👥 Created ${users.length} users`);

  // ---- Create Skills ----
  const skills = await Skill.insertMany([
    // Sagar's skills
    { name: 'JavaScript', category: 'Programming', level: 'intermediate', type: 'offered', owner: sagar._id, description: 'ES6+, DOM manipulation, async/await' },
    { name: 'HTML/CSS', category: 'Programming', level: 'advanced', type: 'offered', owner: sagar._id, description: 'Responsive layouts and modern CSS' },
    { name: 'React', category: 'Programming', level: 'beginner', type: 'wanted', owner: sagar._id },
    { name: 'Python', category: 'Programming', level: 'beginner', type: 'wanted', owner: sagar._id },

    // Priya's skills
    { name: 'React', category: 'Programming', level: 'advanced', type: 'offered', owner: priya._id, description: 'Hooks, Context, Redux, performance optimization' },
    { name: 'Node.js', category: 'Programming', level: 'advanced', type: 'offered', owner: priya._id, description: 'REST APIs, Express, authentication' },
    { name: 'Figma', category: 'Design', level: 'beginner', type: 'wanted', owner: priya._id },
    { name: 'UI/UX Design', category: 'Design', level: 'beginner', type: 'wanted', owner: priya._id },

    // Arjun's skills
    { name: 'Figma', category: 'Design', level: 'advanced', type: 'offered', owner: arjun._id, description: 'Prototyping, design systems, auto-layout' },
    { name: 'UI/UX Design', category: 'Design', level: 'intermediate', type: 'offered', owner: arjun._id, description: 'User research, wireframing, usability testing' },
    { name: 'JavaScript', category: 'Programming', level: 'beginner', type: 'wanted', owner: arjun._id },
    { name: 'React', category: 'Programming', level: 'beginner', type: 'wanted', owner: arjun._id },

    // Divya's skills
    { name: 'Python', category: 'Programming', level: 'advanced', type: 'offered', owner: divya._id, description: 'Data analysis, pandas, numpy, visualization' },
    { name: 'Machine Learning', category: 'Programming', level: 'intermediate', type: 'offered', owner: divya._id, description: 'scikit-learn, model training, evaluation' },
    { name: 'Guitar', category: 'Music', level: 'beginner', type: 'wanted', owner: divya._id },
    { name: 'Photography', category: 'Photography', level: 'beginner', type: 'wanted', owner: divya._id }
  ]);

  // Link skills to users
  await User.findByIdAndUpdate(sagar._id, {
    skillsOffered: skills.filter(s => s.owner.equals(sagar._id) && s.type === 'offered').map(s => s._id),
    skillsWanted:  skills.filter(s => s.owner.equals(sagar._id) && s.type === 'wanted').map(s => s._id)
  });
  await User.findByIdAndUpdate(priya._id, {
    skillsOffered: skills.filter(s => s.owner.equals(priya._id) && s.type === 'offered').map(s => s._id),
    skillsWanted:  skills.filter(s => s.owner.equals(priya._id) && s.type === 'wanted').map(s => s._id)
  });
  await User.findByIdAndUpdate(arjun._id, {
    skillsOffered: skills.filter(s => s.owner.equals(arjun._id) && s.type === 'offered').map(s => s._id),
    skillsWanted:  skills.filter(s => s.owner.equals(arjun._id) && s.type === 'wanted').map(s => s._id)
  });
  await User.findByIdAndUpdate(divya._id, {
    skillsOffered: skills.filter(s => s.owner.equals(divya._id) && s.type === 'offered').map(s => s._id),
    skillsWanted:  skills.filter(s => s.owner.equals(divya._id) && s.type === 'wanted').map(s => s._id)
  });

  console.log(`🎯 Created ${skills.length} skills`);

  // ---- Create Sessions ----
  const reactSkill = skills.find(s => s.name === 'React' && s.owner.equals(priya._id));
  const figmaSkill = skills.find(s => s.name === 'Figma' && s.owner.equals(arjun._id));
  const pythonSkill = skills.find(s => s.name === 'Python' && s.owner.equals(divya._id));

  const sessions = await Session.insertMany([
    {
      teacher: priya._id, learner: sagar._id, skill: reactSkill._id,
      title: 'React Hooks Deep Dive',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      duration: 60, status: 'confirmed', creditsCharged: 5
    },
    {
      teacher: arjun._id, learner: sagar._id, skill: figmaSkill._id,
      title: 'Figma for Developers',
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      duration: 90, status: 'pending', creditsCharged: 5
    },
    {
      teacher: divya._id, learner: sagar._id, skill: pythonSkill._id,
      title: 'Python Fundamentals',
      scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      duration: 60, status: 'completed', creditsCharged: 5
    }
  ]);

  console.log(`📅 Created ${sessions.length} sessions`);

  // ---- Create Feedback ----
  const completedSession = sessions.find(s => s.status === 'completed');
  await Feedback.insertMany([
    {
      session: completedSession._id, reviewer: sagar._id, reviewee: divya._id,
      rating: 5, comment: 'Divya explained Python so clearly! Highly recommend her sessions.'
    },
    {
      session: completedSession._id, reviewer: divya._id, reviewee: sagar._id,
      rating: 4, comment: 'Sagar was attentive and asked great questions.'
    }
  ]);

  console.log('⭐ Created feedback');

  console.log('\n✅ Seed complete!\n');
  console.log('═══════════════════════════════════════');
  console.log('  DEMO LOGIN CREDENTIALS');
  console.log('═══════════════════════════════════════');
  console.log('  Email:    sagar@demo.com');
  console.log('  Password: password123');
  console.log('───────────────────────────────────────');
  console.log('  Email:    priya@demo.com');
  console.log('  Password: password123');
  console.log('───────────────────────────────────────');
  console.log('  Email:    admin@skillswap.com');
  console.log('  Password: admin123');
  console.log('═══════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
