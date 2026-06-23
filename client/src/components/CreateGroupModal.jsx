import { useState } from 'react';
import api from '../services/api';

const GROUP_TYPES = ['trip', 'home', 'office', 'event', 'other'];

export default function CreateGroupModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('other');
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState([]); // list of member emails added
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Add an email to the list
  const addEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!trimmed.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (emails.includes(trimmed)) {
      setError('Email already added');
      return;
    }
    setEmails([...emails, trimmed]);
    setEmailInput('');
    setError('');
  };

  const removeEmail = (email) => setEmails(emails.filter((e) => e !== email));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/groups', {
        name: name.trim(),
        type,
        memberEmails: emails,
      });
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Create a Group</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Group Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Goa Trip 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {GROUP_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Add Members by Email (optional)</label>
            <div className="flex gap-2">
              <input
                type="email"
                className="form-input"
                placeholder="friend@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
              />
              <button type="button" className="btn btn-outline" onClick={addEmail}>Add</button>
            </div>
            <p className="text-xs text-faint mt-2">
              Press Enter or click Add. Members must already have a Splitly account.
            </p>

            {/* Email chips */}
            {emails.length > 0 && (
              <div className="members-list mt-2">
                {emails.map((email) => (
                  <div key={email} className="member-chip">
                    <div className="avatar avatar-sm">
                      {email.charAt(0).toUpperCase()}
                    </div>
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      style={{ background: 'none', color: 'var(--text-faint)', marginLeft: '2px', fontSize: '1rem', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
