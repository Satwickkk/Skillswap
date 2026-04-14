import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Profile.css';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', role: user?.role || 'student' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put('/api/users/me', form);
      setUser(prev => ({ ...prev, ...res.data }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>My Profile</h1>
            <p>Manage your account information</p>
          </div>
        </div>

        <div className="profile-grid">
          {/* Profile Card */}
          <div className="card profile-card">
            <div className="profile-avatar-large">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-role">{user?.role}</div>
            <div className="profile-stats">
              <div className="pstat">
                <div className="pstat-val">{user?.credits ?? 0}</div>
                <div className="pstat-label">Credits</div>
              </div>
              <div className="pstat-divider" />
              <div className="pstat">
                <div className="pstat-val">{user?.rating ? parseFloat(user.rating).toFixed(1) : '—'}</div>
                <div className="pstat-label">Rating</div>
              </div>
              <div className="pstat-divider" />
              <div className="pstat">
                <div className="pstat-val">{user?.sessionsCompleted ?? 0}</div>
                <div className="pstat-label">Sessions</div>
              </div>
            </div>
            <div className="profile-id">
              <span style={{ color: '#6c757d', fontSize: 12 }}>Your User ID (share with others):</span>
              <div className="id-box" onClick={() => { navigator.clipboard.writeText(user?.id || user?._id); }}>
                <code>{user?.id || user?._id}</code>
                <span className="copy-hint">Click to copy</span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20, color: '#1a1a2e' }}>Edit Profile</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user?.email} disabled style={{ background: '#f4f5f7', color: '#6c757d' }} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <div className="role-select">
                  <button type="button" className={`role-btn ${form.role === 'student' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'student' })}>
                    🎓 Student
                  </button>
                  <button type="button" className={`role-btn ${form.role === 'professional' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'professional' })}>
                    💼 Professional
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  rows={4}
                  placeholder="Tell others about yourself, your background, and what you're passionate about..."
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              {saved && <div className="success-msg">✅ Profile updated successfully!</div>}
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: 12 }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
