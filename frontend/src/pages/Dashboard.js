import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/sessions/mine'),
      axios.get('/api/matches'),
      axios.get('/api/skills/mine')
    ]).then(([s, m, sk]) => {
      setSessions(s.data.slice(0, 3));
      setMatches(m.data.slice(0, 3));
      setMySkills(sk.data);
    }).finally(() => setLoading(false));
  }, []);

  const upcoming = sessions.filter(s => s.status === 'confirmed' || s.status === 'pending');
  const completed = sessions.filter(s => s.status === 'completed').length;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getStatusColor = (status) => ({
    pending: 'badge-gray', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red'
  }[status] || 'badge-gray');

  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-content">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p>Here's what's happening with your skill exchanges</p>
          </div>
          <div className="header-actions">
            <Link to="/skills" className="btn-primary">+ Add Skill</Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon red">💳</div>
            <div>
              <div className="stat-value">{user?.credits ?? 0}</div>
              <div className="stat-label">Available Credits</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">🔗</div>
            <div>
              <div className="stat-value">{matches.length}</div>
              <div className="stat-label">Skill Matches</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div>
              <div className="stat-value">{completed}</div>
              <div className="stat-label">Sessions Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">⭐</div>
            <div>
              <div className="stat-value">{user?.rating ? parseFloat(user.rating).toFixed(1) : '—'}</div>
              <div className="stat-label">Your Rating</div>
            </div>
          </div>
        </div>

        <div className="dash-grid">
          {/* Quick Actions */}
          <div className="card quick-actions">
            <h3 className="section-title">Quick Actions</h3>
            <div className="action-list">
              <Link to="/skills" className="action-item">
                <div className="action-icon red">🎯</div>
                <div>
                  <div className="action-name">Add Skills</div>
                  <div className="action-desc">List what you can teach</div>
                </div>
              </Link>
              <Link to="/matches" className="action-item">
                <div className="action-icon blue">🔍</div>
                <div>
                  <div className="action-name">Find Matches</div>
                  <div className="action-desc">Discover skill swaps</div>
                </div>
              </Link>
              <Link to="/sessions" className="action-item">
                <div className="action-icon green">📅</div>
                <div>
                  <div className="action-name">Schedule Session</div>
                  <div className="action-desc">Book a learning session</div>
                </div>
              </Link>
            </div>
          </div>

          {/* My Skills */}
          <div className="card my-skills-card">
            <div className="card-head">
              <h3 className="section-title">My Skills</h3>
              <Link to="/skills" className="view-all">View all →</Link>
            </div>
            {mySkills.length === 0 ? (
              <div className="empty-state">
                <p>No skills added yet</p>
                <Link to="/skills" className="btn-primary" style={{ marginTop: 12, display: 'inline-block' }}>Add Skills</Link>
              </div>
            ) : (
              <div className="skill-tags">
                {mySkills.slice(0, 8).map(s => (
                  <span key={s._id} className={`tag ${s.type === 'offered' ? '' : 'tag-blue'}`}>
                    {s.type === 'offered' ? '✦' : '◇'} {s.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="card sessions-card">
            <div className="card-head">
              <h3 className="section-title">Upcoming Sessions</h3>
              <Link to="/sessions" className="view-all">View all →</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="empty-state"><p>No upcoming sessions</p></div>
            ) : (
              <div className="session-list">
                {upcoming.map(s => (
                  <div key={s._id} className="session-item">
                    <div className="session-avatar">{s.skill?.name?.[0]}</div>
                    <div className="session-info">
                      <div className="session-title">{s.title}</div>
                      <div className="session-meta">
                        with {s.teacher?._id === user?.id ? s.learner?.name : s.teacher?.name}
                      </div>
                    </div>
                    <div className="session-right">
                      <div className="session-date">{formatDate(s.scheduledDate)}</div>
                      <span className={`badge ${getStatusColor(s.status)}`}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Matches */}
          <div className="card matches-card">
            <div className="card-head">
              <h3 className="section-title">Top Matches</h3>
              <Link to="/matches" className="view-all">View all →</Link>
            </div>
            {matches.length === 0 ? (
              <div className="empty-state"><p>Add skills to find matches</p></div>
            ) : (
              <div className="match-list">
                {matches.map((m, i) => (
                  <div key={i} className="match-item">
                    <div className="avatar">{m.user.name[0]}</div>
                    <div className="match-info">
                      <div className="match-name">{m.user.name}</div>
                      <div className="match-skills">
                        {m.canTeachMe.slice(0, 2).map(s => <span key={s} className="tag" style={{ fontSize: 11, padding: '2px 8px' }}>{s}</span>)}
                      </div>
                    </div>
                    <div className="match-score">{m.matchScore} match</div>
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
