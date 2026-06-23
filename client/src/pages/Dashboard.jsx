import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CreateGroupModal from '../components/CreateGroupModal';

// Icons for group types
const GROUP_ICONS = { trip: '✈️', home: '🏠', office: '💼', event: '🎉', other: '👥' };

export default function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch all groups on page load
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  };

  // Called when a new group is created in the modal
  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
    setShowCreateModal(false);
  };

  // Get first letter of name for avatar
  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';

  return (
    <>
      <Navbar />
      <div className="page">
        {/* ─── Header ─────────────────────────────────────────────────── */}
        <div className="page-header flex items-center justify-between">
          <div>
            <h2>Hey, {user?.name?.split(' ')[0]} 👋</h2>
            <p className="text-muted text-sm mt-2">Here are all your groups and expenses.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + New Group
          </button>
        </div>

        {/* ─── Groups Grid ─────────────────────────────────────────────── */}
        {loading ? (
          <div className="spinner" />
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏝️</div>
            <h3>No groups yet</h3>
            <p>Create your first group to start tracking expenses</p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => setShowCreateModal(true)}
            >
              + Create a Group
            </button>
          </div>
        ) : (
          <div className="grid-2">
            {groups.map((group) => (
              <Link to={`/groups/${group._id}`} className="group-card" key={group._id}>
                <div className="group-card-top">
                  <div className="group-icon">{GROUP_ICONS[group.type] || '👥'}</div>
                  <span className="badge badge-muted">{group.type}</span>
                </div>

                <h3 style={{ marginBottom: '4px' }}>{group.name}</h3>
                <p className="text-sm text-muted">{group.members.length} members</p>

                {/* Member Avatars */}
                <div className="group-members">
                  {group.members.slice(0, 4).map((member) => (
                    <div
                      key={member._id}
                      className="avatar avatar-sm"
                      title={member.name}
                      style={{ background: stringToColor(member.name) }}
                    >
                      {getInitial(member.name)}
                    </div>
                  ))}
                  {group.members.length > 4 && (
                    <div className="avatar avatar-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      +{group.members.length - 4}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ─── Create Group Modal ─────────────────────────────────────── */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleGroupCreated}
        />
      )}
    </>
  );
}

// Generate a consistent color from a name string
function stringToColor(str = '') {
  const colors = ['#7C3AED', '#2563EB', '#DC2626', '#D97706', '#059669', '#DB2777'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
}
