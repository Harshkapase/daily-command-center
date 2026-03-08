import { useState } from 'react';

export default function NightReview({ onClose, onSave, goals, water, meals, slog, streak }) {
  const [step, setStep]     = useState(0);
  const [win, setWin]       = useState('');
  const [improve, setImprove] = useState('');
  const [mood, setMood]     = useState(0);
  const [sleepGoal, setSleepGoal] = useState('');
  const [tomorrowIntent, setTomorrowIntent] = useState('');

  const gDone = goals.filter(g=>g.done).length;
  const totKcal = meals.reduce((s,m)=>s+(Number(m.kcal)||0), 0);
  const lastSleep = slog[0];
  const allDone = gDone === goals.length;

  const steps = [
    {
      title: "Today's Verdict", emoji: allDone ? '🏆' : gDone >= goals.length*0.6 ? '💪' : '😤',
      content: (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {/* Today stats summary */}
          {[
            [`🎯 Goals`, `${gDone}/${goals.length} completed`, gDone===goals.length?'var(--green)':'var(--gold)'],
            [`💧 Water`, `${water}/9 glasses`, water>=9?'var(--teal)':'var(--text3)'],
            [`🍽️ Calories`, `${totKcal} kcal`, totKcal>=3000?'var(--green)':'var(--text3)'],
            [`🔥 Streak`, `${streak.n} days`, 'var(--gold)'],
          ].map(([label,val,c])=>(
            <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'var(--surface3)', borderRadius:10, border:'1.5px solid var(--border)' }}>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{label}</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700, color:c }}>{val}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Wins & Lessons", emoji: '✍️',
      content: (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.5px', textTransform:'uppercase', display:'block', marginBottom:7 }}>One win today 🏆</label>
            <textarea value={win} onChange={e=>setWin(e.target.value)} placeholder="I finished the DSA assignment I'd been avoiding..." style={{ width:'100%', minHeight:88, resize:'none', lineHeight:1.75, padding:'12px', borderRadius:10, fontSize:13 }}/>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.5px', textTransform:'uppercase', display:'block', marginBottom:7 }}>One thing to improve 🔧</label>
            <textarea value={improve} onChange={e=>setImprove(e.target.value)} placeholder="I got distracted on my phone during study..." style={{ width:'100%', minHeight:88, resize:'none', lineHeight:1.75, padding:'12px', borderRadius:10, fontSize:13 }}/>
          </div>
        </div>
      )
    },
    {
      title: "How do you feel?", emoji: '🧠',
      content: (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20 }}>
            {[['😴','Drained'],['😕','Meh'],['😐','Neutral'],['🙂','Good'],['😊','Great'],['🔥','Unstoppable']].map(([em,label],i)=>(
              <button key={i} onClick={()=>setMood(i+1)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'14px 10px', borderRadius:11, border:`1.5px solid ${mood===i+1?'var(--accent)':'var(--border)'}`, background:mood===i+1?'var(--accent-bg)':'var(--surface3)', cursor:'pointer', transition:'all .2s' }}>
                <span style={{ fontSize:28 }}>{em}</span>
                <span style={{ fontSize:11, fontWeight:600, color:mood===i+1?'var(--accent)':'var(--text3)' }}>{label}</span>
              </button>
            ))}
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.5px', textTransform:'uppercase', display:'block', marginBottom:7 }}>Tomorrow's intention</label>
            <textarea value={tomorrowIntent} onChange={e=>setTomorrowIntent(e.target.value)} placeholder="Tomorrow I will start DSA at 8pm sharp and hit 9 glasses..." style={{ width:'100%', minHeight:80, resize:'none', lineHeight:1.75, padding:'12px', borderRadius:10, fontSize:13 }}/>
          </div>
        </div>
      )
    },
    {
      title: "Sleep Intention", emoji: '🌙',
      content: (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ padding:'16px', background:'var(--purple-bg)', borderRadius:12, border:'1.5px solid var(--purple)', marginBottom:4 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--purple)', marginBottom:4 }}>🎯 Your sleep target tonight</div>
            <div style={{ fontSize:12, color:'var(--text3)', lineHeight:1.65 }}>Set an intention. Tomorrow morning, Stride will check if you hit it.</div>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.5px', textTransform:'uppercase', display:'block', marginBottom:7 }}>Sleep by</label>
            <input type="time" value={sleepGoal} onChange={e=>setSleepGoal(e.target.value)} style={{ width:'100%' }}/>
          </div>
          {lastSleep && (
            <div style={{ padding:'12px 14px', background:'var(--surface3)', borderRadius:10, border:'1.5px solid var(--border)' }}>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:3, fontFamily:"'JetBrains Mono',monospace" }}>Last night</div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{lastSleep.dur} · {lastSleep.bed} → {lastSleep.wake}</div>
            </div>
          )}
        </div>
      )
    },
  ];

  const current = steps[step];
  const isLast  = step === steps.length - 1;

  function handleNext() {
    if (isLast) {
      onSave({ win, improve, mood, sleepGoal, tomorrowIntent, date: new Date().toDateString() });
      onClose();
    } else {
      setStep(s=>s+1);
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9998, background:'rgba(0,0,0,.6)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', justifyContent:'center', fontFamily:"'Figtree',sans-serif" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:'var(--surface)', borderRadius:'20px 20px 0 0', padding:28, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', animation:'slideUp .35s cubic-bezier(.4,0,.2,1)' }}>

        {/* Handle bar */}
        <div style={{ width:40, height:4, background:'var(--border2)', borderRadius:99, margin:'0 auto 24px' }}/>

        {/* Step indicator */}
        <div style={{ display:'flex', gap:6, marginBottom:24 }}>
          {steps.map((_,i)=>(
            <div key={i} style={{ flex:1, height:3, borderRadius:99, background:i<=step?'var(--accent)':'var(--border)', transition:'background .3s' }}/>
          ))}
        </div>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:48, marginBottom:8, animation:'popIn .4s ease' }}>{current.emoji}</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'var(--text)', letterSpacing:'-0.5px' }}>{current.title}</h2>
        </div>

        {/* Content */}
        <div style={{ marginBottom:28 }}>{current.content}</div>

        {/* Navigation */}
        <div style={{ display:'flex', gap:10 }}>
          {step > 0 && (
            <button onClick={()=>setStep(s=>s-1)} style={{ flex:1, padding:'13px', borderRadius:11, border:'1.5px solid var(--border)', background:'var(--surface3)', color:'var(--text3)', fontWeight:600, cursor:'pointer', fontSize:14, fontFamily:"'Figtree',sans-serif" }}>← Back</button>
          )}
          <button onClick={handleNext} style={{ flex:2, padding:'13px', borderRadius:11, border:'none', background:'var(--accent)', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:"'Syne',sans-serif", letterSpacing:'-0.2px', boxShadow:'0 4px 16px rgba(79,70,229,.3)', transition:'all .2s' }}>
            {isLast ? '✓ Save Night Review' : 'Next →'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
        @keyframes popIn   { from { opacity:0; transform:scale(.7) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </div>
  );
}
