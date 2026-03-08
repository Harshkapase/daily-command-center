export default function Logo({ size = 32, textSize = 'md', showText = true }) {
  const fs = textSize === 'lg'
    ? { title: 20, sub: 10 }
    : textSize === 'xl'
    ? { title: 28, sub: 12 }
    : { title: 15, sub: 9 };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size > 40 ? 14 : 10 }}>

      {/* ── S Monogram Mark ───────────────────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Container — deep indigo → violet gradient */}
        <rect width="40" height="40" rx="11" fill="url(#strideGrad)" />

        {/* Subtle top highlight for depth */}
        <ellipse cx="20" cy="7" rx="11" ry="4.5" fill="rgba(255,255,255,0.09)" />

        {/*
          Kinetic S — two connected crescents:
          Top crescent:    M 27,9  A 11,11 0 1,0 13,20  (sweeps up-right → top bowl)
          Bottom crescent: M 13,20 A 11,11 0 1,0 27,31  (sweeps down-left → bottom bowl)
          Both share midpoint (13,20) — the S crossing.
          Round linecaps give the crescent-tip silhouette.
        */}
        <path
          d="M 13,20 A 11,11 0 1,0 27,31"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.82"
        />
        <path
          d="M 27,9 A 11,11 0 1,0 13,20"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Accent dot at the crossing — signature detail */}
        <circle cx="13" cy="20" r="2" fill="white" opacity="0.45" />

        <defs>
          <linearGradient id="strideGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#4f46e5" />
            <stop offset="55%"  stopColor="#6d28d9" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── Wordmark ──────────────────────────────────────────── */}
      {showText && (
        <div>
          <div style={{
            fontFamily: "'Syne', system-ui, sans-serif",
            fontSize: fs.title,
            fontWeight: 800,
            color: 'var(--text)',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
          }}>
            Stride
          </div>
          <div style={{
            fontSize: fs.sub,
            color: 'var(--text3)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginTop: 1,
          }}>
            Keep moving forward
          </div>
        </div>
      )}
    </div>
  );
}
