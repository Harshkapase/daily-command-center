import { calcScore, getGrade, GRADE_TIERS } from '../utils/score.js';

export default function StrideScore({ water, goals, meals, slog, streak, warSessions, theme }) {
  const s = calcScore({ water, goals, meals, slog, streak, warSessions });
  const g = getGrade(s.total);
  const isDark = theme === 'dark';

  const bars = [
    { label:'Sleep',   pts:s.sleepPts,  max:200, color:'#7c3aed', emoji:'💤', val:`${s.sleepHrs.toFixed(1)}h` },
    { label:'Goals',   pts:s.goalPts,   max:250, color:'#18c77c', emoji:'🎯', val:`${s.gDone}/${goals.length}` },
    { label:'Calories',pts:s.calPts,    max:200, color:'#e79d13', emoji:'🍽️', val:`${s.totKcal}` },
    { label:'Water',   pts:s.waterPts,  max:150, color:'#00a8a8', emoji:'💧', val:`${water}/9` },
    { label:'Streak',  pts:s.streakPts, max:150, color:'#f5ad25', emoji:'🔥', val:`${streak.n}d` },
    { label:'War Mode',pts:s.warPts,    max:50,  color:'#e5484d', emoji:'⚔️', val:`${warSessions.filter(s=>s.date===new Date().toDateString()).length} sessions` },
  ];

  // Circular arc for the big score
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const pct = s.total / 1000;
  const dashOffset = circumference * (1 - pct);

  return (
    <div>
      {/* ── Big Score Card ─────────────────────────────────────── */}
      <div className="card fu" style={{ background:`linear-gradient(135deg, ${g.bg}, var(--surface))`, borderColor:g.color+'40', padding:'28px 20px', textAlign:'center', marginBottom:14, position:'relative', overflow:'hidden' }}>
        {/* bg glow */}
        <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:g.color+'10', pointerEvents:'none' }}/>

        <div style={{ fontSize:12, color:g.color, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', marginBottom:16 }}>TODAY'S STRIDE SCORE</div>

        {/* Circular gauge */}
        <div style={{ position:'relative', width:240, height:240, margin:'0 auto 16px' }}>
          <svg width="240" height="240" style={{ transform:'rotate(-90deg)' }}>
            <circle cx="120" cy="120" r={radius} fill="none" stroke="rgba(128,128,128,.12)" strokeWidth="12"/>
            <circle cx="120" cy="120" r={radius} fill="none" stroke={g.color} strokeWidth="12"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              strokeLinecap="round" style={{ transition:'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)', filter:`drop-shadow(0 0 8px ${g.color}60)` }}/>
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontSize:56, fontWeight:800, fontFamily:"'Syne',sans-serif", color:g.color, lineHeight:1, letterSpacing:'-2px' }}>{s.total}</div>
            <div style={{ fontSize:12, color:'var(--text3)', fontFamily:"'JetBrains Mono',monospace", marginTop:4 }}>/ 1000</div>
          </div>
        </div>

        {/* Grade badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 20px', borderRadius:99, background:g.color+'18', border:`1.5px solid ${g.color}40` }}>
          <span style={{ fontSize:20 }}>{g.emoji}</span>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:g.color, letterSpacing:'-0.3px' }}>{g.label}</span>
        </div>
      </div>

      {/* ── Score Breakdown ────────────────────────────────────── */}
      <div className="card fu1" style={{ marginBottom:14 }}>
        <div style={{ fontSize:12, color:'var(--text3)', fontFamily:"'JetBrains Mono',monospace", fontWeight:600, letterSpacing:'.5px', textTransform:'uppercase', marginBottom:14 }}>Breakdown</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {bars.map((b,i) => (
            <div key={i}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ fontSize:14 }}>{b.emoji}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)' }}>{b.label}</span>
                  <span style={{ fontSize:11, color:'var(--text4)', fontFamily:"'JetBrains Mono',monospace" }}>({b.val})</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700, color:b.color }}>{b.pts}</span>
                  <span style={{ fontSize:10, color:'var(--text4)', fontFamily:"'JetBrains Mono',monospace" }}>/{b.max}</span>
                </div>
              </div>
              <div className="prog" style={{ height:6 }}>
                <div className="prog-f" style={{ width:`${(b.pts/b.max)*100}%`, background:b.color, boxShadow:`0 0 6px ${b.color}60` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Grade Scale ────────────────────────────────────────── */}
      <div className="card fu2">
        <div style={{ fontSize:12, color:'var(--text3)', fontFamily:"'JetBrains Mono',monospace", fontWeight:600, letterSpacing:'.5px', textTransform:'uppercase', marginBottom:12 }}>Grade Scale</div>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {GRADE_TIERS.map(({min:lo,max:hi,emoji:em,label,color:c})=>{
            const active = s.total >= lo && s.total <= hi;
            return (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:9, background:active?c+'12':'transparent', border:`1.5px solid ${active?c+'40':'transparent'}`, transition:'all .3s' }}>
                <span style={{ fontSize:16 }}>{em}</span>
                <span style={{ flex:1, fontSize:12, fontWeight:active?700:500, color:active?c:'var(--text3)' }}>{label}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:active?c:'var(--text4)' }}>{lo}–{hi}</span>
                {active && <span style={{ fontSize:10, color:c, fontWeight:700 }}>← YOU</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
