import { useState, useEffect, useRef } from 'react';

const PERSONAS = {
  monk:    { label:"The Monk",    emoji:"🧘", color:"#00a8a8", bg:"#041818", quote:"Silence is the loudest discipline.", accent:"#0ecece" },
  warrior: { label:"The Warrior", emoji:"⚔️", color:"#e5484d", bg:"#1a0505", quote:"Pain is temporary. Regret is forever.", accent:"#ff6b6b" },
  scholar: { label:"The Scholar", emoji:"📚", color:"#4f46e5", bg:"#08081a", quote:"Every page is a weapon.", accent:"#818cf8" },
};

function playWarSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    if (type === 'start') {
      [[220,0],[330,0.1],[440,0.2],[660,0.35]].forEach(([f,d]) => {
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type='sawtooth'; o.frequency.setValueAtTime(f,t+d);
        g.gain.setValueAtTime(0.18,t+d); g.gain.exponentialRampToValueAtTime(0.001,t+d+0.3);
        o.start(t+d); o.stop(t+d+0.35);
      });
    } else if (type === 'end') {
      [[784,0],[659,0.15],[523,0.3],[440,0.45],[392,0.6]].forEach(([f,d]) => {
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type='sine'; o.frequency.setValueAtTime(f,t+d);
        g.gain.setValueAtTime(0.22,t+d); g.gain.exponentialRampToValueAtTime(0.001,t+d+0.4);
        o.start(t+d); o.stop(t+d+0.45);
      });
    } else if (type === 'tick') {
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type='sine'; o.frequency.value=800;
      g.gain.setValueAtTime(0.06,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.05);
      o.start(t); o.stop(t+0.06);
    }
  } catch(e) {}
}

export default function WarMode({ onClose, persona, sessions, setSessions, soundOn }) {
  const p = PERSONAS[persona] || PERSONAS.warrior;
  const [phase, setPhase]     = useState('pre');    // pre | active | debrief
  const [countdown, setCountdown] = useState(5);
  const [duration, setDuration]   = useState(25);   // minutes
  const [subject, setSubject]     = useState('DSA');
  const [elapsed, setElapsed]     = useState(0);    // seconds
  const [paused, setPaused]       = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [rating, setRating]       = useState(0);
  const [inFlow, setInFlow]       = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const SUBJECTS = ["DSA","DBMS","OOPS","OS","JavaScript","Other"];
  const total = duration * 60;
  const pct   = Math.min((elapsed / total) * 100, 100);
  const remaining = total - elapsed;
  const remM  = Math.floor(remaining / 60);
  const remS  = remaining % 60;

  // Pre-war countdown
  useEffect(() => {
    if (phase !== 'pre') return;
    if (countdown <= 0) { setPhase('active'); if(soundOn) playWarSound('start'); startTimeRef.current = Date.now(); return; }
    const t = setTimeout(() => { setCountdown(c=>c-1); if(soundOn && countdown<=3) playWarSound('tick'); }, 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Active timer
  useEffect(() => {
    if (phase !== 'active' || paused) return;
    intervalRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (next >= total) { clearInterval(intervalRef.current); setPhase('debrief'); if(soundOn) playWarSound('end'); }
        if (next === 45 * 60) setInFlow(true); // 45min = flow state
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [phase, paused, total]);

  function endSession() {
    clearInterval(intervalRef.current);
    if(soundOn) playWarSound('end');
    setPhase('debrief');
  }

  function saveSession(r) {
    const s = {
      id: Date.now(), subject, duration: Math.floor(elapsed/60),
      planned: duration, rating: r, distractions,
      date: new Date().toDateString(), time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
      flow: inFlow,
    };
    setSessions(prev => [s, ...prev.slice(0,49)]);
    onClose();
  }

  // ── PRE PHASE ──────────────────────────────────────────────────────
  if (phase === 'pre') return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:p.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Figtree',sans-serif" }}>
      {/* Animated bg rings */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        {[200,350,500].map((s,i) => (
          <div key={i} style={{ position:'absolute', top:'50%', left:'50%', width:s, height:s, borderRadius:'50%', border:`1px solid ${p.accent}`, opacity:0.08-(i*0.02), transform:'translate(-50%,-50%)', animation:`pulse ${2+i*0.5}s ease-in-out infinite alternate` }}/>
        ))}
      </div>

      <div style={{ fontSize:72, marginBottom:16, animation:'popIn .4s ease' }}>{p.emoji}</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, color:p.accent, letterSpacing:'3px', textTransform:'uppercase', marginBottom:8, fontWeight:700 }}>{p.label}</div>

      {/* Subject & duration selectors */}
      {countdown === 5 && (
        <div style={{ display:'flex', flexDirection:'column', gap:12, alignItems:'center', marginBottom:32, animation:'fadeUp .4s ease' }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
            {SUBJECTS.map(s => (
              <button key={s} onClick={()=>setSubject(s)} style={{ padding:'6px 14px', borderRadius:8, border:`1.5px solid ${subject===s?p.accent:'rgba(255,255,255,.15)'}`, background:subject===s?p.accent+'22':'transparent', color:subject===s?p.accent:'rgba(255,255,255,.5)', cursor:'pointer', fontSize:12, fontWeight:600, transition:'all .2s' }}>{s}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {[15,25,45,60].map(m => (
              <button key={m} onClick={()=>setDuration(m)} style={{ padding:'6px 16px', borderRadius:8, border:`1.5px solid ${duration===m?p.accent:'rgba(255,255,255,.12)'}`, background:duration===m?p.accent+'22':'transparent', color:duration===m?p.accent:'rgba(255,255,255,.4)', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", transition:'all .2s' }}>{m}m</button>
            ))}
          </div>
        </div>
      )}

      {/* Big countdown */}
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:120, fontWeight:800, color:p.accent, lineHeight:1, animation:'popIn .3s ease', textShadow:`0 0 80px ${p.accent}50` }}>
        {countdown > 0 ? countdown : '⚡'}
      </div>
      <div style={{ fontSize:14, color:'rgba(255,255,255,.4)', marginTop:16, fontStyle:'italic' }}>"{p.quote}"</div>

      <button onClick={onClose} style={{ position:'absolute', top:20, right:20, background:'rgba(255,255,255,.08)', border:'none', color:'rgba(255,255,255,.4)', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13 }}>✕ Cancel</button>
    </div>
  );

  // ── ACTIVE PHASE ───────────────────────────────────────────────────
  if (phase === 'active') return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:p.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Figtree',sans-serif" }}>
      {/* Pulsing background */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', width:600, height:600, borderRadius:'50%', background:`radial-gradient(circle, ${p.accent}08 0%, transparent 70%)`, transform:'translate(-50%,-50%)' }}/>
      </div>

      {/* Header */}
      <div style={{ position:'absolute', top:20, left:20, right:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:12, color:p.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:600, letterSpacing:'1px' }}>{subject} · {p.label.toUpperCase()}</div>
        {inFlow && <div style={{ fontSize:11, color:p.accent, background:p.accent+'20', padding:'4px 12px', borderRadius:99, fontWeight:700, animation:'pulse 1.5s infinite' }}>🔥 FLOW STATE</div>}
      </div>

      {/* Circular progress */}
      <div style={{ position:'relative', width:260, height:260, marginBottom:32 }}>
        <svg width="260" height="260" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="130" cy="130" r="115" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="8"/>
          <circle cx="130" cy="130" r="115" fill="none" stroke={p.accent} strokeWidth="8"
            strokeDasharray={`${2*Math.PI*115}`} strokeDashoffset={`${2*Math.PI*115*(1-pct/100)}`}
            strokeLinecap="round" style={{ transition:'stroke-dashoffset .5s ease' }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:54, fontWeight:800, color:'#fff', lineHeight:1, letterSpacing:'-2px' }}>
            {String(remM).padStart(2,'0')}:{String(remS).padStart(2,'0')}
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.3)', marginTop:6, fontFamily:"'JetBrains Mono',monospace" }}>remaining</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width:260, height:4, background:'rgba(255,255,255,.08)', borderRadius:99, marginBottom:32, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:p.accent, borderRadius:99, transition:'width .5s ease', boxShadow:`0 0 12px ${p.accent}` }}/>
      </div>

      {/* Quote */}
      <div style={{ fontSize:13, color:'rgba(255,255,255,.3)', fontStyle:'italic', marginBottom:40, maxWidth:280, textAlign:'center' }}>"{p.quote}"</div>

      {/* Controls */}
      <div style={{ display:'flex', gap:14, alignItems:'center' }}>
        <button onClick={()=>{ setDistractions(d=>d+1); }} style={{ background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.5)', borderRadius:10, padding:'10px 18px', cursor:'pointer', fontSize:12, fontWeight:600, transition:'all .2s' }}>
          😵 Distracted ({distractions})
        </button>
        <button onClick={()=>setPaused(p=>!p)} style={{ width:52, height:52, borderRadius:'50%', background:p.accent+'22', border:`1.5px solid ${p.accent}`, color:p.accent, fontSize:20, cursor:'pointer', transition:'all .2s' }}>
          {paused ? '▶' : '⏸'}
        </button>
        <button onClick={endSession} style={{ background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.5)', borderRadius:10, padding:'10px 18px', cursor:'pointer', fontSize:12, fontWeight:600, transition:'all .2s' }}>
          End
        </button>
      </div>
    </div>
  );

  // ── DEBRIEF PHASE ──────────────────────────────────────────────────
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:p.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Figtree',sans-serif" }}>
      <div style={{ fontSize:60, marginBottom:12, animation:'popIn .5s ease' }}>
        {elapsed >= total ? '🏆' : elapsed >= total*0.8 ? '💪' : '😅'}
      </div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:'#fff', marginBottom:6, letterSpacing:'-1px' }}>
        {elapsed >= total ? 'Session Complete!' : 'Session Ended'}
      </div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:p.accent, marginBottom:8 }}>
        {Math.floor(elapsed/60)}m {elapsed%60}s · {subject}
      </div>
      {inFlow && <div style={{ fontSize:12, color:p.accent, background:p.accent+'20', padding:'4px 14px', borderRadius:99, fontWeight:700, marginBottom:16 }}>🔥 You hit flow state!</div>}
      {distractions > 0 && <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginBottom:16 }}>😵 {distractions} distraction{distractions>1?'s':''} logged</div>}

      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.5)', marginBottom:12, textAlign:'center' }}>How was that session?</div>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          {[['😤','Rough'],['😐','Okay'],['🙂','Good'],['🔥','Lit'],['⚡','God tier']].map(([em,label],i) => (
            <button key={i} onClick={()=>setRating(i+1)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, background:rating===i+1?p.accent+'25':'transparent', border:`1.5px solid ${rating===i+1?p.accent:'rgba(255,255,255,.12)'}`, borderRadius:10, padding:'10px 12px', cursor:'pointer', transition:'all .2s' }}>
              <span style={{ fontSize:22 }}>{em}</span>
              <span style={{ fontSize:10, color:'rgba(255,255,255,.4)', fontWeight:600 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <button onClick={()=>saveSession(rating)} disabled={!rating} style={{ background:rating?p.accent:'rgba(255,255,255,.1)', color:rating?'#fff':'rgba(255,255,255,.3)', border:'none', borderRadius:11, padding:'13px 40px', fontSize:15, fontWeight:700, cursor:rating?'pointer':'default', fontFamily:"'Syne',sans-serif", letterSpacing:'-0.3px', transition:'all .2s', boxShadow:rating?`0 8px 24px ${p.accent}40`:'none' }}>
        Save Session →
      </button>
    </div>
  );
}
