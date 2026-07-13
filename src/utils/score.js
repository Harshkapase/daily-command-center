import { sleepDuration } from './time.js';
import { countDone, sumCalories } from './stats.js';

// Stride Score grade tiers, ordered high → low. Single source of truth for
// both the grade badge and the grade scale list.
export const GRADE_TIERS = [
  { min: 900, max: 1000, label: 'Elite',                emoji: '🏆', color: '#f5ad25', bg: '#201500' },
  { min: 750, max: 899,  label: 'Grinder',              emoji: '⚡', color: '#4f46e5', bg: '#0d0b2a' },
  { min: 550, max: 749,  label: 'Building',             emoji: '📈', color: '#18c77c', bg: '#0a2218' },
  { min: 350, max: 549,  label: 'Inconsistent',         emoji: '😐', color: '#e79d13', bg: '#201500' },
  { min: 0,   max: 349,  label: 'Sleeping On Yourself', emoji: '😴', color: '#e5484d', bg: '#1a0505' },
];

export function getGrade(score) {
  return GRADE_TIERS.find(t => score >= t.min) || GRADE_TIERS[GRADE_TIERS.length - 1];
}

export function calcScore({ water, goals, meals, slog, streak, warSessions }) {
  const gDone = countDone(goals);
  const totKcal = sumCalories(meals);
  const lastSleep = slog[0];
  const sleepDur = lastSleep ? sleepDuration(lastSleep.bed, lastSleep.wake) : 0;

  const sleepHrs = sleepDur / 60;
  const todayWar = warSessions.filter(s => s.date === new Date().toDateString());

  const sleepPts  = Math.round(Math.min(sleepHrs / 8, 1) * 200);
  const waterPts  = Math.round((water / 9) * 150);
  const goalPts   = Math.round((gDone / Math.max(goals.length, 1)) * 250);
  const calPts    = Math.round(Math.min(totKcal / 3200, 1) * 200);
  const streakPts = Math.round(Math.min(streak.n / 30, 1) * 150);
  const warPts    = Math.min(todayWar.length * 25, 50);
  const total     = sleepPts + waterPts + goalPts + calPts + streakPts + warPts;

  return { total, sleepPts, waterPts, goalPts, calPts, streakPts, warPts, sleepHrs, gDone, totKcal };
}
