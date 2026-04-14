import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Matches.css';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/matches')
      .then(res => setMatches(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Skill Matches</h1>
            <p>People you can exchange skills with</p>
          </div>
          <div className="match-count">
            <span>🔗</span> {matches.length} matches found
          </div>
        </div>

        {loading ? (
          <div className="loading">Finding your matches...</div>
        ) : matches.length === 0 ? (
          <div className="empty-state card">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <h3>No matches yet</h3>
            <p>Add more skills to find people who want to exchange with you</p>
          </div>
        ) : (
          <div className="matches-layout">
            {/* Match List */}
            <div className="match-list-panel">
              {matches.map((m, i) => (
                <div
                  key={i}
                  className={`match-card ${selected === i ? 'active' : ''}`}
                  onClick={() => setSelected(i)}
                >
                  <div className="match-card-top">
                    <div className="avatar avatar-lg">{m.user.name[0]}</div>
                    <div className="match-user-info">
                      <div className="match-user-name">{m.user.name}</div>
                      <div className="match-user-role">{m.user.role}</div>
                      {m.user.rating > 0 && (
                        <div className="match-rating">
                          ⭐ {parseFloat(m.user.rating).toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="match-score-badge">{m.matchScore} pts</div>
                  </div>

                  <div className="match-skills-preview">
                    {m.canTeachMe.length > 0 && (
                      <div className="match-skill-row">
                        <span className="skill-row-label can-teach">Can teach you:</span>
                        <div>
                          {m.canTeachMe.slice(0, 3).map(s => (
                            <span key={s} className="tag" style={{ fontSize: 11 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {m.iCanTeach.length > 0 && (
                      <div className="match-skill-row">
                        <span className="skill-row-label you-teach">You teach them:</span>
                        <div>
                          {m.iCanTeach.slice(0, 3).map(s => (
                            <span key={s} className="tag tag-blue" style={{ fontSize: 11 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Match Detail */}
            <div className="match-detail-panel">
              {selected === null ? (
                <div className="detail-placeholder">
                  <div style={{ fontSize: 48 }}>👈</div>
                  <h3>Select a match</h3>
                  <p>Click on a match to see details and schedule a session</p>
                </div>
              ) : (
                <MatchDetail match={matches[selected]} navigate={navigate} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MatchDetail({ match, navigate }) {
  return (
    <div className="match-detail">
      {/* Header */}
      <div className="detail-header">
        <div className="avatar avatar-lg">{match.user.name[0]}</div>
        <div>
          <h2>{match.user.name}</h2>
          <div className="detail-role">{match.user.role}</div>
          <div className="detail-meta">
            {match.user.rating > 0 && <span>⭐ {parseFloat(match.user.rating).toFixed(1)}</span>}
            <span>💳 {match.user.credits} credits</span>
          </div>
        </div>
      </div>

      {/* Match Analysis */}
      <div className="detail-section">
        <div className="detail-section-label">🎯 You have a {match.matchScore}-point match!</div>
      </div>

      {match.canTeachMe.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-title offered-title">✦ They can teach you</div>
          <div className="detail-tags">
            {match.canTeachMe.map(s => <span key={s} className="tag">{s}</span>)}
          </div>
        </div>
      )}

      {match.iCanTeach.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-title wanted-title">◇ You can teach them</div>
          <div className="detail-tags">
            {match.iCanTeach.map(s => <span key={s} className="tag tag-blue">{s}</span>)}
          </div>
        </div>
      )}

      <div className="detail-section">
        <div className="detail-section-title">📚 All their skills</div>
        <div style={{ marginTop: 8 }}>
          {match.skillsOffered.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <small style={{ color: '#6c757d', fontWeight: 600 }}>Teaches:</small>
              <div style={{ marginTop: 4 }}>
                {match.skillsOffered.map(s => <span key={s._id} className="tag" style={{ fontSize: 11 }}>{s.name}</span>)}
              </div>
            </div>
          )}
          {match.skillsWanted.length > 0 && (
            <div>
              <small style={{ color: '#6c757d', fontWeight: 600 }}>Wants to learn:</small>
              <div style={{ marginTop: 4 }}>
                {match.skillsWanted.map(s => <span key={s._id} className="tag tag-blue" style={{ fontSize: 11 }}>{s.name}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        className="btn-primary"
        style={{ width: '100%', padding: 14, fontSize: 15, marginTop: 8 }}
        onClick={() => navigate('/sessions', { state: { matchUser: match.user, skills: match.skillsOffered } })}
      >
        📅 Schedule a Session
      </button>
    </div>
  );
}
