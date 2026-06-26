import { useState } from 'react';

export default function SettleModal({ maxAmount, memberName, onClose, onSettle }) {
  const [amount, setAmount] = useState(Math.round(maxAmount).toString());
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountToSettle = parseFloat(amount);
    
    if (isNaN(amountToSettle) || amountToSettle <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    
    if (amountToSettle > maxAmount + 1) {
      setError(`You cannot settle more than you owe.`);
      return;
    }
    
    onSettle(amountToSettle);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ position: 'relative', padding: '36px' }}>
        <button className="modal-close" onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px' }}>×</button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px', boxShadow: '0 8px 16px rgba(34,197,94,0.1)' }}>
            🤝
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>Settle Up</h3>
          <p className="text-sm text-muted mt-2">
            Paying back <strong style={{ color: '#0F172A' }}>{memberName}</strong>
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Settlement Amount</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '16px', fontSize: '1.6rem', fontWeight: '800', color: '#94A3B8' }}>₹</span>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                min="0"
                step="any"
                required
                style={{ paddingLeft: '44px', fontSize: '1.8rem', fontWeight: '800', height: '64px', borderRadius: '12px', color: '#0F172A' }}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4" style={{ justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ fontSize: '1rem', padding: '12px 20px' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '1rem', padding: '12px 28px', borderRadius: '10px', background: '#22c55e', borderColor: '#22c55e' }}>
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
