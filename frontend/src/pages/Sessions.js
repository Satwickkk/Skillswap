import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Sessions.css';

export default function Sessions() {
  const { user } = useAuth();
  const location = useLocation();
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('upcoming');

  // Pre-fill from matches page navigation
  const preMatch = location.state?.matchUser;
  const preSkills = location.state?.skills || [];

  const [form, setForm] = useState({
    teacherId: preMatch?.id || '',
    skillId: '',
    title: '',
    scheduledDate: '',
    duration: 60,
    notes: ''
  });

  useEffect(() => {
    fetchSessions();
    if (preMatch) setShowForm(true);
  }, []);

  const fetchSessions = async () => {
    const res = await axios.get('/api/sessions/mine');
    setSessions(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/sessions', form);
      await fetchSessions();
      setShowForm(false);
      setForm({ teacherId: '', skillId: '', title: '', scheduledDate: '', duration: 60, notes: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    await axios.put(`/api/sessions/${id}/status`, { status });
    fetchSessions();
  };

  const upcoming = sessions.filter(s => ['pending', 'confirmed'].includes(s.status));
  const past = sessions.filter(s => ['completed', 'cancelled'].includes(s.status));
  const displayed = tab === 'upcoming' ? upcoming : past;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const statusColor = { pending: 'badge-gray', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Sessions</h1>
            <p>Manage your learning and teaching sessions</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Schedule Session'}
          </button>
        </div>

        {/* Schedule Form */}
        {showForm && (
          <div className="card schedule-form">
            <h3>Schedule a Session</h3>
            {preMatch && (
              <div className="pre-match-banner">
                📅 Scheduling with <strong>{preMatch.name}</strong>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Teacher's User ID</label>
                  <input
                    type="text"
                    placeholder="Paste teacher's user ID"
                    value={form.teacherId}
                    onChange={e => setForm({ ...form, teacherId: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Skill ID</label>
                  {preSkills.length > 0 ? (
                    <select value={form.skillId} onChange={e => setForm({ ...form, skillId: e.target.value })} required>
                      <option value="">Select a skill</option>
                      {preSkills.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Paste skill ID"
                      value={form.skillId}
                      onChange={e => setForm({ ...form, skillId: e.target.value })}
                      required
                    />
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Session Title</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to React Hooks"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledDate}
                    onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <select value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })}>
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea rows={2} placeholder="Topics to cover, preparation needed..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Scheduling...' : 'Confirm Session (5 credits)'}
              </button>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="session-tabs">
          <button className={`tab-btn ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>
            Upcoming ({upcoming.length})
          </button>
          <button className={`tab-btn ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>
            Past ({past.length})
          </button>
        </div>

        {/* Session Cards */}
        {displayed.length === 0 ? (
          <div className="card empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <h3>No {tab} sessions</h3>
            <p>{tab === 'upcoming' ? 'Schedule a session with a match to get started' : 'Completed sessions will appear here'}</p>
          </div>
        ) : (
          <div className="session-cards">
            {displayed.map(s => {
              const isTeacher = s.teacher?._id === user?.id || s.teacher?.id === user?.id;
              const other = isTeacher ? s.learner : s.teacher;
              return (
                <div key={s._id} className="session-card">
                  <div className="session-card-left">
                    <div className="session-date-block">
                      <div className="session-day">{new Date(s.scheduledDate).getDate()}</div>
                      <div className="session-month">{new Date(s.scheduledDate).toLocaleDateString('en-US', { month: 'short' })}</div>
                    </div>
                  </div>
                  <div className="session-card-body">
                    <div className="session-card-title">{s.title}</div>
                    <div className="session-card-meta">
                      <span>{isTeacher ? '🎓 Teaching' : '📖 Learning'} · {other?.name}</span>
                      <span>🕐 {formatTime(s.scheduledDate)}</span>
                      <span>⏱ {s.duration} min</span>
                      <span>💳 {s.creditsCharged} credits</span>
                    </div>
                    {s.skill && <span className="tag" style={{ fontSize: 12 }}>{s.skill.name}</span>}
                  </div>
                  <div className="session-card-right">
                    <span className={`badge ${statusColor[s.status]}`}>{s.status}</span>
                    {s.status === 'pending' && (
                      <div className="session-actions">
                        <button className="action-yes" onClick={() => updateStatus(s._id, 'confirmed')}>Confirm</button>
                        <button className="action-no" onClick={() => updateStatus(s._id, 'cancelled')}>Cancel</button>
                      </div>
                    )}
                    {s.status === 'confirmed' && (
                      <button className="action-complete" onClick={() => updateStatus(s._id, 'completed')}>Mark Complete</button>
                    )}
                    {s.status === 'completed' && (
                      <button className="action-feedback" onClick={() => setShowFeedback(s)}>
                        ⭐ Rate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedback && (
          <FeedbackModal
            session={showFeedback}
            currentUserId={user?.id}
            onClose={() => setShowFeedback(null)}
            onSubmit={() => { setShowFeedback(null); fetchSessions(); }}
          />
        )}
      </div>
    </div>
  );
}

function FeedbackModal({ session, currentUserId, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const isTeacher = session.teacher?._id === currentUserId || session.teacher?.id === currentUserId;
  const revieweeId = isTeacher ? session.learner?._id : session.teacher?._id;
  const revieweeName = isTeacher ? session.learner?.name : session.teacher?.name;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a rating');
    setLoading(true);
    try {
      await axios.post('/api/feedback', {
        sessionId: session._id,
        revieweeId,
        rating,
        comment
      });
      onSubmit();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Rate Your Experience</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <div className="modal-body">
          <p className="feedback-subtitle">How was your session with <strong>{revieweeName}</strong>?</p>
          <div className="star-row">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                className={`star-btn ${n <= (hover || rating) ? 'active' : ''}`}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
              >
                ★
              </button>
            ))}
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Additional Feedback (optional)</label>
            <textarea rows={3} placeholder="Share your experience..." value={comment} onChange={e => setComment(e.target.value)} />
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}
