import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/>
  </svg>
);

const WalletIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    <circle cx="17" cy="14" r="1.5" fill="#2563EB" stroke="none"/>
  </svg>
);
const SplitIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M21 3l-7 7-4-4-7 7"/><path d="M3 21l7-7 4 4 7-7"/>
  </svg>
);
const ChartIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const HandshakeIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
  </svg>
);

const features = [
  { Icon: WalletIcon,   title: 'Track Every Expense', desc: 'Record bills, groceries, rent, trips, and more. Every payment is organized in one place.' },
  { Icon: SplitIcon,    title: 'Split Bills Fairly',  desc: 'Expenses are split equally among all group members — automatic, clean, and instant.' },
  { Icon: ChartIcon,    title: 'Real-Time Balances',  desc: 'Know exactly who owes whom with a clear, live balance overview at all times.' },
  { Icon: HandshakeIcon,title: 'Settle Instantly',    desc: 'Log repayments, clear outstanding balances, and keep everyone\'s records current.' },
];

const steps = [
  { n: '1', title: 'Create a Group', desc: 'Add your roommates, trip buddies, or colleagues in seconds.' },
  { n: '2', title: 'Log Expenses',   desc: 'Add any shared bill and Splitly handles the math automatically.' },
  { n: '3', title: 'Track Balances', desc: 'See a live view of who owes what at any time.' },
  { n: '4', title: 'Settle Up',      desc: 'Record payments and clear debts with a single tap.' },
];

export default function Landing() {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>

      {/* ─── Navbar ─── */}
      <nav className="cs-nav">
        <div className="cs-logo">
          <div className="cs-logo-icon"><LogoIcon /></div>
          <div>Split<span style={{ color: '#2563EB' }}>ly</span></div>
        </div>
        <div className="cs-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#about">About</a>
        </div>
        {user ? (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#2563EB', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a2e' }}>{user.name}</span>
            </div>
            <Link to="/dashboard" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>Dashboard</Link>
            <button onClick={logout} style={{ background: 'transparent', color: '#64748B', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Log out</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/login" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
            <Link to="/register" className="cs-signin-btn">Sign Up</Link>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="cs-hero">
        <h1>
          The Smarter Way to<br />
          <span className="cs-hero-accent">Split Expenses.</span>
        </h1>
        <p>
          Track every payment, split bills fairly, simplify debts automatically,
          and settle up in seconds.
        </p>
        <div className="cs-hero-btns">
          {user ? (
            <Link to="/dashboard" className="cs-btn-dark">Go to Dashboard →</Link>
          ) : (
            <>
              <Link to="/register" className="cs-btn-dark">Get Started Free →</Link>
              <Link to="/login" className="cs-btn-outline-white">Sign In</Link>
            </>
          )}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="cs-section" id="features">
        <h2 className="cs-section-title">Why Choose Splitly?</h2>
        <p className="cs-section-sub">
          Built for roommates, travelers, couples, and friends who want to manage
          shared expenses effortlessly.
        </p>
        <div className="cs-features-grid">
          {features.map((f) => (
            <div className="cs-feature-card" key={f.title}>
              <div className="cs-feature-icon"><f.Icon /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="cs-section cs-section-gray" id="how">
        <h2 className="cs-section-title">How It Works</h2>
        <div className="cs-steps-grid">
          {steps.map((s) => (
            <div className="cs-step" key={s.n}>
              <div className="cs-step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cs-cta-wrap" id="about">
        <div className="cs-cta-card">
          <h2>Ready to Split Fairly?</h2>
          <p>
            Join thousands of friend groups already using Splitly to stay
            stress-free with shared expenses.
          </p>
          {user ? (
            <Link to="/dashboard" className="cs-btn-dark">Go to Dashboard →</Link>
          ) : (
            <Link to="/register" className="cs-btn-dark">Start for Free →</Link>
          )}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="cs-footer">
        <div className="cs-logo" style={{ fontSize: '1rem' }}>
          <div className="cs-logo-icon" style={{ width: '26px', height: '26px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/>
            </svg>
          </div>
          <div>Split<span style={{ color: '#2563EB' }}>ly</span></div>
        </div>
        <span>© {new Date().getFullYear()} Splitly. Built with the MERN Stack.</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          {user ? (
            <Link to="/dashboard">Dashboard</Link>
          ) : (
            <>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
