export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// "HH:MM" → minutes since midnight
export const t2m = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

// Current time as minutes since midnight
export const nowM = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };

// Minutes → "1h 5m" / "5m" / "Now"
export const fmtD = d => { if (d <= 0) return "Now"; const h = Math.floor(d / 60), m = d % 60; return h > 0 ? `${h}h ${m}m` : `${m}m`; };

// Minutes → "1h 5m" (always shows hours)
export const fmtDuration = mins => `${Math.floor(mins / 60)}h ${mins % 60}m`;

export const todayKey = () => new Date().toDateString();

export const todayDay = () => DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

// Minutes slept between two "HH:MM" times, wrapping across midnight
export const sleepDuration = (bed, wake) => {
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  return ((wh * 60 + wm) - (bh * 60 + bm) + 1440) % 1440;
};
