import Logo from '../components/Logo.jsx';

const features = [
  { icon: '⏰', color: '#5b5bd6', bg: '#ededfc', label: 'Smart Reminders',   desc: 'Category-specific sounds for shake, workout, meals, sleep & more. Never miss a beat.' },
  { icon: '🎯', color: '#18c77c', bg: '#e6faf3', label: 'Study Goals',       desc: 'Set daily targets per subject, track streaks, and build unstoppable momentum.' },
  { icon: '🍽️', color: '#e79d13', bg: '#fdf5e6', label: 'Calorie Log',       desc: 'Hit your 3,200 kcal daily target. Log meals in seconds, watch your progress bar fill.' },
  { icon: '💧', color: '#00a8a8', bg: '#e6f9f9', label: 'Water Tracker',     desc: '9 glasses a day. Auto-alerts every 12 min keep you consistently hydrated.' },
  { icon: '🏋️', color: '#2563eb', bg: '#eff4ff', label: 'Workout Tracker',   desc: 'Full weekly split — Push, Pull, Legs & more. Track every set with a tap.' },
  { icon: '💤', color: '#7c3aed', bg: '#f0e9ff', label: 'Sleep Log',         desc: 'Log bedtime, wake time, and quality. Build your sleep history over weeks.' },
];

const steps = [
  { n: '01', title: 'Open the app', desc: 'Launch from your home screen — works offline as a PWA on Android & iOS.' },
  { n: '02', title: 'Set your schedule', desc: 'Customise reminders, timetable, and workout days once. Everything persists.' },
  { n: '03', title: 'Track daily', desc: 'Log meals, water, workouts and sleep. Watch your streak climb every day.' },
];

export default function Landing({ onEnter }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflowY: 'auto', fontFamily: 'var(--fb)' }}>

      {/* ── Navbar ───────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(244,245,249,.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1.5px solid var(--border)',
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo size={34} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--fm)', display: 'none' }}>v2.0</span>
          <button className="btn btn-accent" style={{ padding: '8px 20px', fontSize: 13 }} onClick={onEnter}>
            Open App →
          </button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px 72px', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 14px', borderRadius: 999,
          background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)',
          color: 'var(--accent)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--fm)',
          marginBottom: 28, animation: 'fadeUp .5s ease both',
          letterSpacing: '.2px',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          Stride — Personal Productivity · v2.0
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--fd)', fontSize: 'clamp(36px, 7vw, 60px)',
          fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px',
          color: 'var(--text)', marginBottom: 22,
          animation: 'fadeUp .5s .08s ease both',
        }}>
          Every day,<br />
          <span style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            a stride forward.
          </span>
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: 'clamp(15px, 2.5vw, 18px)', color: 'var(--text2)', lineHeight: 1.7,
          maxWidth: 520, margin: '0 auto 36px',
          animation: 'fadeUp .5s .14s ease both',
          fontWeight: 400,
        }}>
          Reminders with custom sounds, daily study goals, calorie tracking, water alerts,
          workout sets, and sleep logs — all in one place, all offline-first.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp .5s .2s ease both' }}>
          <button className="btn btn-accent" style={{ padding: '13px 32px', fontSize: 15 }} onClick={onEnter}>
            Launch Stride →
          </button>
          <button className="btn btn-ghost" style={{ padding: '13px 24px', fontSize: 15 }}
            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
            See Features ↓
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: 0, justifyContent: 'center', marginTop: 56,
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow)',
          animation: 'fadeUp .5s .28s ease both', flexWrap: 'wrap',
        }}>
          {[
            ['8', 'Productivity modules'],
            ['∞', 'Data stays on-device'],
            ['PWA', 'Works offline'],
            ['0', 'Ads, zero tracking'],
          ].map(([val, label], i) => (
            <div key={i} style={{
              flex: '1 1 120px', padding: '20px 16px', textAlign: 'center',
              borderRight: i < 3 ? '1.5px solid var(--border)' : 'none',
            }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-1px' }}>{val}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── App Preview / Mock ───────────────────────────────────────── */}
      <section style={{ padding: '0 24px 72px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          borderRadius: 18, padding: '20px', boxShadow: 'var(--shadow-lg)',
          animation: 'scaleIn .6s .3s ease both', opacity: 0,
          animationFillMode: 'forwards',
        }}>
          {/* Mock top bar */}
          <div style={{
            background: 'var(--surface3)', borderRadius: 10, padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
          }}>
            <Logo size={28} />
            <div style={{ display: 'flex', gap: 8 }}>
              {['🔥 12d', '💧 6/9', '🎯 3/5'].map(s => (
                <span key={s} style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 7, padding: '4px 10px', fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--fm)' }}>{s}</span>
              ))}
            </div>
          </div>
          {/* Mock cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {[
              { color: '#5b5bd6', bg: '#ededfc', icon: '⏰', label: 'Reminders', val: '3 upcoming' },
              { color: '#18c77c', bg: '#e6faf3', icon: '🎯', label: 'Goals',      val: '3/5 done' },
              { color: '#e79d13', bg: '#fdf5e6', icon: '🍽️', label: 'Calories',   val: '2,400 kcal' },
              { color: '#00a8a8', bg: '#e6f9f9', icon: '💧', label: 'Water',      val: '6 of 9' },
              { color: '#2563eb', bg: '#eff4ff', icon: '🏋️', label: 'Workout',    val: 'Push day' },
              { color: '#7c3aed', bg: '#f0e9ff', icon: '💤', label: 'Sleep',      val: '7h 20m' },
            ].map((m, i) => (
              <div key={i} style={{
                background: m.bg, border: `1.5px solid ${m.color}30`,
                borderRadius: 10, padding: '12px 14px',
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{m.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: m.color }}>{m.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, fontFamily: 'var(--fm)' }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '64px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--fm)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>EVERYTHING YOU NEED</p>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text)' }}>
            Built around your routine.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ padding: '22px 20px', transition: 'transform .2s, box-shadow .2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14, border: `1.5px solid ${f.color}25` }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 7, fontFamily: 'var(--fd)', letterSpacing: '-.3px' }}>{f.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ─────────────────────────────────────────────── */}
      <section style={{ padding: '64px 24px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--fm)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>HOW IT WORKS</p>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text)' }}>
            Up and running in 60 seconds.
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', padding: '28px 0', borderBottom: i < steps.length - 1 ? '1.5px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 28, fontWeight: 700, color: 'var(--accent-border)', minWidth: 48, letterSpacing: '-1px' }}>{s.n}</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--fd)', letterSpacing: '-.3px', marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section style={{ padding: '64px 24px 80px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #4444b8 0%, #7c6fef 50%, #5b5bd6 100%)',
          borderRadius: 20, padding: 'clamp(36px, 6vw, 60px) clamp(24px, 5vw, 48px)',
          textAlign: 'center', boxShadow: '0 20px 60px rgba(91,91,214,.3)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', fontFamily: 'var(--fm)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>YOU'RE ALL SET</p>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-1px' }}>
            Own every single stride.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.72)', marginBottom: 32, lineHeight: 1.65 }}>
            Your data stays private, on your device. No accounts, no ads, no noise.
          </p>
          <button onClick={onEnter} style={{
            background: '#fff', color: 'var(--accent2)', border: 'none', borderRadius: 11,
            padding: '14px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--fb)', letterSpacing: '-.2px',
            boxShadow: '0 8px 24px rgba(0,0,0,.15)', transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.15)'; }}
          >
            Enter Stride →
          </button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1.5px solid var(--border)', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Logo size={28} />
        <div style={{ fontSize: 12, color: 'var(--text4)', fontFamily: 'var(--fm)' }}>
          Built by Harsh Kapase · Stride · {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
