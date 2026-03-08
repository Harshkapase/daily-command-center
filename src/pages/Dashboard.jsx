import { useState, useEffect, useRef } from 'react';
import Logo from '../components/Logo.jsx';
import WarMode from './WarMode.jsx';
import NightReview from './NightReview.jsx';
import StrideScore from './StrideScore.jsx';

/* ── Single universal notification sound ──────────────────────────────────── */
function playSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    // Clean two-tone chime
    [[523, 0], [659, 0.13], [784, 0.26]].forEach(([freq, delay]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t + delay);
      g.gain.setValueAtTime(0.22, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.45);
      o.start(t + delay); o.stop(t + delay + 0.5);
    });
  } catch(e) {}
}

/* ── Constants ─────────────────────────────────────────────────────────────── */
const SUBJECTS = ["DSA","DBMS","OOPS","OS","JavaScript"];
const DAYS     = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CAT = {
  shake:   { c:"#4f46e5", bg:"#ededfc", i:"🍌", label:"Shake"   },
  water:   { c:"#00a8a8", bg:"#e6f9f9", i:"💧", label:"Water"   },
  workout: { c:"#2563eb", bg:"#eff4ff", i:"💪", label:"Workout" },
  college: { c:"#7c3aed", bg:"#f0e9ff", i:"🎓", label:"College" },
  food:    { c:"#18c77c", bg:"#e6faf3", i:"🍽️", label:"Food"    },
  study:   { c:"#0ea5e9", bg:"#e0f2fe", i:"📖", label:"Study"   },
  sleep:   { c:"#d63384", bg:"#fce8f3", i:"😴", label:"Sleep"   },
};
const SC = { DSA:"#e79d13", DBMS:"#18c77c", OOPS:"#2563eb", OS:"#d63384", JavaScript:"#00a8a8" };
const MEAL_OPT = ["Banana Shake","Roti","Rice","Dal","Eggs","Paneer","Chicken","Sabzi","Salad","Milk","Bread","Fruits","Biscuits","Curd","Peanut Butter Toast","Oats"];

const DEFAULT_REM = [
  {id:1, time:"08:15", label:"Morning Shake",    msg:"Banana Shake #1 — 1021 kcal. Fuel up!",       cat:"shake",   on:true},
  {id:2, time:"09:00", label:"Workout",           msg:"40–45 min home workout. Start strong!",       cat:"workout", on:true},
  {id:3, time:"10:30", label:"Leave for College", msg:"Time to leave — 28 km commute ahead.",        cat:"college", on:true},
  {id:4, time:"13:30", label:"Lunch Break",       msg:"Have a proper lunch. Don't skip!",            cat:"food",    on:true},
  {id:5, time:"19:45", label:"Evening Shake",     msg:"Banana Shake #2 — 1021 kcal. Post-commute!", cat:"shake",   on:true},
  {id:6, time:"20:00", label:"Study Session I",   msg:"Focus block begins. Phone away!",             cat:"study",   on:true},
  {id:7, time:"22:30", label:"Dinner",            msg:"Dinner time. Roti + dal + protein.",          cat:"food",    on:true},
  {id:8, time:"23:00", label:"Study Session II",  msg:"Final session. Finish strong!",               cat:"study",   on:true},
  {id:9, time:"01:30", label:"Wind Down",         msg:"Start wrapping up. Sleep target: 2 AM.",      cat:"sleep",   on:true},
  {id:10,time:"02:00", label:"Sleep",             msg:"Rest now — muscles grow while you sleep.",    cat:"sleep",   on:true},
];
const DEFAULT_TT = {Mon:["DSA","DBMS"],Tue:["OOPS","OS"],Wed:["JavaScript","DSA"],Thu:["DBMS","OOPS"],Fri:["OS","JavaScript"],Sat:["DSA","DBMS"],Sun:[]};
const WP = {
  Mon:{f:"Push — Chest & Arms",  e:[{n:"Warm-up",s:1,r:"5 min"},{n:"Push-ups",s:3,r:"15 reps"},{n:"Wide Push-ups",s:3,r:"12 reps"},{n:"Chair Dips",s:3,r:"12 reps"},{n:"Pike Push-ups",s:3,r:"10 reps"},{n:"Plank",s:3,r:"30 sec"}]},
  Tue:{f:"Pull — Back & Biceps", e:[{n:"Warm-up",s:1,r:"5 min"},{n:"Superman Hold",s:3,r:"15 reps"},{n:"Reverse Snow Angels",s:3,r:"15 reps"},{n:"Towel Rows",s:3,r:"12 reps"},{n:"Bicycle Crunches",s:3,r:"20 reps"}]},
  Wed:{f:"Legs & Core",          e:[{n:"Warm-up",s:1,r:"5 min"},{n:"Squats",s:4,r:"20 reps"},{n:"Lunges",s:3,r:"12 each"},{n:"Glute Bridges",s:3,r:"15 reps"},{n:"Calf Raises",s:3,r:"20 reps"},{n:"Side Plank",s:3,r:"30 sec each"}]},
  Thu:{f:"Active Recovery",      e:[{n:"Stretching / Yoga",s:1,r:"15 min"},{n:"Slow Walk",s:1,r:"15 min"},{n:"Deep Breathing",s:1,r:"5 min"}]},
  Fri:{f:"Full Body Strength",   e:[{n:"Warm-up",s:1,r:"5 min"},{n:"Push-ups",s:3,r:"15 reps"},{n:"Squats",s:3,r:"20 reps"},{n:"Lunges",s:3,r:"12 each"},{n:"Chair Dips",s:3,r:"12 reps"},{n:"Plank",s:3,r:"45 sec"}]},
  Sat:{f:"Shoulders & Core",     e:[{n:"Warm-up",s:1,r:"5 min"},{n:"Pike Push-ups",s:4,r:"12 reps"},{n:"Arm Circles",s:3,r:"30 sec"},{n:"Side Plank",s:3,r:"30 sec each"},{n:"Leg Raises",s:3,r:"15 reps"},{n:"Russian Twists",s:3,r:"20 reps"}]},
  Sun:{f:"Rest Day 🌴",          e:[{n:"Complete Rest",s:0,r:"—"},{n:"Light Walk (optional)",s:1,r:"20 min"}]},
};

const t2m = t => { const [h,m] = t.split(":").map(Number); return h*60+m; };
const nowM = () => { const n = new Date(); return n.getHours()*60+n.getMinutes(); };
const fmtD = d => { if(d<=0) return "Now"; const h=Math.floor(d/60),m=d%60; return h>0?`${h}h ${m}m`:`${m}m`; };
const todayKey = () => new Date().toDateString();
const todayDay = () => DAYS[new Date().getDay()===0?6:new Date().getDay()-1];
const sv = async (k,v) => { try { await window.storage.set(k, typeof v==="string"?v:JSON.stringify(v)); } catch(e) {} };

function SH({ title, sub }) {
  return (
    <div style={{ marginBottom:22 }} className="tab-enter">
      <h2 style={{ fontFamily:"var(--fd)", fontSize:22, fontWeight:700, color:"var(--text)", marginBottom:5, letterSpacing:"-.5px" }}>{title}</h2>
      {sub && <p style={{ fontSize:13, color:"var(--text3)", lineHeight:1.55 }}>{sub}</p>}
    </div>
  );
}
function Tog({ on, toggle, color="#4f46e5" }) {
  return (
    <button className="tog" onClick={toggle} style={{ background: on ? color : 'var(--border2)' }}>
      <div className="tog-k" style={{ left: on ? '22px' : '3px' }} />
    </button>
  );
}

const TABS = [
  {k:"reminders", i:"⏰", l:"Reminders"},
  {k:"timetable", i:"📅", l:"Timetable"},
  {k:"goals",     i:"🎯", l:"Goals"},
  {k:"meals",     i:"🍽️", l:"Meals"},
  {k:"water",     i:"💧", l:"Water"},
  {k:"workout",   i:"🏋️", l:"Workout"},
  {k:"sleep",     i:"💤", l:"Sleep"},
  {k:"focus",     i:"⚔️", l:"Focus"},
  {k:"score",     i:"🏆", l:"Score"},
  {k:"notes",     i:"📝", l:"Notes"},
  {k:"settings",  i:"⚙️", l:"Settings"},
];

export default function Dashboard({ theme, toggleTheme }) {
  const [tab,setTab]        = useState("reminders");
  const [prevTab,setPrevTab]= useState("reminders");
  const [rems,setRems]      = useState(DEFAULT_REM);
  const [tt,setTt]          = useState(DEFAULT_TT);
  const [goals,setGoals]    = useState(SUBJECTS.map((s,i)=>({id:i+1,s,topic:"",target:"",done:false})));
  const [streak,setStreak]  = useState({n:0,last:""});
  const [meals,setMeals]    = useState([]);
  const [mi,setMi]          = useState({name:"",kcal:"",time:""});
  const [notes,setNotes]    = useState("");
  const [water,setWater]    = useState(0);
  const [wo,setWo]          = useState({});
  const [sleep,setSleep]    = useState({bed:"",wake:"",q:3,note:""});
  const [slog,setSlog]      = useState([]);
  const [toast,setToast]    = useState(null);
  const [notif,setNotif]    = useState(false);
  const [soundOn,setSoundOn]= useState(true);
  const [eg,setEg]          = useState(null);
  const [ttd,setTtd]        = useState(null);
  const [editRemId,setEditRemId] = useState(null);
  // New state
  const [warOpen,setWarOpen]       = useState(false);
  const [nightOpen,setNightOpen]   = useState(false);
  const [persona,setPersona]       = useState('warrior');
  const [warSessions,setWarSessions] = useState([]);
  const [nightLogs,setNightLogs]   = useState([]);
  const firedR = useRef(new Set());
  const wRef   = useRef(null);
  const [,tick] = useState(0);

  // Key for tab animation
  const [tabKey, setTabKey] = useState(0);

  useEffect(() => { const iv = setInterval(() => tick(x=>x+1), 30000); return () => clearInterval(iv); }, []);

  // Load persisted data
  useEffect(() => {
    (async () => {
      const ld = async (k,fn,raw) => { try { const r=await window.storage.get(k); if(r) fn(raw?r.value:JSON.parse(r.value)); } catch(e) {} };
      ld("hkr", setRems); ld("hktt", setTt); ld(`hkg-${todayKey()}`, setGoals); ld("hkst", setStreak);
      ld(`hkm-${todayKey()}`, setMeals); ld("hkn", v=>setNotes(v), true);
      ld(`hkw-${todayKey()}`, v=>setWater(Number(v)), true);
      ld(`hkwo-${todayKey()}`, setWo); ld("hksl", setSlog);
      ld("hksnd", v=>setSoundOn(v==="true"), true);
      ld("hkws", setWarSessions); ld("hknl", setNightLogs);
      ld("hkpersona", v=>setPersona(v), true);
      // Restore notification state & re-register SW on every app open
      const np = typeof Notification !== 'undefined' ? Notification.permission : 'default';
      if (np === 'granted') {
        setNotif(true);
        // Re-register SW and reschedule — fixes "removed from home screen" issue
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(reg => {
            if (reg.active) reg.active.postMessage({ type: 'WATER_INTERVAL' });
          });
        }
      }
    })();
  }, []);

  useEffect(() => { sv("hkr", rems); }, [rems]);
  useEffect(() => { sv("hktt", tt); }, [tt]);
  useEffect(() => { sv(`hkg-${todayKey()}`, goals); }, [goals]);
  useEffect(() => { sv(`hkm-${todayKey()}`, meals); }, [meals]);
  useEffect(() => { sv("hkn", notes); }, [notes]);
  useEffect(() => { sv(`hkw-${todayKey()}`, String(water)); }, [water]);
  useEffect(() => { sv(`hkwo-${todayKey()}`, wo); }, [wo]);
  useEffect(() => { sv("hksl", slog); }, [slog]);
  useEffect(() => { sv("hksnd", String(soundOn)); }, [soundOn]);
  useEffect(() => { sv("hkws", warSessions); }, [warSessions]);
  useEffect(() => { sv("hknl", nightLogs); }, [nightLogs]);
  useEffect(() => { sv("hkpersona", persona); }, [persona]);

  // Streak update
  useEffect(() => {
    if (goals.every(g=>g.done) && streak.last !== todayKey()) {
      const y = new Date(); y.setDate(y.getDate()-1);
      const ns = { n: streak.last===y.toDateString() ? streak.n+1 : 1, last: todayKey() };
      setStreak(ns); sv("hkst", ns);
    }
  }, [goals]);

  // Re-schedule all reminders via SW (runs whenever notif or rems change)
  useEffect(() => {
    if (!notif) return;
    const cm = nowM();
    rems.filter(r=>r.on).forEach(r => {
      let d = t2m(r.time) - cm; if (d<0) d+=1440;
      window.scheduleNotif(r.id, d*60*1000, r.label, r.msg);
    });
  }, [notif, rems]);

  // In-app reminder check (every 30s tick)
  useEffect(() => {
    const cm = nowM();
    rems.forEach(r => {
      if (!r.on) return;
      const key = `${r.id}-${todayKey()}`;
      if (Math.abs(t2m(r.time)-cm) <= 1 && !firedR.current.has(key)) {
        firedR.current.add(key); fire(r.label, r.msg, r.cat);
      }
    });
  });

  // Water reminder every 12 min
  useEffect(() => {
    if (wRef.current) clearInterval(wRef.current);
    wRef.current = setInterval(() => fire("Drink Water 💧", "Time for a glass of water!", "water"), 12*60*1000);
    return () => clearInterval(wRef.current);
  }, [notif]);

  function fire(label, msg, cat) {
    setToast({ label, msg, cat });
    setTimeout(() => setToast(null), 4500);
    if (soundOn) playSound();
    if (notif && "Notification" in window && Notification.permission === "granted")
      new Notification(label, { body: msg, icon: "/icon-192.png", vibrate: [150,80,150] });
  }

  async function enableNotif() {
    if (!("Notification" in window)) { fire("Not Supported", "Use Chrome on Android.", "sleep"); return; }
    const p = await Notification.requestPermission();
    setNotif(p === "granted");
    if (p === "granted") {
      // Re-register SW and set up water interval
      navigator.serviceWorker.ready.then(reg => {
        if (reg.active) reg.active.postMessage({ type: 'WATER_INTERVAL' });
      });
      // Reschedule all reminders immediately
      const cm = nowM();
      rems.filter(r=>r.on).forEach(r => {
        let d = t2m(r.time) - cm; if (d<0) d+=1440;
        window.scheduleNotif(r.id, d*60*1000, r.label, r.msg);
      });
      fire("Notifications On 🔔", "Reminders will fire even with screen off!", "workout");
    } else {
      fire("Denied", "Allow notifications in Chrome Settings → Site Settings.", "sleep");
    }
  }

  function switchTab(k) {
    setPrevTab(tab); setTab(k); setTabKey(x => x+1);
  }

  const cm      = nowM();
  const srem    = [...rems].sort((a,b) => { let da=t2m(a.time)-cm, db=t2m(b.time)-cm; if(da<0)da+=1440; if(db<0)db+=1440; return da-db; });
  const nxt     = srem.find(r=>r.on);
  const nxtD    = nxt ? (() => { let d=t2m(nxt.time)-cm; if(d<0)d+=1440; return d; })() : null;
  const totKcal = meals.reduce((s,m) => s+(Number(m.kcal)||0), 0);
  const todW    = WP[todayDay()];
  const todWD   = wo[todayDay()] || {};
  const gDone   = goals.filter(g=>g.done).length;
  const isDark  = theme === 'dark';

  const NavItems = ({ mode }) => TABS.map(t => {
    if (mode === "bottom") return (
      <button key={t.k} className={`bnav-btn${tab===t.k?" on":""}`} onClick={() => switchTab(t.k)}>
        <span className="bi">{t.i}</span><span>{t.l}</span>
      </button>
    );
    return (
      <button key={t.k} className={`snav${tab===t.k?" on":""}`} onClick={() => switchTab(t.k)}>
        <span style={{fontSize:14}}>{t.i}</span><span>{t.l}</span>
        {t.k==="goals" && gDone>0 && <span style={{marginLeft:"auto",fontSize:10,fontFamily:"var(--fm)",color:"var(--green)",background:"var(--green-bg)",padding:"1px 7px",borderRadius:99}}>{gDone}</span>}
      </button>
    );
  });

  return (
    <div style={{ background:"var(--bg)", height:"100%", color:"var(--text)", display:"flex", flexDirection:"column", overflow:"hidden", transition:"background .3s" }}>

      {/* ── War Mode Overlay ──────────────────────────────────────── */}
      {warOpen && (
        <WarMode
          onClose={() => setWarOpen(false)}
          persona={persona}
          sessions={warSessions}
          setSessions={setWarSessions}
          soundOn={soundOn}
        />
      )}

      {/* ── Night Review Overlay ──────────────────────────────────── */}
      {nightOpen && (
        <NightReview
          onClose={() => setNightOpen(false)}
          onSave={(entry) => setNightLogs(p=>[entry,...p.slice(0,29)])}
          goals={goals} water={water} meals={meals} slog={slog} streak={streak}
        />
      )}

      {/* ── Toast ─────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{ position:"fixed", top:16, right:16, zIndex:9999,
          background: isDark ? 'var(--surface2)' : 'var(--surface)',
          border:`1.5px solid var(--border)`,
          padding:"13px 16px", borderRadius:14, maxWidth:280,
          boxShadow:"var(--shadow-lg)", animation:"toastIn .25s ease",
          display:"flex", alignItems:"flex-start", gap:10 }}>
          <span style={{fontSize:20,lineHeight:1,flexShrink:0}}>{CAT[toast.cat]?.i||"🔔"}</span>
          <div>
            <div style={{fontWeight:700,fontSize:13,marginBottom:2,color:"var(--text)"}}>{toast.label}</div>
            <div style={{fontSize:12,color:"var(--text3)"}}>{toast.msg}</div>
          </div>
        </div>
      )}

      {/* ── Top Bar ───────────────────────────────────────────────────── */}
      <header style={{ background:"var(--surface)", borderBottom:"1.5px solid var(--border)", padding:"0 16px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56, flexShrink:0, boxShadow:"var(--shadow-sm)", transition:"background .3s, border-color .3s" }}>
        <Logo size={30} />
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          {/* Stats */}
          {[["🔥",`${streak.n}d`,"var(--gold)","var(--gold-bg)"],["💧",`${water}/9`,"var(--teal)","var(--teal-bg)"],["🎯",`${gDone}/${goals.length}`,"var(--green)","var(--green-bg)"]].map(([ic,v,c,bg])=>(
            <span key={v} style={{fontSize:11,color:c,display:"flex",alignItems:"center",gap:3,fontFamily:"var(--fm)",background:bg,padding:"3px 8px",borderRadius:7,fontWeight:600}}>{ic}<span>{v}</span></span>
          ))}
          {/* Sound */}
          <button onClick={() => setSoundOn(s=>!s)}
            style={{ background:soundOn?"var(--accent-bg)":"var(--surface3)", border:`1.5px solid ${soundOn?"var(--accent-border)":"var(--border)"}`, borderRadius:8, padding:"5px 9px", color:soundOn?"var(--accent)":"var(--text3)", fontSize:13, cursor:"pointer", transition:"all .2s" }}>
            {soundOn?"🔊":"🔇"}
          </button>
          {/* Night Review */}
          <button onClick={() => setNightOpen(true)}
            style={{ background:'var(--surface3)', border:'1.5px solid var(--border)', borderRadius:8, padding:'5px 9px', color:'var(--text3)', fontSize:14, cursor:'pointer', transition:'all .2s' }}
            title="Night Review">🌙</button>
          {/* Notification */}
          <button onClick={enableNotif}
            style={{ background:notif?"var(--green-bg)":"var(--surface3)", border:`1.5px solid ${notif?"var(--green)":"var(--border)"}`, borderRadius:8, padding:"5px 9px", color:notif?"var(--green)":"var(--text3)", fontSize:12, cursor:"pointer", fontWeight:600, transition:"all .2s" }}>
            {notif?"🔔":"🔕"}
          </button>
        </div>
      </header>

      <div style={{ display:"flex", flex:1, minHeight:0, overflow:"hidden" }}>

        {/* ── Desktop Sidebar ───────────────────────────────────────── */}
        <nav className="sidebar" style={{ width:175, background:"var(--surface)", borderRight:"1.5px solid var(--border)", padding:"14px 10px", flexDirection:"column", gap:2, flexShrink:0, overflowY:"auto", transition:"background .3s" }}>
          {nxt && (
            <div style={{ background:"var(--accent-bg)", border:"1.5px solid var(--accent-border)", borderRadius:11, padding:"11px 13px", marginBottom:12 }}>
              <div style={{ fontSize:10, color:"var(--accent)", letterSpacing:".5px", textTransform:"uppercase", marginBottom:4, fontFamily:"var(--fm)", fontWeight:600 }}>Next up</div>
              <div style={{ fontSize:12, color:"var(--text2)", fontWeight:600, marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{nxt.label}</div>
              <div style={{ fontFamily:"var(--fm)", fontSize:20, color:"var(--accent)", fontWeight:700, lineHeight:1 }}>{fmtD(nxtD)}</div>
              <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"var(--fm)", marginTop:3 }}>{nxt.time}</div>
            </div>
          )}
          <NavItems mode="sidebar" />
        </nav>

        {/* ── Main ──────────────────────────────────────────────────── */}
        <main className="main-pad" style={{ flex:1, overflowY:"auto", padding:"22px 22px 50px", minWidth:0 }}>
          <div style={{ maxWidth:660 }} key={tabKey}>

            {/* ══ REMINDERS ═════════════════════════════════════════ */}
            {tab==="reminders" && (
              <div>
                <SH title="Reminders" sub="Toggle reminders on or off. Tap any row to edit." />

                {!notif && (
                  <div className="card fu" style={{ borderColor:"var(--green)", background:"var(--green-bg)", marginBottom:16 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--green)", marginBottom:6 }}>📲 Enable Notifications</div>
                    <p style={{ fontSize:12, color:"var(--text2)", lineHeight:1.7, marginBottom:10 }}>
                      Install Stride as an app: Chrome menu → <strong>Add to Home Screen</strong>.<br/>
                      Then tap <strong>🔕</strong> above to allow notifications — they'll fire even with screen off!
                    </p>
                    <button className="btn btn-green" style={{width:"100%"}} onClick={enableNotif}>Enable Notifications</button>
                  </div>
                )}

                {srem.map((r,i) => {
                  let d = t2m(r.time)-cm; if(d<0) d+=1440;
                  const c = CAT[r.cat];
                  return (
                    <div key={r.id} className={`card fu${Math.min(i+1,5)}`}
                      style={{ borderColor:r.on?c.c+"35":"var(--border)", opacity:d>720?.4:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                        <div style={{ width:38, height:38, borderRadius:10, background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0, border:`1.5px solid ${c.c}30` }}>
                          {c.i}
                        </div>
                        <div style={{ flex:1, minWidth:0, cursor:"pointer" }} onClick={() => setEditRemId(editRemId===r.id?null:r.id)}>
                          <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:1 }}>{r.label}</div>
                          <div style={{ fontSize:11, color:"var(--text3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.msg}</div>
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0, marginRight:8 }}>
                          <div style={{ fontFamily:"var(--fm)", fontSize:12, fontWeight:600, color:r.on?c.c:"var(--text4)" }}>{r.on?fmtD(d):"—"}</div>
                          <div style={{ fontSize:10, color:"var(--text4)", fontFamily:"var(--fm)" }}>{r.time}</div>
                        </div>
                        <Tog on={r.on} color={c.c} toggle={() => setRems(p=>p.map(x=>x.id===r.id?{...x,on:!x.on}:x))} />
                      </div>
                      {editRemId===r.id && (
                        <div style={{ marginTop:11, paddingTop:11, borderTop:"1.5px solid var(--border)", display:"flex", flexDirection:"column", gap:7 }}>
                          <input value={r.label} onChange={e=>setRems(p=>p.map(x=>x.id===r.id?{...x,label:e.target.value}:x))} placeholder="Label"/>
                          <input value={r.msg} onChange={e=>setRems(p=>p.map(x=>x.id===r.id?{...x,msg:e.target.value}:x))} placeholder="Message"/>
                          <input type="time" value={r.time} onChange={e=>setRems(p=>p.map(x=>x.id===r.id?{...x,time:e.target.value}:x))} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══ TIMETABLE ══════════════════════════════════════════ */}
            {tab==="timetable" && (
              <div>
                <SH title="Weekly Timetable" sub="Your subject schedule for each day." />
                {DAYS.map((day,i) => {
                  const isT = day===todayDay();
                  return (
                    <div key={day} className={`card fu${Math.min(i+1,5)}`} style={{ borderColor:isT?"var(--accent-border)":"var(--border)", background:isT?"var(--accent-bg)":"var(--surface)" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:(tt[day].length>0||ttd===day)?10:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <span style={{ fontFamily:"var(--fm)", fontSize:13, color:isT?"var(--accent)":"var(--text3)", fontWeight:700, minWidth:30 }}>{day}</span>
                          {isT && <span className="pill" style={{ color:"var(--accent)", borderColor:"var(--accent-border)", background:"var(--surface)", fontSize:10 }}>Today</span>}
                          {tt[day].length===0&&!isT&&<span style={{fontSize:12,color:"var(--text4)"}}>Rest day 🌴</span>}
                        </div>
                        <button className="btn btn-ghost" style={{padding:"4px 12px",fontSize:11}} onClick={()=>setTtd(ttd===day?null:day)}>{ttd===day?"Done":"Edit"}</button>
                      </div>
                      {tt[day].length>0 && (
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:ttd===day?10:0 }}>
                          {tt[day].map(s=><span key={s} className="pill" style={{color:SC[s],borderColor:SC[s]+"40",background:SC[s]+"12",fontSize:11}}>{s}</span>)}
                        </div>
                      )}
                      {ttd===day && (
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap", paddingTop:10, borderTop:"1.5px solid var(--border)" }}>
                          {SUBJECTS.map(s => { const on=tt[day].includes(s); return (
                            <button key={s} onClick={() => setTt(p=>({...p,[day]:on?p[day].filter(x=>x!==s):[...p[day],s]}))}
                              style={{ padding:"5px 13px", borderRadius:8, border:`1.5px solid ${on?SC[s]+"55":"var(--border)"}`, background:on?SC[s]+"15":"var(--surface3)", color:on?SC[s]:"var(--text3)", cursor:"pointer", fontSize:12, fontWeight:600, transition:"all .15s" }}>
                              {on?"✓ ":""}{s}
                            </button>
                          ); })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══ GOALS ══════════════════════════════════════════════ */}
            {tab==="goals" && (
              <div>
                <SH title="Study Goals" sub="Set daily targets and track your streak." />
                <div className="card fu" style={{ borderColor:"var(--gold)", background:"var(--gold-bg)", marginBottom:12, display:"flex", alignItems:"center", gap:16 }}>
                  <div style={{fontSize:42,lineHeight:1}}>🔥</div>
                  <div><div style={{fontFamily:"var(--fm)",fontSize:36,color:"var(--gold)",fontWeight:700,lineHeight:1}}>{streak.n}</div><div style={{fontSize:12,color:"var(--text3)",marginTop:3,fontWeight:500}}>day streak</div></div>
                  <div style={{marginLeft:"auto",textAlign:"right"}}><div style={{fontFamily:"var(--fm)",fontSize:22,color:"var(--green)",fontWeight:700}}>{gDone}/{goals.length}</div><div style={{fontSize:11,color:"var(--text3)"}}>done today</div></div>
                </div>
                <div className="prog" style={{height:6,marginBottom:18}}><div className="prog-f" style={{width:`${(gDone/goals.length)*100}%`,background:"linear-gradient(90deg,var(--blue),var(--green))"}}/></div>
                {goals.map((g,i) => (
                  <div key={g.id} className={`card fu${Math.min(i+1,5)}`} style={{ borderColor:g.done?"var(--green)":"var(--border)", opacity:g.done?.6:1 }}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <button className={`check${g.done?" checked":""}`}
                        onClick={() => { setGoals(p=>p.map(x=>x.id===g.id?{...x,done:!x.done}:x)); if(!g.done&&soundOn)playSound(); }}
                        style={{ background:g.done?"var(--green)":"transparent", border:`2px solid ${g.done?"var(--green)":"var(--border2)"}`, color:"#fff" }}>{g.done?"✓":""}</button>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:g.done?"var(--text3)":"var(--text)",textDecoration:g.done?"line-through":"none",display:"flex",alignItems:"center",gap:7}}>
                          <span style={{width:8,height:8,borderRadius:"50%",background:SC[g.s],flexShrink:0,display:"inline-block",boxShadow:`0 0 0 2px ${SC[g.s]}30`}}/>{g.s}
                        </div>
                        {g.topic&&<div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>📌 {g.topic}</div>}
                        {g.target&&<div style={{fontSize:11,color:"var(--blue)",marginTop:1}}>🎯 {g.target}</div>}
                      </div>
                      <button className="btn btn-ghost" style={{padding:"4px 12px",fontSize:11,flexShrink:0}} onClick={()=>setEg(eg===g.id?null:g.id)}>{eg===g.id?"Done":"Edit"}</button>
                    </div>
                    {eg===g.id && (
                      <div style={{marginTop:11,paddingTop:11,borderTop:"1.5px solid var(--border)",display:"flex",flexDirection:"column",gap:7}}>
                        <input value={g.topic} onChange={e=>setGoals(p=>p.map(x=>x.id===g.id?{...x,topic:e.target.value}:x))} placeholder="Today's topic…"/>
                        <input value={g.target} onChange={e=>setGoals(p=>p.map(x=>x.id===g.id?{...x,target:e.target.value}:x))} placeholder="Target (e.g. 2 chapters, 10 questions)…"/>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ══ MEALS ══════════════════════════════════════════════ */}
            {tab==="meals" && (
              <div>
                <SH title="Calorie Log" sub="Target: ~3,200 kcal/day." />
                <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                  {[["🔥",totKcal,"kcal today",totKcal>=3000?"var(--green)":"var(--gold)"],["🎯","3,200","target","var(--text3)"],["📈",`${Math.min(Math.round((totKcal/3200)*100),100)}%`,"of goal","var(--blue)"]].map(([ic,v,l,c])=>(
                    <div key={l} className="card fu" style={{flex:1,minWidth:90,padding:"14px 16px",marginBottom:0}}>
                      <div style={{fontSize:17,marginBottom:5}}>{ic}</div>
                      <div style={{fontFamily:"var(--fm)",fontSize:20,color:c,fontWeight:700}}>{v}</div>
                      <div style={{fontSize:11,color:"var(--text3)",marginTop:2,fontWeight:500}}>{l}</div>
                    </div>
                  ))}
                </div>
                <div className="prog" style={{height:7,marginBottom:18}}><div className="prog-f" style={{width:`${Math.min((totKcal/3200)*100,100)}%`,background:"linear-gradient(90deg,var(--gold),var(--green))"}}/></div>
                <div className="card fu" style={{borderColor:"var(--green)"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--green)",marginBottom:11}}>+ Log a Meal</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <select value={mi.name} onChange={e=>setMi(p=>({...p,name:e.target.value}))}><option value="">Select food item…</option>{MEAL_OPT.map(o=><option key={o}>{o}</option>)}</select>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <input value={mi.kcal} onChange={e=>setMi(p=>({...p,kcal:e.target.value}))} placeholder="Calories" type="number"/>
                      <input value={mi.time} onChange={e=>setMi(p=>({...p,time:e.target.value}))} placeholder="Time"/>
                    </div>
                    <button className="btn btn-green" onClick={()=>{if(!mi.name)return;setMeals(p=>[...p,{...mi,id:Date.now()}]);setMi({name:"",kcal:"",time:""});if(soundOn)playSound();}}>Add Entry</button>
                  </div>
                </div>
                {meals.length===0 ? <div style={{textAlign:"center",color:"var(--text4)",fontSize:13,padding:"24px 0"}}>No meals logged yet.</div> :
                  meals.map((m,i) => (
                    <div key={m.id} className={`card fu${Math.min(i+1,5)}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div><div style={{fontSize:13,fontWeight:600}}>{m.name}</div>{m.time&&<div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--fm)",marginTop:1}}>{m.time}</div>}</div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontFamily:"var(--fm)",fontSize:13,color:"var(--gold)",fontWeight:600}}>{m.kcal} kcal</span>
                        <button onClick={()=>setMeals(p=>p.filter(x=>x.id!==m.id))} style={{background:"var(--surface3)",border:"1.5px solid var(--border)",color:"var(--text3)",width:26,height:26,borderRadius:6,cursor:"pointer",fontSize:14,fontWeight:600}}>×</button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* ══ WATER ══════════════════════════════════════════════ */}
            {tab==="water" && (
              <div>
                <SH title="Water Tracker" sub="9 glasses (≈2.25 L) daily. Auto-alert every 12 min." />
                <div className="card fu" style={{textAlign:"center",padding:"28px 18px",marginBottom:16,background:"var(--teal-bg)",borderColor:"var(--teal)"}}>
                  <div style={{fontSize:48,marginBottom:6,animation:water>=9?"pulse 1.5s infinite":""}}>{water>=9?"🌊":"💧"}</div>
                  <div style={{fontFamily:"var(--fm)",fontSize:56,fontWeight:700,color:"var(--teal)",lineHeight:1}}>{water}</div>
                  <div style={{fontSize:14,color:"var(--text2)",margin:"6px 0 3px",fontWeight:500}}>of 9 glasses today</div>
                  <div style={{fontSize:13,color:water>=9?"var(--green)":"var(--gold)",marginBottom:14,fontWeight:600}}>{water>=9?"✅ Goal reached!":`${9-water} to go`}</div>
                  <div className="prog" style={{height:8,marginBottom:16}}><div className="prog-f" style={{width:`${Math.min((water/9)*100,100)}%`,background:"linear-gradient(90deg,var(--teal),var(--blue))"}}/></div>
                  <div style={{display:"flex",justifyContent:"center",gap:14}}>
                    <button onClick={()=>setWater(w=>Math.max(0,w-1))} style={{width:48,height:48,borderRadius:"50%",fontSize:24,background:"var(--surface)",border:"1.5px solid var(--border)",cursor:"pointer",color:"var(--text)",fontWeight:700,boxShadow:"var(--shadow-sm)",transition:"transform .15s"}} onMouseDown={e=>e.currentTarget.style.transform="scale(.9)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>−</button>
                    <button onClick={()=>{setWater(w=>Math.min(15,w+1));if(soundOn)playSound();}} style={{width:48,height:48,borderRadius:"50%",fontSize:24,background:"var(--teal)",border:"none",cursor:"pointer",color:"#fff",fontWeight:700,boxShadow:"0 4px 14px rgba(0,168,168,.4)",transition:"transform .15s"}} onMouseDown={e=>e.currentTarget.style.transform="scale(.9)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>+</button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {Array.from({length:9}).map((_,i) => (
                    <button key={i} onClick={()=>{setWater(i<water?i:i+1);if(i>=water&&soundOn)playSound();}}
                      style={{background:i<water?"var(--teal-bg)":"var(--surface)",border:`1.5px solid ${i<water?"var(--teal)":"var(--border)"}`,borderRadius:11,padding:"12px 7px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all .2s",boxShadow:"var(--shadow-sm)",transform:i<water?"scale(1.02)":"scale(1)"}}>
                      <span style={{fontSize:20}}>{i<water?"🥛":"🫙"}</span>
                      <span style={{fontSize:10,color:i<water?"var(--teal)":"var(--text4)",fontFamily:"var(--fm)",fontWeight:600}}>#{i+1}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ══ WORKOUT ════════════════════════════════════════════ */}
            {tab==="workout" && (
              <div>
                <SH title="Workout Tracker" sub={`${todayDay()} — mark each set as complete.`} />
                <div className="card fu" style={{background:"var(--blue-bg)",borderColor:"var(--blue)",marginBottom:16}}>
                  <div style={{fontSize:10,color:"var(--blue)",letterSpacing:"2px",textTransform:"uppercase",marginBottom:4,fontFamily:"var(--fm)",fontWeight:700}}>{todayDay()}'s Focus</div>
                  <div style={{fontFamily:"var(--fd)",fontSize:21,color:"var(--text)",fontWeight:700}}>{todW?.f}</div>
                  <div style={{fontSize:11,color:"var(--text3)",marginTop:5,fontFamily:"var(--fm)"}}>9:00 AM · 40–45 minutes</div>
                </div>
                {todW?.e.map((ex,i) => {
                  const done=todWD[i]||[]; const total=ex.s>0?ex.s:1; const pct=Math.round((done.length/total)*100);
                  return (
                    <div key={i} className={`card fu${Math.min(i+1,5)}`}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:ex.s>0?10:0}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{ex.n}</div>
                          <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--fm)",marginTop:1}}>{ex.s>0?`${ex.s} × ${ex.r}`:ex.r}</div>
                        </div>
                        {ex.s>0&&<span style={{fontSize:11,color:pct===100?"var(--green)":"var(--text3)",fontFamily:"var(--fm)",background:pct===100?"var(--green-bg)":"var(--surface3)",padding:"3px 9px",borderRadius:6,fontWeight:600}}>{done.length}/{total}</span>}
                      </div>
                      {ex.s>0&&(<>
                        <div className="prog" style={{height:4,marginBottom:9}}><div className="prog-f" style={{width:`${pct}%`,background:pct===100?"var(--green)":"var(--blue)"}}/></div>
                        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                          {Array.from({length:ex.s}).map((_,si) => (
                            <button key={si} className={`set-chip${done.includes(si)?" on":""}`} onClick={()=>{
                              const c=[...(todWD[i]||[])];
                              if(c.includes(si)) c.splice(c.indexOf(si),1);
                              else { c.push(si); if(soundOn) playSound(); }
                              setWo(p=>({...p,[todayDay()]:{...p[todayDay()]||{},[i]:c}}));
                            }}>Set {si+1}{done.includes(si)?" ✓":""}</button>
                          ))}
                        </div>
                      </>)}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══ SLEEP ══════════════════════════════════════════════ */}
            {tab==="sleep" && (
              <div>
                <SH title="Sleep Log" sub="Target: 7 hrs minimum." />
                <div className="card fu" style={{background:"var(--purple-bg)",borderColor:"var(--purple)",marginBottom:16}}>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--purple)",marginBottom:13}}>🌙 Log tonight's sleep</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <div><label style={{fontSize:11,color:"var(--text3)",display:"block",marginBottom:4,fontFamily:"var(--fm)",fontWeight:600}}>Bedtime</label><input type="time" value={sleep.bed} onChange={e=>setSleep(p=>({...p,bed:e.target.value}))}/></div>
                    <div><label style={{fontSize:11,color:"var(--text3)",display:"block",marginBottom:4,fontFamily:"var(--fm)",fontWeight:600}}>Wake up</label><input type="time" value={sleep.wake} onChange={e=>setSleep(p=>({...p,wake:e.target.value}))}/></div>
                  </div>
                  <div style={{marginBottom:10}}>
                    <label style={{fontSize:11,color:"var(--text3)",display:"block",marginBottom:6,fontFamily:"var(--fm)",fontWeight:600}}>Quality — <span style={{color:"var(--text)"}}>{["Very Poor","Poor","Okay","Good","Excellent"][sleep.q-1]}</span></label>
                    <div style={{display:"flex",gap:11,marginBottom:2}}>
                      {["😫","😴","😐","🙂","😊"].map((em,i)=>(
                        <button key={i} onClick={()=>setSleep(p=>({...p,q:i+1}))} style={{fontSize:26,cursor:"pointer",transition:"transform .15s, opacity .15s",background:"none",border:"none",opacity:sleep.q===i+1?1:.25,transform:sleep.q===i+1?"scale(1.2)":"scale(1)"}}>{em}</button>
                      ))}
                    </div>
                  </div>
                  <input value={sleep.note} onChange={e=>setSleep(p=>({...p,note:e.target.value}))} placeholder="Notes…" style={{marginBottom:11}}/>
                  <button className="btn btn-accent" style={{width:"100%"}} onClick={()=>{
                    if(!sleep.bed||!sleep.wake) return;
                    const [bh,bm]=sleep.bed.split(":").map(Number),[wh,wm]=sleep.wake.split(":").map(Number);
                    const dur=((wh*60+wm)-(bh*60+bm)+1440)%1440;
                    const entry={...sleep,date:todayKey(),dur:`${Math.floor(dur/60)}h ${dur%60}m`,id:Date.now()};
                    setSlog(p=>[entry,...p.slice(0,13)]); setSleep({bed:"",wake:"",q:3,note:""});
                    if(soundOn) playSound(); fire("Sleep Logged",`${entry.dur} recorded.`,"sleep");
                  }}>Save Entry</button>
                </div>
                {slog.length===0 ? <div style={{textAlign:"center",color:"var(--text4)",fontSize:13,padding:"22px 0"}}>No sleep entries yet.</div> :
                  slog.map((s,i) => (
                    <div key={s.id} className={`card fu${Math.min(i+1,5)}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div><div style={{fontSize:13,fontWeight:600}}>{s.date}</div><div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--fm)",marginTop:1}}>{s.bed} → {s.wake}</div>{s.note&&<div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>{s.note}</div>}</div>
                      <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                        <span style={{fontFamily:"var(--fm)",fontSize:18,color:"var(--purple)",fontWeight:700}}>{s.dur}</span>
                        <span style={{fontSize:20}}>{["😫","😴","😐","🙂","😊"][s.q-1]}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* ══ FOCUS (WAR MODE) ═══════════════════════════════════ */}
            {tab==="focus" && (
              <div>
                <SH title="Focus Mode ⚔️" sub="Pick your persona, set a timer, go to war." />

                {/* Persona selector */}
                <div className="card fu" style={{ marginBottom:14 }}>
                  <div style={{ fontSize:12, color:'var(--text3)', fontFamily:"var(--fm)", fontWeight:600, letterSpacing:'.5px', textTransform:'uppercase', marginBottom:12 }}>Your Persona</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                    {[['monk','🧘','Monk','#00a8a8','Silence'],['warrior','⚔️','Warrior','#e5484d','Intensity'],['scholar','📚','Scholar','#4f46e5','Wisdom']].map(([key,em,label,c,desc])=>(
                      <button key={key} onClick={()=>setPersona(key)}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'14px 8px', borderRadius:12, border:`1.5px solid ${persona===key?c:' var(--border)'}`, background:persona===key?c+'12':'var(--surface3)', cursor:'pointer', transition:'all .2s' }}>
                        <span style={{ fontSize:28 }}>{em}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:persona===key?c:'var(--text3)' }}>{label}</span>
                        <span style={{ fontSize:10, color:'var(--text4)' }}>{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Launch button */}
                <button onClick={() => setWarOpen(true)}
                  style={{ width:'100%', padding:'18px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#1a0505,#2d0808)', color:'#ff6b6b', fontFamily:"var(--fd)", fontSize:20, fontWeight:800, cursor:'pointer', letterSpacing:'-0.5px', boxShadow:'0 8px 32px rgba(229,72,77,.25)', transition:'all .2s', marginBottom:16 }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                  ⚔️ Enter War Mode
                </button>

                {/* Session history */}
                {warSessions.length > 0 && (
                  <div>
                    <div style={{ fontSize:12, color:'var(--text3)', fontFamily:"var(--fm)", fontWeight:600, letterSpacing:'.5px', textTransform:'uppercase', marginBottom:10 }}>Session History</div>
                    {warSessions.slice(0,10).map((s,i) => (
                      <div key={s.id} className={`card fu${Math.min(i+1,5)}`} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', display:'flex', alignItems:'center', gap:7 }}>
                            {s.subject}
                            {s.flow && <span style={{ fontSize:10, color:'var(--gold)', background:'var(--gold-bg)', padding:'1px 7px', borderRadius:99, fontWeight:700 }}>🔥 Flow</span>}
                          </div>
                          <div style={{ fontSize:11, color:'var(--text3)', fontFamily:"var(--fm)", marginTop:2 }}>{s.date} · {s.time}</div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontFamily:"var(--fm)", fontSize:15, fontWeight:700, color:'var(--accent)' }}>{s.duration}m</div>
                          <div style={{ fontSize:16, marginTop:2 }}>{['😤','😐','🙂','🔥','⚡'][s.rating-1]}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {warSessions.length === 0 && (
                  <div style={{ textAlign:'center', color:'var(--text4)', fontSize:13, padding:'24px 0' }}>No sessions yet. Go to war. 🥷</div>
                )}
              </div>
            )}

            {/* ══ SCORE ══════════════════════════════════════════════ */}
            {tab==="score" && (
              <div>
                <SH title="Stride Score 🏆" sub="Your daily life GPA — 0 to 1000." />
                <StrideScore
                  water={water} goals={goals} meals={meals}
                  slog={slog} streak={streak} warSessions={warSessions} theme={theme}
                />
              </div>
            )}

            {/* ══ NOTES ══════════════════════════════════════════════ */}
            {tab==="notes" && (
              <div>
                <SH title="Quick Notes" sub="Auto-saved. Jot down doubts, ideas, to-dos." />
                <div style={{position:"relative"}}>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                    placeholder={"Notes, ideas, reminders…\n\n— Ask sir about recursion\n— Revise DBMS joins\n— Buy sattu"}
                    style={{width:"100%",minHeight:380,resize:"vertical",lineHeight:1.85,padding:"16px",borderRadius:"13px",fontSize:13}}/>
                  <div style={{position:"absolute",bottom:12,right:12,fontSize:10,color:"var(--text4)",fontFamily:"var(--fm)",pointerEvents:"none",background:"var(--surface3)",padding:"2px 8px",borderRadius:5}}>{notes.length} chars</div>
                </div>
              </div>
            )}

            {/* ══ SETTINGS ═══════════════════════════════════════════ */}
            {tab==="settings" && (
              <div>
                <SH title="Settings" sub="Customize Stride to your preference." />

                {/* Appearance */}
                <div className="card fu">
                  <div style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--fm)",fontWeight:600,letterSpacing:".5px",textTransform:"uppercase",marginBottom:12}}>Appearance</div>
                  <div className="setting-row">
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Theme</div>
                      <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{isDark?"Dark mode is on":"Light mode is on"}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:18}}>{isDark?"🌙":"☀️"}</span>
                      <Tog on={isDark} toggle={toggleTheme} color="var(--purple)" />
                    </div>
                  </div>
                </div>

                {/* Sound */}
                <div className="card fu1">
                  <div style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--fm)",fontWeight:600,letterSpacing:".5px",textTransform:"uppercase",marginBottom:12}}>Sound</div>
                  <div className="setting-row">
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Notification Sound</div>
                      <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>Play a chime for reminders & actions</div>
                    </div>
                    <Tog on={soundOn} toggle={()=>setSoundOn(s=>!s)} />
                  </div>
                  <div className="setting-row">
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Preview Sound</div>
                      <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>Tap to hear the notification chime</div>
                    </div>
                    <button className="btn btn-ghost" style={{padding:"6px 14px",fontSize:12}} onClick={()=>{if(soundOn)playSound();else fire("Sound is off","Turn on sound first.","study");}}>
                      ▶ Play
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div className="card fu2">
                  <div style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--fm)",fontWeight:600,letterSpacing:".5px",textTransform:"uppercase",marginBottom:12}}>Notifications</div>
                  <div className="setting-row">
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Background Alerts</div>
                      <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{notif?"Active — fires even with screen off":"Tap to enable"}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:notif?"var(--green)":"var(--border2)",display:"inline-block",boxShadow:notif?"0 0 0 3px var(--green-bg)":"none",transition:"all .3s"}}/>
                      <button className={`btn ${notif?"btn-ghost":"btn-green"}`} style={{padding:"6px 14px",fontSize:12}} onClick={enableNotif}>
                        {notif?"On ✓":"Enable"}
                      </button>
                    </div>
                  </div>
                  <div style={{marginTop:12,padding:"10px 13px",background:"var(--accent-bg)",borderRadius:9,border:"1.5px solid var(--accent-border)"}}>
                    <div style={{fontSize:12,color:"var(--accent)",fontWeight:600,marginBottom:4}}>💡 Keep notifications working</div>
                    <div style={{fontSize:12,color:"var(--text3)",lineHeight:1.7}}>
                      Install Stride as a PWA via Chrome → <strong style={{color:"var(--text2)"}}>Add to Home Screen</strong>. Opening the app from the icon re-activates all scheduled reminders automatically.
                    </div>
                  </div>
                </div>

                {/* About */}
                <div className="card fu3">
                  <div style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--fm)",fontWeight:600,letterSpacing:".5px",textTransform:"uppercase",marginBottom:12}}>About</div>
                  <div className="setting-row">
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>App Version</div>
                    <span style={{fontFamily:"var(--fm)",fontSize:12,color:"var(--text3)",background:"var(--surface3)",padding:"3px 10px",borderRadius:6}}>v2.0.0</span>
                  </div>
                  <div className="setting-row">
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Built by</div>
                    <span style={{fontSize:12,color:"var(--text3)"}}>Harsh Kapase</span>
                  </div>
                  <div className="setting-row">
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Data storage</div>
                    <span style={{fontSize:12,color:"var(--green)",fontWeight:600}}>On-device only</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bnav-bar"><NavItems mode="bottom" /></nav>
    </div>
  );
}
