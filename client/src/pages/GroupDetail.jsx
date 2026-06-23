import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AddExpenseModal from '../components/AddExpenseModal';

const CATEGORY_ICONS = {
  food: '🍕', travel: '✈️', rent: '🏠',
  entertainment: '🎬', shopping: '🛍️', other: '📦',
};

// ─── Balance Calculation (the core logic of the app) ────────────────────────
// Returns an object: { userId: netAmount }
//   positive = that person owes YOU
//   negative = YOU owe that person
function calculateBalances(expenses, settlements, currentUserId) {
  const balances = {};

  // Process expenses
  expenses.forEach((expense) => {
    const payerId = expense.paidBy._id;
    expense.splits.forEach((split) => {
      const splitUserId = split.user._id;
      if (payerId === splitUserId) return; // payer doesn't owe themselves

      if (payerId === currentUserId) {
        // I paid → they owe me
        balances[splitUserId] = (balances[splitUserId] || 0) + split.amount;
      } else if (splitUserId === currentUserId) {
        // They paid → I owe them
        balances[payerId] = (balances[payerId] || 0) - split.amount;
      }
    });
  });

  // Process settlements (reduce debts)
  settlements.forEach((s) => {
    const fromId = s.from._id;
    const toId = s.to._id;
    if (fromId === currentUserId) {
      // I paid them → I owe them less
      balances[toId] = (balances[toId] || 0) + s.amount;
    } else if (toId === currentUserId) {
      // They paid me → they owe me less
      balances[fromId] = (balances[fromId] || 0) - s.amount;
    }
  });

  return balances;
}

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      const [groupRes, expensesRes, settlementsRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/expenses/group/${id}`),
        api.get(`/settlements/group/${id}`),
      ]);
      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
      setSettlements(settlementsRes.data);
    } catch (err) {
      console.error(err);
      navigate('/dashboard'); // redirect if group not found
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = (newExpense) => {
    setExpenses([newExpense, ...expenses]);
    setShowAddExpense(false);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    setDeletingId(expenseId);
    try {
      await api.delete(`/expenses/${expenseId}`);
      setExpenses(expenses.filter((e) => e._id !== expenseId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSettleUp = async (toUserId, amount) => {
    if (!window.confirm(`Confirm settlement of ₹${amount.toFixed(2)}?`)) return;
    try {
      const res = await api.post('/settlements', {
        groupId: id,
        toUserId,
        amount,
        method: 'cash',
      });
      setSettlements([res.data, ...settlements]);
    } catch (err) {
      alert('Failed to record settlement');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This cannot be undone.')) return;
    try {
      await api.delete(`/groups/${id}`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete group');
    }
  };

  if (loading) return <><Navbar /><div className="spinner" /></>;

  const balances = calculateBalances(expenses, settlements, user.id);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const mySpend = expenses
    .filter((e) => e.paidBy._id === user.id)
    .reduce((sum, e) => sum + e.amount, 0);

  // What I owe overall vs what I'm owed
  const totalOwed = Object.values(balances).filter((v) => v > 0).reduce((s, v) => s + v, 0);
  const totalOwing = Math.abs(Object.values(balances).filter((v) => v < 0).reduce((s, v) => s + v, 0));

  const membersById = {};
  group.members.forEach((m) => { membersById[m._id] = m; });

  return (
    <>
      <Navbar />
      <div className="page">
        {/* ─── Header ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/dashboard" className="text-sm text-muted" style={{ marginBottom: '8px', display: 'inline-block' }}>
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2>{group.name}</h2>
              <p className="text-sm text-muted mt-2">
                {group.members.length} members · {expenses.length} expenses
              </p>
            </div>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setShowAddExpense(true)}>
                + Add Expense
              </button>
              {group.createdBy._id === user.id && (
                <button className="btn btn-danger btn-sm" onClick={handleDeleteGroup}>
                  Delete Group
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Stats ──────────────────────────────────────────────────── */}
        <div className="stats-row" style={{ marginBottom: '28px' }}>
          <div className="stat-card">
            <div className="stat-label">Total Spent</div>
            <div className="stat-value neutral">₹{totalExpenses.toFixed(0)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">You Paid</div>
            <div className="stat-value neutral">₹{mySpend.toFixed(0)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">You Are Owed</div>
            <div className="stat-value positive">₹{totalOwed.toFixed(0)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">You Owe</div>
            <div className="stat-value negative">₹{totalOwing.toFixed(0)}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

          {/* ─── Expenses List ────────────────────────────────────────── */}
          <div>
            <div className="section-header">
              <h3>Expenses</h3>
              <span className="text-sm text-muted">{expenses.length} total</span>
            </div>

            <div className="card">
              {expenses.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px' }}>
                  <div className="empty-icon">🧾</div>
                  <h3>No expenses yet</h3>
                  <p>Add the first expense to get started</p>
                </div>
              ) : (
                expenses.map((expense) => {
                  const myShare = expense.splits.find((s) => s.user._id === user.id);
                  const iPaid = expense.paidBy._id === user.id;
                  return (
                    <div className="expense-item" key={expense._id}>
                      <div className="expense-cat-icon">
                        {CATEGORY_ICONS[expense.category] || '📦'}
                      </div>
                      <div className="expense-info">
                        <div className="expense-title">{expense.title}</div>
                        <div className="expense-meta">
                          Paid by {iPaid ? 'you' : expense.paidBy.name} ·{' '}
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="expense-amount">₹{expense.amount.toFixed(0)}</div>
                        {myShare && (
                          <div className="expense-share">
                            {iPaid ? 'you paid' : `your share: ₹${myShare.amount.toFixed(0)}`}
                          </div>
                        )}
                      </div>
                      {iPaid && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteExpense(expense._id)}
                          disabled={deletingId === expense._id}
                          title="Delete expense"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ─── Sidebar: Members & Balances ─────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Members */}
            <div className="card">
              <h4 style={{ marginBottom: '12px' }}>Members</h4>
              {group.members.map((m) => (
                <div key={m._id} className="flex items-center gap-2" style={{ padding: '6px 0' }}>
                  <div className="avatar avatar-sm" style={{ background: stringToColor(m.name) }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">
                    {m.name} {m._id === user.id && <span className="text-faint">(you)</span>}
                  </span>
                  {m._id === group.createdBy._id && (
                    <span className="badge badge-primary text-xs ml-auto">admin</span>
                  )}
                </div>
              ))}
            </div>

            {/* Balances */}
            <div className="card">
              <h4 style={{ marginBottom: '12px' }}>Balances</h4>
              {Object.keys(balances).filter((uid) => Math.abs(balances[uid]) > 0.01).length === 0 ? (
                <div className="text-center" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🎉</div>
                  <p className="text-sm">All settled up!</p>
                </div>
              ) : (
                Object.entries(balances)
                  .filter(([, amount]) => Math.abs(amount) > 0.01)
                  .map(([uid, amount]) => {
                    const member = membersById[uid];
                    if (!member) return null;
                    const isPositive = amount > 0;
                    return (
                      <div className="balance-item" key={uid}>
                        <div className="flex items-center gap-2">
                          <div className="avatar avatar-sm" style={{ background: stringToColor(member.name) }}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{member.name}</div>
                            <div className="text-xs text-faint">
                              {isPositive ? 'owes you' : 'you owe'}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className={`balance-amount ${isPositive ? 'balance-positive' : 'balance-negative'}`}>
                            ₹{Math.abs(amount).toFixed(0)}
                          </div>
                          {!isPositive && (
                            <button
                              className="btn btn-sm btn-outline settle-btn"
                              style={{ marginTop: '4px' }}
                              onClick={() => handleSettleUp(uid, Math.abs(amount))}
                            >
                              Settle Up
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Settlement History */}
            {settlements.length > 0 && (
              <div className="card">
                <h4 style={{ marginBottom: '12px' }}>Settlement History</h4>
                {settlements.slice(0, 5).map((s) => (
                  <div key={s._id} className="flex items-center justify-between" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span className="text-sm text-muted">
                      {s.from._id === user.id ? 'You' : s.from.name} → {s.to._id === user.id ? 'You' : s.to.name}
                    </span>
                    <span className="text-sm font-semibold text-accent">₹{s.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddExpense && (
        <AddExpenseModal
          groupId={id}
          onClose={() => setShowAddExpense(false)}
          onAdded={handleExpenseAdded}
        />
      )}
    </>
  );
}

function stringToColor(str = '') {
  const colors = ['#7C3AED', '#2563EB', '#DC2626', '#D97706', '#059669', '#DB2777'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
}
