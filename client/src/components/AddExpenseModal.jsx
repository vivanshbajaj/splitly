import { useState } from 'react';
import api from '../services/api';

const CATEGORIES = ['food', 'travel', 'rent', 'entertainment', 'shopping', 'other'];

export default function AddExpenseModal({ groupId, onClose, onAdded }) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'other',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) {
      setError('Title and amount are required');
      return;
    }
    if (isNaN(form.amount) || parseFloat(form.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/expenses', {
        groupId,
        title: form.title.trim(),
        amount: parseFloat(form.amount),
        category: form.category,
        notes: form.notes,
      });
      onAdded(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Add an Expense</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <p className="text-sm text-muted mb-4">
          The bill will be split equally among all group members.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">What was this expense for?</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Dinner at Pizza Palace"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Amount (₹)</label>
            <input
              type="number"
              name="amount"
              className="form-input"
              placeholder="e.g. 1200"
              value={form.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-input"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <input
              type="text"
              name="notes"
              className="form-input"
              placeholder="Any extra details..."
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
