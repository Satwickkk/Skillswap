import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Skills.css';

const CATEGORIES = ['Programming', 'Design', 'Marketing', 'Music', 'Language', 'Finance', 'Cooking', 'Photography', 'Writing', 'Other'];

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Programming', description: '', level: 'beginner', type: 'offered' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    const res = await axios.get('/api/skills/mine');
    setSkills(res.data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/skills', form);
      await fetchSkills();
      setForm({ name: '', category: 'Programming', description: '', level: 'beginner', type: 'offered' });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this skill?')) return;
    await axios.delete(`/api/skills/${id}`);
    setSkills(skills.filter(s => s._id !== id));
  };

  const offered = skills.filter(s => s.type === 'offered');
  const wanted = skills.filter(s => s.type === 'wanted');

  const levelColor = { beginner: 'badge-green', intermediate: 'badge-blue', advanced: 'badge-red' };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Manage Skills</h1>
            <p>Add skills you can teach and skills you want to learn</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Skill'}
          </button>
        </div>

        {/* Add Skill Form */}
        {showForm && (
          <div className="card add-skill-form">
            <h3>Add New Skill</h3>
            <form onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group">
                  <label>Skill Name</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Guitar, Spanish..."
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Level</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <div className="type-select">
                    <button type="button" className={`type-btn ${form.type === 'offered' ? 'active-offer' : ''}`} onClick={() => setForm({ ...form, type: 'offered' })}>
                      ✦ I can teach this
                    </button>
                    <button type="button" className={`type-btn ${form.type === 'wanted' ? 'active-want' : ''}`} onClick={() => setForm({ ...form, type: 'wanted' })}>
                      ◇ I want to learn this
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of your experience..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Skill'}
              </button>
            </form>
          </div>
        )}

        <div className="skills-grid">
          {/* Skills Offered */}
          <div className="card skill-section">
            <div className="skill-section-header offered">
              <span>✦ Skills I Can Teach</span>
              <span className="count-badge">{offered.length}</span>
            </div>
            {offered.length === 0 ? (
              <div className="empty-state">
                <p>No skills added yet</p>
                <small>Add skills you can teach to earn credits</small>
              </div>
            ) : (
              <div className="skill-cards">
                {offered.map(s => (
                  <div key={s._id} className="skill-card">
                    <div className="skill-card-top">
                      <div className="skill-name">{s.name}</div>
                      <button className="delete-btn" onClick={() => handleDelete(s._id)}>✕</button>
                    </div>
                    <div className="skill-card-meta">
                      <span className="badge badge-gray">{s.category}</span>
                      <span className={`badge ${levelColor[s.level]}`}>{s.level}</span>
                    </div>
                    {s.description && <p className="skill-desc">{s.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills Wanted */}
          <div className="card skill-section">
            <div className="skill-section-header wanted">
              <span>◇ Skills I Want to Learn</span>
              <span className="count-badge blue">{wanted.length}</span>
            </div>
            {wanted.length === 0 ? (
              <div className="empty-state">
                <p>No skills added yet</p>
                <small>Add skills you want to learn to find matches</small>
              </div>
            ) : (
              <div className="skill-cards">
                {wanted.map(s => (
                  <div key={s._id} className="skill-card want-card">
                    <div className="skill-card-top">
                      <div className="skill-name">{s.name}</div>
                      <button className="delete-btn" onClick={() => handleDelete(s._id)}>✕</button>
                    </div>
                    <div className="skill-card-meta">
                      <span className="badge badge-gray">{s.category}</span>
                      <span className={`badge ${levelColor[s.level]}`}>{s.level}</span>
                    </div>
                    {s.description && <p className="skill-desc">{s.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
