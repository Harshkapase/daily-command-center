import { useState, useEffect, useRef } from 'react';
import Logo from '../components/Logo.jsx';

/* ── Web Audio ───────────────────────────────────────────────────────────── */
const actx = { c: null };
function gctx() { if (!actx.c) actx.c = new (window.AudioContext || window.webkitAudioContext)(); return actx.c; }
const SND = {
  shake:   ctx => { const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="sine";o.frequency.setValueAtTime(523,t);o.frequency.exponentialRampToValueAtTime(392,t+.4); g.gain.setValueAtTime(.35,t);g.gain.exponentialRampToValueAtTime(.001,t+.6); o.start(t);o.stop(t+.65); },
  water:   ctx => { const t=ctx.currentTime; [0,.12].forEach(d=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="sine";o.frequency.setValueAtTime(900,t+d);o.frequency.exponentialRampToValueAtTime(400,t+d+.15); g.gain.setValueAtTime(.22,t+d);g.gain.exponentialRampToValueAtTime(.001,t+d+.18); o.start(t+d);o.stop(t+d+.2); }); },
  workout: ctx => { const t=ctx.currentTime; [0,.18].forEach(d=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="square";o.frequency.setValueAtTime(660,t+d); g.gain.setValueAtTime(.15,t+d);g.gain.exponentialRampToValueAtTime(.001,t+d+.12); o.start(t+d);o.stop(t+d+.14); }); },
  college: ctx => { const t=ctx.currentTime; [[440,.0],[550,.5]].forEach(([f,s])=>{ const o=ctx.createOscillator(),g=ctx.createGain(),bq=ctx.createBiquadFilter(); bq.type="bandpass";bq.frequency.value=800; o.connect(bq);bq.connect(g);g.connect(ctx.destination); o.type="triangle";o.frequency.setValueAtTime(f,t+s); g.gain.setValueAtTime(.28,t+s);g.gain.exponentialRampToValueAtTime(.001,t+s+.35); o.start(t+s);o.stop(t+s+.4); }); },
  food:    ctx => { const t=ctx.currentTime; [523,659,784].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="sine";o.frequency.setValueAtTime(f,t+i*.12); g.gain.setValueAtTime(.2,t+i*.12);g.gain.exponentialRampToValueAtTime(.001,t+i*.12+.4); o.start(t+i*.12);o.stop(t+i*.12+.45); }); },
  study:   ctx => { const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="sine";o.frequency.setValueAtTime(741,t); g.gain.setValueAtTime(.25,t);g.gain.exponentialRampToValueAtTime(.001,t+.7); o.start(t);o.stop(t+.75); },
  sleep:   ctx => { const t=ctx.currentTime; [392,349,330,294].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="sine";o.frequency.setValueAtTime(f,t+i*.22); g.gain.setValueAtTime(.18,t+i*.22);g.gain.exponentialRampToValueAtTime(.001,t+i*.22+.35); o.start(t+i*.22);o.stop(t+i*.22+.38); }); },
};
function playSound(cat) { try { const c=gctx(); if(c.state==="suspended")c.resume(); (SND[cat]||SND.study)(c); } catch(e) {} }

/* ── Constants ───────────────────────────────────────────────────────────── */
const SUBJECTS = ["DSA","DBMS","OOPS","OS","JavaScript"];
const DAYS     = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CAT = {
  shake:   { c:"#5b5bd6", bg:"#ededfc", i:"🍌", label:"Shake",   desc:"Warm bell" },
  water:   { c:"#00a8a8", bg:"#e6f9f9", i:"💧", label:"Water",   desc:"Drop chirp" },
  workout: { c:"#2563eb", bg:"#eff4ff", i:"💪", label:"Workout", desc:"Power beep" },
  college: { c:"#7c3aed", bg:"#f0e9ff", i:"🎓", label:"College", desc:"School bell" },
  food:    { c:"#18c77c", bg:"#e6faf3", i:"🍽️", label:"Food",    desc:"Chime arp" },
  study:   { c:"#0ea5e9", bg:"#e0f2fe", i:"📖", label:"Study",   desc:"Focus ping" },
  sleep:   { c:"#d63384", bg:"#fce8f3", i:"😴", label:"Sleep",   desc:"Lullaby" },
};
const SC = { DSA:"#e79d13", DBMS:"#18c77c", OOPS:"#2563eb", OS:"#d63384", JavaScript:"#00a8a8" };
const MEAL_OPT = ["Banana Shake","Roti","Rice","Dal","Eggs","Paneer","Chicken","Sabzi","Salad","Milk","Bread","Fruits","Biscuits","Curd","Peanut Butter Toast","Oats"];
const DEFAULT_REM = [
  {id:1, time:"08:15", label:"Morning Shake",    msg:"Banana Shake #1 — 1021 kcal. Fuel up!",         cat:"shake",   on:true},
  {id:2, time:"09:00", label:"Workout",           msg:"40–45 min home workout. Start strong!",         cat:"workout", on:true},
  {id:3, time:"10:30", label:"Leave for College", msg:"Time to leave — 28 km commute ahead.",          cat:"college", on:true},
  {id:4, time:"13:30", label:"Lunch Break",       msg:"Have a proper lunch. Don't skip!",              cat:"food",    on:true},
  {id:5, time:"19:45", label:"Evening Shake",     msg:"Banana Shake #2 — 1021 kcal. Post-commute!",   cat:"shake",   on:true},
  {id:6, time:"20:00", label:"Study Session I",   msg:"Focus block begins. Phone away!",               cat:"study",   on:true},
  {id:7, time:"22:30", label:"Dinner",            msg:"Dinner time. Roti + dal + protein.",            cat:"food",    on:true},
  {id:8, time:"23:00", label:"Study Session II",  msg:"Final session. Finish strong!",                 cat:"study",   on:true},
  {id:9, time:"01:30", label:"Wind Down",         msg:"Start wrapping up. Sleep target: 2 AM.",        cat:"sleep",   on:true},
  {id:10,time:"02:00", label:"Sleep",             msg:"Rest now — muscles grow while you sleep.",      cat:"sleep",   on:true},
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

const t2m = t => { const[h,m]=t.split(":").map(Number); return h*60+m; };
const nowM = () => { const n=new Date(); return n.getHours()*60+n.getMinutes(); };
const fmtD = d => { if(d<=0)return"Now"; const h=Math.floor(d/60),m=d%60; return h>0?`${h}h ${m}m`:`${m}m`; };
const todayKey = () => new Date().toDateString();
const todayDay = () => DAYS[new Date().getDay()===0?6:new Date().getDay()-1];
const sv = async (k,v) => { try { await window.storage.set(k, typeof v==="string"?v:JSON.stringify(v)); } catch(e) {} };

/* ── Small helpers ───────────────────────────────────────────────────────── */
function SH({ title, sub }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ fontFamily:"var(--fd)", fontSize:22, fontWeight:700, color:"var(--text)", marginBottom:5, letterSpacing:"-.5px" }}>{title}</h2>
      {sub && <p style={{ fontSize:13, color:"var(--text3)", lineHeight:1.55 }}>{sub}</p>}
    </div>
  );
}
function Tog({ on, toggle, color="#5b5bd6" }) {
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
  {k:"notes",     i:"📝", l:"Notes"},
];

export default function Dashboard({ onHome }) {
  const [tab,setTab]       = useState("reminders");
  const [rems,setRems]     = useState(DEFAULT_REM);
  const [tt,setTt]         = useState(DEFAULT_TT);
  const [goals,setGoals]   = useState(SUBJECTS.map((s,i)=>({id:i+1,s,topic:"",target:"",done:false})));
  const [streak,setStreak] = useState({n:0,last:""});
  const [meals,setMeals]   = useState([]);
  const [mi,setMi]         = useState({name:"",kcal:"",time:""});
  const [notes,setNotes]   = useState("");
  const [water,setWater]   = useState(0);
  const [wo,setWo]         = useState({});
  const [sleep,setSleep]   = useState({bed:"",wake:"",q:3,note:""});
  const [slog,setSlog]     = useState([]);
  const [toast,setToast]   = useState(null);
  const [notif,setNotif]   = useState(false);
  const [soundOn,setSoundOn]= useState(true);
  const [eg,setEg]         = useState(null);
  const [ttd,setTtd]       = useState(null);
  const firedR = useRef(new Set());
  const wRef   = useRef(null);
  const [,tick] = useState(0);

  useEffect(()=>{ const iv=setInterval(()=>tick(x=>x+1),30000); return()=>clearInterval(iv); },[]);

  useEffect(()=>{
    (async()=>{
      const ld=async(k,fn,raw)=>{ try{ const r=await window.storage.get(k); if(r)fn(raw?r.value:JSON.parse(r.value)); }catch(e){} };
      ld("hkr",setRems); ld("hktt",setTt); ld(`hkg-${todayKey()}`,setGoals); ld("hkst",setStreak);
      ld(`hkm-${todayKey()}`,setMeals); ld("hkn",v=>setNotes(v),true);
      ld(`hkw-${todayKey()}`,v=>setWater(Number(v)),true); ld(`hkwo-${todayKey()}`,setWo); ld("hksl",setSlog);
      ld("hksnd",v=>setSoundOn(v==="true"),true);
    })();
  },[]);

  useEffect(()=>{ sv("hkr",rems); },[rems]);
  useEffect(()=>{ sv("hktt",tt); },[tt]);
  useEffect(()=>{ sv(`hkg-${todayKey()}`,goals); },[goals]);
  useEffect(()=>{ sv(`hkm-${todayKey()}`,meals); },[meals]);
  useEffect(()=>{ sv("hkn",notes); },[notes]);
  useEffect(()=>{ sv(`hkw-${todayKey()}`,String(water)); },[water]);
  useEffect(()=>{ sv(`hkwo-${todayKey()}`,wo); },[wo]);
  useEffect(()=>{ sv("hksl",slog); },[slog]);
  useEffect(()=>{ sv("hksnd",String(soundOn)); },[soundOn]);

  useEffect(()=>{
    if(goals.every(g=>g.done)&&streak.last!==todayKey()){
      const y=new Date(); y.setDate(y.getDate()-1);
      const ns={n:streak.last===y.toDateString()?streak.n+1:1,last:todayKey()};
      setStreak(ns); sv("hkst",ns);
    }
  },[goals]);

  useEffect(()=>{
    if(!notif) return;
    const cm=nowM();
    rems.filter(r=>r.on).forEach(r=>{
      let d=t2m(r.time)-cm; if(d<0)d+=1440;
      window.scheduleNotif(r.id, d*60*1000, r.label, r.msg);
    });
  },[notif,rems]);

  useEffect(()=>{
    const cm=nowM();
    rems.forEach(r=>{
      if(!r.on) return;
      const key=`${r.id}-${todayKey()}`;
      if(Math.abs(t2m(r.time)-cm)<=1&&!firedR.current.has(key)){
        firedR.current.add(key); fire(r.label,r.msg,r.cat);
      }
    });
  });

  useEffect(()=>{
    if(wRef.current) clearInterval(wRef.current);
    wRef.current = setInterval(()=>fire("Drink Water 💧","Time for a glass of water!","water"), 12*60*1000);
    return ()=>clearInterval(wRef.current);
  },[notif]);

  function fire(label,msg,cat){
    setToast({label,msg,cat});
    setTimeout(()=>setToast(null),5000);
    if(soundOn) playSound(cat);
    if(notif&&"Notification"in window&&Notification.permission==="granted")
      new Notification(label,{body:msg,icon:"/icon-192.png",vibrate:[200,100,200]});
  }

  async function enableNotif(){
    if(!("Notification"in window)){fire("Not Supported","Use Chrome on Android.","sleep");return;}
    const p=await Notification.requestPermission();
    setNotif(p==="granted");
    if(p==="granted"){
      navigator.serviceWorker.ready.then(reg=>{ if(reg.active) reg.active.postMessage({type:"WATER_INTERVAL"}); });
      fire("Notifications Active 🔔","Background alerts enabled!","workout");
    } else {
      fire("Permission Denied","Allow notifications in browser settings.","sleep");
    }
  }

  const cm=nowM();
  const srem=[...rems].sort((a,b)=>{ let da=t2m(a.time)-cm,db=t2m(b.time)-cm; if(da<0)da+=1440; if(db<0)db+=1440; return da-db; });
  const nxt=srem.find(r=>r.on);
  const nxtD=nxt?(()=>{ let d=t2m(nxt.time)-cm; if(d<0)d+=1440; return d; })():null;
  const totKcal=meals.reduce((s,m)=>s+(Number(m.kcal)||0),0);
  const todW=WP[todayDay()];
  const todWD=wo[todayDay()]||{};
  const gDone=goals.filter(g=>g.done).length;

  const NavItems = ({ mode }) => TABS.map(t => {
    if(mode==="bottom") return (
      <button key={t.k} className={`bnav-btn${tab===t.k?" on":""}`} onClick={()=>setTab(t.k)}>
        <span className="bi">{t.i}</span><span>{t.l}</span>
      </button>
    );
    return (
      <button key={t.k} className={`snav${tab===t.k?" on":""}`} onClick={()=>setTab(t.k)}>
        <span style={{fontSize:14}}>{t.i}</span><span>{t.l}</span>
        {t.k==="goals"&&gDone>0&&<span style={{marginLeft:"auto",fontSize:10,fontFamily:"var(--fm)",color:"var(--green)",background:"var(--green-bg)",padding:"1px 7px",borderRadius:99}}>{gDone}</span>}
      </button>
    );
  });

  return (
    <div style={{ fontFamily:"var(--fb)", background:"var(--bg)", height:"100%", color:"var(--text)", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed",top:16,right:16,zIndex:9999, background:CAT[toast.cat]?.bg||"var(--accent-bg)", color:CAT[toast.cat]?.c||"var(--accent)", border:`1.5px solid ${CAT[toast.cat]?.c||"var(--accent)"}30`, padding:"13px 16px", borderRadius:13, maxWidth:280, boxShadow:"var(--shadow-lg)", animation:"toastIn .25s ease", display:"flex", alignItems:"flex-start", gap:10 }}>
          <span style={{fontSize:19,lineHeight:1,flexShrink:0}}>{CAT[toast.cat]?.i||"🔔"}</span>
          <div>
            <div style={{fontWeight:700,fontSize:13,marginBottom:2,color:"var(--text)"}}>{toast.label}</div>
            <div style={{fontSize:12,color:"var(--text3)"}}>{toast.msg}</div>
          </div>
        </div>
      )}

      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <header style={{ background:"var(--surface)", borderBottom:"1.5px solid var(--border)", padding:"0 18px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56, flexShrink:0, position:"sticky", top:0, zIndex:100, boxShadow:"var(--shadow-sm)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={onHome} style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--text3)", fontSize:18, padding:"4px", lineHeight:1, borderRadius:7, transition:"all .2s" }}
            title="Back to home" onMouseEnter={e=>e.currentTarget.style.background="var(--surface3)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            ←
          </button>
          <Logo size={30} />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Stats */}
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {[["🔥",`${streak.n}d`,"var(--gold-bg)","var(--gold)"],["💧",`${water}/9`,"var(--teal-bg)","var(--teal)"],["🎯",`${gDone}/${goals.length}`,"var(--green-bg)","var(--green)"]].map(([ic,v,bg,c])=>(
              <span key={v} style={{ fontSize:11, color:c, display:"flex", alignItems:"center", gap:3, fontFamily:"var(--fm)", background:bg, padding:"3px 9px", borderRadius:7, fontWeight:600 }}>{ic}<span>{v}</span></span>
            ))}
          </div>
          <button onClick={()=>{setSoundOn(s=>!s);try{playSound(soundOn?"sleep":"water");}catch(e){}}}
            style={{ background:soundOn?"var(--accent-bg)":"var(--surface3)", border:`1.5px solid ${soundOn?"var(--accent-border)":"var(--border)"}`, borderRadius:8, padding:"5px 10px", color:soundOn?"var(--accent)":"var(--text3)", fontSize:13, cursor:"pointer", transition:"all .2s" }}>
            {soundOn?"🔊":"🔇"}
          </button>
          <button onClick={enableNotif}
            style={{ background:notif?"var(--green-bg)":"var(--surface3)", border:`1.5px solid ${notif?"var(--green)":"var(--border)"}`, borderRadius:8, padding:"5px 10px", color:notif?"var(--green)":"var(--text3)", fontSize:11, cursor:"pointer", fontFamily:"var(--fb)", fontWeight:600, transition:"all .2s" }}>
            {notif?"🔔 On":"🔕 Off"}
          </button>
        </div>
      </header>

      <div style={{ display:"flex", flex:1, minHeight:0, overflow:"hidden" }}>
        {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
        <nav className="sidebar" style={{ width:175, background:"var(--surface)", borderRight:"1.5px solid var(--border)", padding:"14px 10px", flexDirection:"column", gap:2, flexShrink:0, overflowY:"auto", boxShadow:"2px 0 8px rgba(0,0,0,.03)" }}>
          {/* Next up card */}
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

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="main-pad" style={{ flex:1, overflowY:"auto", padding:"22px 22px 50px", minWidth:0 }}>
          <div style={{ maxWidth:660 }}>

            {/* ── REMINDERS ─────────────────────────────────────────── */}
            {tab==="reminders" && (
              <div>
                <SH title="Reminders" sub="Each category has a unique sound. Tap the icon to preview." />
                <div className="card fu" style={{ borderColor:"var(--accent-border)", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>🎵 Reminder Sounds</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"var(--text3)" }}>Sound <Tog on={soundOn} toggle={()=>setSoundOn(s=>!s)} /></div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:7 }}>
                    {Object.entries(CAT).map(([k,v])=>(
                      <button key={k} className="sound-btn" onClick={()=>{ if(soundOn)playSound(k); }}
                        style={{ color:v.c, borderColor:v.c+"50", background:v.bg, opacity:soundOn?1:.45, cursor:soundOn?"pointer":"default" }}>
                        <span style={{fontSize:15}}>{v.i}</span>
                        <div style={{textAlign:"left"}}><div style={{fontSize:11,fontWeight:600}}>{v.label}</div><div style={{fontSize:10,opacity:.65,fontFamily:"var(--fm)"}}>{v.desc}</div></div>
                        <span style={{marginLeft:"auto",fontSize:11,opacity:.4}}>▶</span>
                      </button>
                    ))}
                  </div>
                </div>

                {!notif && (
                  <div className="card fu" style={{ borderColor:"var(--green)", background:"var(--green-bg)", marginBottom:16 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--green)", marginBottom:6 }}>📲 Enable Background Notifications</div>
                    <p style={{ fontSize:12, color:"var(--text2)", lineHeight:1.7, marginBottom:10 }}>
                      On Android Chrome, tap <strong>🔕 (bell icon)</strong> in the top bar to allow notifications. Then:<br/>
                      Chrome menu → <strong>Add to Home Screen</strong> → install as app → notifications fire even when screen is off!
                    </p>
                    <button className="btn btn-green" style={{width:"100%"}} onClick={enableNotif}>Enable Notifications</button>
                  </div>
                )}

                {srem.map((r,i)=>{
                  let d=t2m(r.time)-cm; if(d<0)d+=1440;
                  const c=CAT[r.cat];
                  return (
                    <div key={r.id} className={`card fu${Math.min(i+1,5)}`} style={{ display:"flex", alignItems:"center", gap:11, opacity:d>720?.4:1, borderColor:r.on?c.c+"35":"var(--border)" }}>
                      <button onClick={()=>{ if(soundOn)playSound(r.cat); }} style={{ width:38,height:38,borderRadius:10,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0,border:`1.5px solid ${c.c}30`,cursor:"pointer",transition:"transform .15s" }}
                        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{c.i}</button>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:1}}>{r.label}</div>
                        <div style={{fontSize:11,color:"var(--text3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.msg}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0,marginRight:8}}>
                        <div style={{fontFamily:"var(--fm)",fontSize:12,fontWeight:600,color:r.on?c.c:"var(--text4)"}}>{r.on?fmtD(d):"—"}</div>
                        <div style={{fontSize:10,color:"var(--text4)",fontFamily:"var(--fm)"}}>{r.time}</div>
                      </div>
                      <Tog on={r.on} color={c.c} toggle={()=>setRems(p=>p.map(x=>x.id===r.id?{...x,on:!x.on}:x))} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── TIMETABLE ─────────────────────────────────────────── */}
            {tab==="timetable" && (
              <div>
                <SH title="Weekly Timetable" sub="Your subject schedule. Tap Edit on any day." />
                {DAYS.map((day,i)=>{
                  const isT=day===todayDay();
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
                      {tt[day].length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:ttd===day?10:0}}>{tt[day].map(s=><span key={s} className="pill" style={{color:SC[s],borderColor:SC[s]+"40",background:SC[s]+"12",fontSize:11}}>{s}</span>)}</div>}
                      {ttd===day && (
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap", paddingTop:10, borderTop:"1.5px solid var(--border)" }}>
                          {SUBJECTS.map(s=>{ const on=tt[day].includes(s); return (
                            <button key={s} onClick={()=>setTt(p=>({...p,[day]:on?p[day].filter(x=>x!==s):[...p[day],s]}))}
                              style={{ padding:"5px 13px", borderRadius:8, border:`1.5px solid ${on?SC[s]+"55":"var(--border)"}`, background:on?SC[s]+"15":"var(--surface3)", color:on?SC[s]:"var(--text3)", cursor:"pointer", fontSize:12, fontFamily:"var(--fb)", fontWeight:600, transition:"all .15s" }}>
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

            {/* ── GOALS ─────────────────────────────────────────────── */}
            {tab==="goals" && (
              <div>
                <SH title="Study Goals" sub="Set daily targets and track your streak." />
                <div className="card fu" style={{ borderColor:"var(--gold)", background:"linear-gradient(135deg,var(--gold-bg),#fff9ec)", marginBottom:12, display:"flex", alignItems:"center", gap:16 }}>
                  <div style={{fontSize:40,lineHeight:1}}>🔥</div>
                  <div><div style={{fontFamily:"var(--fm)",fontSize:34,color:"var(--gold)",fontWeight:700,lineHeight:1}}>{streak.n}</div><div style={{fontSize:12,color:"var(--text3)",marginTop:3,fontWeight:500}}>day streak</div></div>
                  <div style={{marginLeft:"auto",textAlign:"right"}}><div style={{fontFamily:"var(--fm)",fontSize:22,color:"var(--green)",fontWeight:700}}>{gDone}/{goals.length}</div><div style={{fontSize:11,color:"var(--text3)"}}>done today</div></div>
                </div>
                <div className="prog" style={{height:6,marginBottom:18}}><div className="prog-f" style={{width:`${(gDone/goals.length)*100}%`,background:"linear-gradient(90deg,var(--blue),var(--green))"}}/></div>
                {goals.map((g,i)=>(
                  <div key={g.id} className={`card fu${Math.min(i+1,5)}`} style={{ borderColor:g.done?"var(--green)":"var(--border)", opacity:g.done?.6:1 }}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <button className="check" onClick={()=>{setGoals(p=>p.map(x=>x.id===g.id?{...x,done:!x.done}:x));if(!g.done&&soundOn)playSound("study");}}
                        style={{background:g.done?"var(--green)":"transparent",border:`2px solid ${g.done?"var(--green)":"var(--border2)"}`,color:"#fff"}}>{g.done?"✓":""}</button>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:g.done?"var(--text3)":"var(--text)",textDecoration:g.done?"line-through":"none",display:"flex",alignItems:"center",gap:7}}>
                          <span style={{width:8,height:8,borderRadius:"50%",background:SC[g.s],flexShrink:0,display:"inline-block",boxShadow:`0 0 0 2px ${SC[g.s]}30`}}/>
                          {g.s}
                        </div>
                        {g.topic&&<div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>📌 {g.topic}</div>}
                        {g.target&&<div style={{fontSize:11,color:"var(--blue)",marginTop:1}}>🎯 {g.target}</div>}
                      </div>
                      <button className="btn btn-ghost" style={{padding:"4px 12px",fontSize:11,flexShrink:0}} onClick={()=>setEg(eg===g.id?null:g.id)}>{eg===g.id?"Done":"Edit"}</button>
                    </div>
                    {eg===g.id&&<div style={{marginTop:11,paddingTop:11,borderTop:"1.5px solid var(--border)",display:"flex",flexDirection:"column",gap:7}}><input value={g.topic} onChange={e=>setGoals(p=>p.map(x=>x.id===g.id?{...x,topic:e.target.value}:x))} placeholder="Today's topic…"/><input value={g.target} onChange={e=>setGoals(p=>p.map(x=>x.id===g.id?{...x,target:e.target.value}:x))} placeholder="Target (e.g. 2 chapters, 10 questions)…"/></div>}
                  </div>
                ))}
              </div>
            )}

            {/* ── MEALS ─────────────────────────────────────────────── */}
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
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><input value={mi.kcal} onChange={e=>setMi(p=>({...p,kcal:e.target.value}))} placeholder="Calories" type="number"/><input value={mi.time} onChange={e=>setMi(p=>({...p,time:e.target.value}))} placeholder="Time"/></div>
                    <button className="btn btn-green" onClick={()=>{if(!mi.name)return;setMeals(p=>[...p,{...mi,id:Date.now()}]);setMi({name:"",kcal:"",time:""});if(soundOn)playSound("food");}}>Add Entry</button>
                  </div>
                </div>
                {meals.length===0?<div style={{textAlign:"center",color:"var(--text4)",fontSize:13,padding:"24px 0"}}>No meals logged yet.</div>:meals.map((m,i)=>(
                  <div key={m.id} className={`card fu${Math.min(i+1,5)}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:13,fontWeight:600}}>{m.name}</div>{m.time&&<div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--fm)",marginTop:1}}>{m.time}</div>}</div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontFamily:"var(--fm)",fontSize:13,color:"var(--gold)",fontWeight:600}}>{m.kcal} kcal</span><button onClick={()=>setMeals(p=>p.filter(x=>x.id!==m.id))} style={{background:"var(--surface3)",border:"1.5px solid var(--border)",color:"var(--text3)",width:26,height:26,borderRadius:6,cursor:"pointer",fontSize:14,fontWeight:600}}>×</button></div>
                  </div>
                ))}
              </div>
            )}

            {/* ── WATER ─────────────────────────────────────────────── */}
            {tab==="water" && (
              <div>
                <SH title="Water Tracker" sub="9 glasses (≈2.25 L) daily. Auto-alert every 12 min." />
                <div className="card fu" style={{textAlign:"center",padding:"28px 18px",marginBottom:16,background:"linear-gradient(135deg,var(--teal-bg),#e0ffff)",borderColor:"var(--teal)"}}>
                  <div style={{fontSize:48,marginBottom:6}}>{water>=9?"🌊":"💧"}</div>
                  <div style={{fontFamily:"var(--fm)",fontSize:56,fontWeight:700,color:"var(--teal)",lineHeight:1}}>{water}</div>
                  <div style={{fontSize:14,color:"var(--text2)",margin:"6px 0 3px",fontWeight:500}}>of 9 glasses today</div>
                  <div style={{fontSize:13,color:water>=9?"var(--green)":"var(--gold)",marginBottom:14,fontWeight:600}}>{water>=9?"✅ Goal reached!":`${9-water} to go`}</div>
                  <div className="prog" style={{height:8,marginBottom:16,background:"rgba(0,168,168,.12)"}}><div className="prog-f" style={{width:`${Math.min((water/9)*100,100)}%`,background:"linear-gradient(90deg,var(--teal),#0ea5e9)"}}/></div>
                  <div style={{display:"flex",justifyContent:"center",gap:14}}>
                    <button onClick={()=>setWater(w=>Math.max(0,w-1))} style={{width:48,height:48,borderRadius:"50%",fontSize:24,background:"var(--surface)",border:"1.5px solid var(--border)",cursor:"pointer",color:"var(--text)",fontWeight:700,boxShadow:"var(--shadow-sm)"}}>−</button>
                    <button onClick={()=>{setWater(w=>Math.min(15,w+1));if(soundOn)playSound("water");}} style={{width:48,height:48,borderRadius:"50%",fontSize:24,background:"var(--teal)",border:"none",cursor:"pointer",color:"#fff",fontWeight:700,boxShadow:"0 4px 14px rgba(0,168,168,.4)"}}>+</button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {Array.from({length:9}).map((_,i)=>(
                    <button key={i} onClick={()=>{setWater(i<water?i:i+1);if(i>=water&&soundOn)playSound("water");}}
                      style={{background:i<water?"var(--teal-bg)":"var(--surface)",border:`1.5px solid ${i<water?"var(--teal)":"var(--border)"}`,borderRadius:11,padding:"12px 7px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all .15s",boxShadow:"var(--shadow-sm)"}}>
                      <span style={{fontSize:20}}>{i<water?"🥛":"🫙"}</span>
                      <span style={{fontSize:10,color:i<water?"var(--teal)":"var(--text4)",fontFamily:"var(--fm)",fontWeight:600}}>#{i+1}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── WORKOUT ───────────────────────────────────────────── */}
            {tab==="workout" && (
              <div>
                <SH title="Workout Tracker" sub={`${todayDay()} — mark each set as complete.`} />
                <div className="card fu" style={{background:"linear-gradient(135deg,var(--blue-bg),#dbeafe)",borderColor:"var(--blue)",marginBottom:16}}>
                  <div style={{fontSize:10,color:"var(--blue)",letterSpacing:"2px",textTransform:"uppercase",marginBottom:4,fontFamily:"var(--fm)",fontWeight:700}}>{todayDay()}'s Focus</div>
                  <div style={{fontFamily:"var(--fd)",fontSize:21,color:"var(--text)",fontWeight:700}}>{todW?.f}</div>
                  <div style={{fontSize:11,color:"var(--text3)",marginTop:5,fontFamily:"var(--fm)"}}>9:00 AM · 40–45 minutes</div>
                </div>
                {todW?.e.map((ex,i)=>{
                  const done=todWD[i]||[]; const total=ex.s>0?ex.s:1; const pct=Math.round((done.length/total)*100);
                  return (
                    <div key={i} className={`card fu${Math.min(i+1,5)}`}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:ex.s>0?10:0}}>
                        <div><div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{ex.n}</div><div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--fm)",marginTop:1}}>{ex.s>0?`${ex.s} × ${ex.r}`:ex.r}</div></div>
                        {ex.s>0&&<span style={{fontSize:11,color:pct===100?"var(--green)":"var(--text3)",fontFamily:"var(--fm)",background:pct===100?"var(--green-bg)":"var(--surface3)",padding:"3px 9px",borderRadius:6,fontWeight:600}}>{done.length}/{total}</span>}
                      </div>
                      {ex.s>0&&(<>
                        <div className="prog" style={{height:4,marginBottom:9}}><div className="prog-f" style={{width:`${pct}%`,background:pct===100?"var(--green)":"var(--blue)"}}/></div>
                        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                          {Array.from({length:ex.s}).map((_,si)=>(
                            <button key={si} className={`set-chip${done.includes(si)?" on":""}`} onClick={()=>{
                              const c=[...(todWD[i]||[])];
                              if(c.includes(si))c.splice(c.indexOf(si),1);
                              else{c.push(si);if(soundOn)playSound("workout");}
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

            {/* ── SLEEP ─────────────────────────────────────────────── */}
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
                    <div style={{display:"flex",gap:11,marginBottom:2}}>{["😫","😴","😐","🙂","😊"].map((em,i)=><button key={i} onClick={()=>setSleep(p=>({...p,q:i+1}))} style={{fontSize:24,cursor:"pointer",transition:"transform .15s,opacity .15s",background:"none",border:"none",opacity:sleep.q===i+1?1:.25,transform:sleep.q===i+1?"scale(1.15)":"scale(1)"}}>{em}</button>)}</div>
                  </div>
                  <input value={sleep.note} onChange={e=>setSleep(p=>({...p,note:e.target.value}))} placeholder="Notes…" style={{marginBottom:11}}/>
                  <button className="btn btn-accent" style={{width:"100%"}} onClick={()=>{
                    if(!sleep.bed||!sleep.wake)return;
                    const[bh,bm]=sleep.bed.split(":").map(Number),[wh,wm]=sleep.wake.split(":").map(Number);
                    const dur=((wh*60+wm)-(bh*60+bm)+1440)%1440;
                    const entry={...sleep,date:todayKey(),dur:`${Math.floor(dur/60)}h ${dur%60}m`,id:Date.now()};
                    setSlog(p=>[entry,...p.slice(0,13)]); setSleep({bed:"",wake:"",q:3,note:""});
                    if(soundOn)playSound("sleep"); fire("Sleep Logged",`${entry.dur} recorded.`,"sleep");
                  }}>Save Entry</button>
                </div>
                {slog.length===0?<div style={{textAlign:"center",color:"var(--text4)",fontSize:13,padding:"22px 0"}}>No sleep entries yet.</div>:slog.map((s,i)=>(
                  <div key={s.id} className={`card fu${Math.min(i+1,5)}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:13,fontWeight:600}}>{s.date}</div><div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--fm)",marginTop:1}}>{s.bed} → {s.wake}</div>{s.note&&<div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>{s.note}</div>}</div>
                    <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}><span style={{fontFamily:"var(--fm)",fontSize:18,color:"var(--purple)",fontWeight:700}}>{s.dur}</span><span style={{fontSize:18}}>{["😫","😴","😐","🙂","😊"][s.q-1]}</span></div>
                  </div>
                ))}
              </div>
            )}

            {/* ── NOTES ─────────────────────────────────────────────── */}
            {tab==="notes" && (
              <div>
                <SH title="Quick Notes" sub="Auto-saved. Jot down doubts, ideas, to-dos." />
                <div style={{position:"relative"}}>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                    placeholder={"Notes, ideas, reminders…\n\n— Ask sir about recursion\n— Revise DBMS joins\n— Buy sattu"}
                    style={{width:"100%",minHeight:380,resize:"vertical",lineHeight:1.85,padding:"16px",borderRadius:"13px",fontSize:13,fontFamily:"var(--fb)"}}/>
                  <div style={{position:"absolute",bottom:12,right:12,fontSize:10,color:"var(--text4)",fontFamily:"var(--fm)",pointerEvents:"none",background:"var(--surface3)",padding:"2px 8px",borderRadius:5}}>{notes.length} chars</div>
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
