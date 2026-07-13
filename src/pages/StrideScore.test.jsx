import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StrideScore, { calcScore, getGrade } from './StrideScore.jsx';

const empty = { water: 0, goals: [], meals: [], slog: [], streak: { n: 0 }, warSessions: [] };

describe('calcScore', () => {
  it('returns all-zero breakdown for empty input', () => {
    const s = calcScore(empty);
    expect(s).toMatchObject({
      total: 0, sleepPts: 0, waterPts: 0, goalPts: 0,
      calPts: 0, streakPts: 0, warPts: 0, sleepHrs: 0, gDone: 0, totKcal: 0,
    });
  });

  it('awards a perfect 1000 when every metric is maxed', () => {
    const today = new Date().toDateString();
    const s = calcScore({
      water: 9,
      goals: [{ done: true }, { done: true }],
      meals: [{ kcal: 2000 }, { kcal: 1200 }],
      slog: [{ bed: '22:00', wake: '06:00' }],
      streak: { n: 30 },
      warSessions: [{ date: today }, { date: today }],
    });
    expect(s).toMatchObject({
      sleepPts: 200, waterPts: 150, goalPts: 250,
      calPts: 200, streakPts: 150, warPts: 50, total: 1000,
    });
    expect(s.sleepHrs).toBeCloseTo(8);
  });

  it('caps each component at its maximum', () => {
    const today = new Date().toDateString();
    const s = calcScore({
      water: 18,
      goals: [{ done: true }],
      meals: [{ kcal: 10000 }],
      slog: [{ bed: '20:00', wake: '10:00' }], // 14h sleep
      streak: { n: 100 },
      warSessions: [{ date: today }, { date: today }, { date: today }, { date: today }],
    });
    expect(s.sleepPts).toBe(200);
    expect(s.calPts).toBe(200);
    expect(s.streakPts).toBe(150);
    expect(s.warPts).toBe(50); // 4*25 capped at 50
    // water is uncapped in the formula: 18/9 * 150 = 300
    expect(s.waterPts).toBe(300);
  });

  it('ignores war sessions that are not from today', () => {
    const s = calcScore({ ...empty, warSessions: [{ date: 'Mon Jan 01 2001' }] });
    expect(s.warPts).toBe(0);
  });

  it('handles sleep that wraps past midnight', () => {
    const s = calcScore({ ...empty, slog: [{ bed: '23:30', wake: '07:30' }] });
    expect(s.sleepHrs).toBeCloseTo(8);
    expect(s.sleepPts).toBe(200);
  });

  it('coerces non-numeric meal calories to zero', () => {
    const s = calcScore({ ...empty, meals: [{ kcal: 'abc' }, { kcal: '500' }] });
    expect(s.totKcal).toBe(500);
  });

  it('avoids divide-by-zero when there are no goals', () => {
    const s = calcScore({ ...empty, goals: [] });
    expect(s.goalPts).toBe(0);
  });
});

describe('getGrade', () => {
  it.each([
    [1000, 'Elite'],
    [900, 'Elite'],
    [899, 'Grinder'],
    [750, 'Grinder'],
    [749, 'Building'],
    [550, 'Building'],
    [549, 'Inconsistent'],
    [350, 'Inconsistent'],
    [349, 'Sleeping On Yourself'],
    [0, 'Sleeping On Yourself'],
  ])('maps score %i to grade "%s"', (score, label) => {
    expect(getGrade(score).label).toBe(label);
  });

  it('returns emoji, color and bg for a grade', () => {
    const g = getGrade(950);
    expect(g).toHaveProperty('emoji');
    expect(g.color).toMatch(/^#/);
    expect(g.bg).toMatch(/^#/);
  });
});

describe('<StrideScore />', () => {
  it('renders the score header and total out of 1000', () => {
    render(<StrideScore {...empty} theme="light" />);
    expect(screen.getByText("TODAY'S STRIDE SCORE")).toBeInTheDocument();
    expect(screen.getByText('/ 1000')).toBeInTheDocument();
    expect(screen.getByText('Breakdown')).toBeInTheDocument();
  });
});
