import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleModal from '../components/SettleModal';

const CATEGORY_ICONS = {
  food: '🍕', travel: '✈️', rent: '🏠',
  entertainment: '🎬', shopping: '🛍️', other: '📦',
};

// ─── Formatting Helper ────────────────────────────────────────────────────────
function formatAmount(amount) {
  // If the amount is within 5 pennies of a whole number, snap it to the whole number
  // This aggressively hides floating point drift bugs from older database entries
  let rounded = Math.round(amount * 100) / 100;
  if (Math.abs(Math.round(amount) - amount) <= 0.05) {
    rounded = Math.round(amount);
  }

  if (Number.isInteger(rounded)) {
    return rounded.toLocaleString('en-IN');
  }
  return rounded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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

// ─── Simplify Debts Logic (Minimum Cash Flow) ────────────────────────────────
function calculateGlobalBalances(expenses, settlements) {
  const netBalances = {}; 
  expenses.forEach(exp => {
    const payerId = exp.paidBy._id;
    netBalances[payerId] = (netBalances[payerId] || 0) + exp.amount;
    exp.splits.forEach(split => {
      netBalances[split.user._id] = (netBalances[split.user._id] || 0) - split.amount;
    });
  });
  settlements.forEach(s => {
    netBalances[s.from._id] = (netBalances[s.from._id] || 0) + s.amount;
    netBalances[s.to._id] = (netBalances[s.to._id] || 0) - s.amount;
  });
  return netBalances;
}

function minimizeCashFlow(netBalances) {
  const debtors = [];
  const creditors = [];

  for (const [id, balance] of Object.entries(netBalances)) {
    if (balance < -0.01) debtors.push({ id, amount: Math.abs(balance) });
    else if (balance > 0.01) creditors.push({ id, amount: balance });
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settledAmount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.id,
      to: creditor.id,
      amount: settledAmount
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (Math.abs(debtor.amount) < 0.01) i++;
    if (Math.abs(creditor.amount) < 0.01) j++;
  }
  return transactions;
}

function getSimplifiedBalancesForUser(transactions, currentUserId) {
  const balances = {};
  transactions.forEach(t => {
    if (t.from === currentUserId) {
      balances[t.to] = (balances[t.to] || 0) - t.amount;
    } else if (t.to === currentUserId) {
      balances[t.from] = (balances[t.from] || 0) + t.amount;
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
  const [settleData, setSettleData] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [simplifyDebts, setSimplifyDebts] = useState(true);

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

  const handleSettleUp = (toUserId, maxAmount, memberName) => {
    setSettleData({ toUserId, maxAmount, memberName });
  };

  const submitSettleUp = async (amountToSettle) => {
    if (!settleData) return;
    try {
      const res = await api.post('/settlements', {
        groupId: id,
        toUserId: settleData.toUserId,
        amount: amountToSettle,
        method: 'cash',
      });
      setSettlements([res.data, ...settlements]);
      setSettleData(null);
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

  const currentUserId = user.id || user._id;

  let balances = {};
  if (simplifyDebts) {
    const globalBalances = calculateGlobalBalances(expenses, settlements);
    const optimizedTransactions = minimizeCashFlow(globalBalances);
    balances = getSimplifiedBalancesForUser(optimizedTransactions, currentUserId);
  } else {
    balances = calculateBalances(expenses, settlements, currentUserId);
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const mySpend = expenses
    .filter((e) => e.paidBy._id === currentUserId)
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
              {group.createdBy._id === currentUserId && (
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
            <div className="stat-value neutral">₹{formatAmount(totalExpenses)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">You Paid</div>
            <div className="stat-value neutral">₹{formatAmount(mySpend)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">You Are Owed</div>
            <div className="stat-value positive">₹{formatAmount(totalOwed)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">You Owe</div>
            <div className="stat-value negative">₹{formatAmount(totalOwing)}</div>
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
                  const myShare = expense.splits.find((s) => s.user._id === currentUserId);
                  const iPaid = expense.paidBy._id === currentUserId;
                  return (
                    <div className="expense-item" key={expense._id}>
                      <div className="expense-cat-icon">
                        {CATEGORY_ICONS[expense.category] || '📦'}
                      </div>
                      <div className="expense-info">
                        <div className="expense-title">{expense.title}</div>
                        <div className="expense-meta">
                          Paid by {iPaid ? 'you' : expense.paidBy.name} ·{' '}
                          {new Date(expense.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                      <div>
                        <div className="expense-amount">₹{formatAmount(expense.amount)}</div>
                        {myShare && (
                          <div className="expense-share">
                            {iPaid ? 'you paid' : `your share: ₹${formatAmount(myShare.amount)}`}
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
                    {m.name} {m._id === currentUserId && <span className="text-faint">(you)</span>}
                  </span>
                  {m._id === group.createdBy._id && (
                    <span className="badge badge-primary text-xs ml-auto">admin</span>
                  )}
                </div>
              ))}
            </div>

            {/* Balances */}
            <div className="card">
              <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: 0 }}>Balances</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--muted)' }}>
                  <input 
                    type="checkbox" 
                    checked={simplifyDebts} 
                    onChange={(e) => setSimplifyDebts(e.target.checked)} 
                    style={{ cursor: 'pointer' }}
                  />
                  Simplify Debts
                </label>
              </div>
              
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
                            ₹{formatAmount(Math.abs(amount))}
                          </div>
                          {!isPositive && (
                            <button
                              className="btn btn-sm btn-outline settle-btn"
                              style={{ marginTop: '4px' }}
                              onClick={() => handleSettleUp(uid, Math.abs(amount), member.name)}
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
                  <div key={s._id} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div className="text-sm">
                        {s.from._id === currentUserId ? 'You' : s.from.name} → {s.to._id === currentUserId ? 'You' : s.to.name}
                      </div>
                      <div className="text-xs text-muted" style={{ marginTop: '2px' }}>
                        {new Date(s.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-accent">₹{formatAmount(s.amount)}</span>
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

      {settleData && (
        <SettleModal
          maxAmount={settleData.maxAmount}
          memberName={settleData.memberName}
          onClose={() => setSettleData(null)}
          onSettle={submitSettleUp}
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
