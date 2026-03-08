import { useState } from 'react';

function calcScore({ water, goals, meals, slog, streak, warSessions }) {
  const gDone   = goals.filter(g=>g.done).length;
  const totKcal = meals.reduce((s,m)=>s+(Number(m.kcal)||0),0);
  const lastSleep = slog[0];
  const sleepDur  = lastSleep ? (() => {
    const [bh,bm]=lastSleep.bed.split(":").map(Number);
    const [wh,wm]=lastSleep.wake.split(":").map(Number);
    return ((wh*60+wm)-(bh*60+bm)+1440)%1440;
  })() : 0;

  const sleepHrs = sleepDur / 60;
  const todayWar = warSessions.filter(s=>s.date===new Date().toDateString());

  const sleepPts   = Math.round(Math.min(sleepHrs/8, 1) * 200);
  const waterPts   = Math.round((water/9) * 150);
  const goalPts    = Math.round((gDone/Math.max(goals.length,1)) * 250);
  const calPts     = Math.round(Math.min(totKcal/3200, 1) * 200);
  const streakPts  = Math.round(Math.min(streak.n/30, 1) * 150);
  const warPts     = Math.min(todayWar.length * 25, 50);
  const total      = sleepPts + waterPts + goalPts + calPts + streakPts + warPts;

  return { total, sleepPts, waterPts, goalPts, calPts, streakPts, warPts, sleepHrs, gDone, totKcal };
}

function getGrade(score) {
  if (score >= 900) return { label:'Elite',        emoji:'🏆', color:'#f5ad25', bg:'#201500' };
  if (score >= 750) return { label:'Grinder',      emoji:'⚡', color:'#4f46e5', bg:'#0d0b2a' };
  if (score >= 550) return { label:'Building',     emoji:'📈', color:'#18c77c', bg:'#0a2218' };
  if (score >= 350) return { label:'Inconsistent', emoji:'😐', color:'#e79d13', bg:'#201500' };
  return                    { label:'Sleeping On Yourself', emoji:'😴', color:'#e5484d', bg:'#1a0505' };
}

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
          {[
            [900,1000,'🏆','Elite',        '#f5ad25'],
            [750, 899,'⚡','Grinder',      '#4f46e5'],
            [550, 749,'📈','Building',     '#18c77c'],
            [350, 549,'😐','Inconsistent', '#e79d13'],
            [0,   349,'😴','Sleeping On Yourself','#e5484d'],
          ].map(([lo,hi,em,label,c])=>{
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
