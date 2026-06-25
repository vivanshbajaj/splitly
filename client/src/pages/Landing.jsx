import { Link } from 'react-router-dom';

const features = [
  { icon: '💸', title: 'Track Expenses', desc: 'Add bills, groceries, trips — anything. Never forget who paid.' },
  { icon: '🧮', title: 'Smart Splitting', desc: 'Automatically splits expenses equally among all group members.' },
  { icon: '📊', title: 'Clear Balances', desc: 'See exactly who owes who at a glance. No mental math needed.' },
  { icon: '✅', title: 'Settle Up', desc: 'Record payments and clear your debts with a single tap.' },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* ─── Navbar ─────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="navbar-logo">
          <div className="logo-icon">💰</div>
          Split<span>ly</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" className="btn btn-ghost">Log in</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="hero-glow" />
        <div className="hero-badge">✨ Free forever. No credit card needed.</div>
        <h1>
          Split bills.<br />
          <span className="highlight">Not friendships.</span>
        </h1>
        <p>
          The simplest way to track shared expenses with roommates, friends,
          and travel buddies. Add expenses, see who owes what, and settle up.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-primary btn-lg">Start for Free →</Link>
          <Link to="/login" className="btn btn-outline btn-lg">Log in</Link>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────── */}
      <section className="features-section">
        <div className="text-center">
          <h2>Everything you need, nothing you don't</h2>
          <p style={{ marginTop: '8px' }}>Built for people who just want to split bills without the drama.</p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p style={{ marginTop: '6px', fontSize: '0.9rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: '60px 24px' }}>
        <h2>Ready to stop chasing payments?</h2>
        <p style={{ marginTop: '8px', marginBottom: '28px' }}>
          Join thousands of friend groups using Splitly.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg">Create Your First Group →</Link>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} Splitly. Made with ❤️ using the MERN Stack.
      </footer>
    </div>
  );
}
