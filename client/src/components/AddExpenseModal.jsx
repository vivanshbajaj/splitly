import { useState } from 'react';
import api from '../services/api';

const CATEGORIES = ['food', 'travel', 'rent', 'entertainment', 'shopping', 'other'];
const CATEGORY_ICONS = {
  food: '🍕', travel: '✈️', rent: '🏠',
  entertainment: '🎬', shopping: '🛍️', other: '📦',
};

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
      <div className="modal" style={{ position: 'relative', padding: '36px' }}>
        
        <button className="modal-close" onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px' }}>×</button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px', boxShadow: '0 8px 16px rgba(37,99,235,0.1)' }}>
            💸
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>Add an Expense</h3>
          <p className="text-sm text-muted mt-2">
            The bill will be split equally among all members.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="form-group">
            <label className="form-label text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Expense Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Dinner at Pizza Palace"
              value={form.title}
              onChange={handleChange}
              required
              style={{ fontSize: '1.05rem', padding: '14px 16px', borderRadius: '10px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Total Amount</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '16px', fontSize: '1.6rem', fontWeight: '800', color: '#94A3B8' }}>₹</span>
              <input
                type="number"
                name="amount"
                className="form-input"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
                min="0"
                step="100"
                required
                style={{ paddingLeft: '44px', fontSize: '1.8rem', fontWeight: '800', height: '64px', borderRadius: '12px', color: '#0F172A' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Category</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  style={{
                    padding: '8px 16px', borderRadius: '99px', border: '1.5px solid', cursor: 'pointer',
                    background: form.category === cat ? '#2563EB' : '#F8FAFC',
                    color: form.category === cat ? '#fff' : '#475569',
                    borderColor: form.category === cat ? '#2563EB' : '#E2E8F0',
                    fontWeight: 600, fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center',
                    transition: 'all 0.2s', boxShadow: form.category === cat ? '0 4px 12px rgba(37,99,235,0.25)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{CATEGORY_ICONS[cat]}</span>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group mt-2">
            <label className="form-label text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Notes (optional)</label>
            <input
              type="text"
              name="notes"
              className="form-input"
              placeholder="Any extra details..."
              value={form.notes}
              onChange={handleChange}
              style={{ borderRadius: '10px' }}
            />
          </div>

          <div className="flex gap-3 mt-4" style={{ justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ fontSize: '1rem', padding: '12px 20px' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ fontSize: '1rem', padding: '12px 28px', borderRadius: '10px' }}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
