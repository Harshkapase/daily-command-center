import { describe, it, expect, vi, afterEach } from 'vitest';
import { t2m, nowM, fmtD, todayKey, todayDay } from './Dashboard.jsx';

describe('t2m (time string → minutes since midnight)', () => {
  it('converts HH:MM to total minutes', () => {
    expect(t2m('00:00')).toBe(0);
    expect(t2m('01:30')).toBe(90);
    expect(t2m('23:59')).toBe(1439);
    expect(t2m('08:15')).toBe(495);
  });
});

describe('fmtD (minutes → human duration)', () => {
  it('returns "Now" for zero or negative input', () => {
    expect(fmtD(0)).toBe('Now');
    expect(fmtD(-5)).toBe('Now');
  });

  it('formats sub-hour durations as minutes only', () => {
    expect(fmtD(1)).toBe('1m');
    expect(fmtD(45)).toBe('45m');
  });

  it('formats hour+ durations with hours and minutes', () => {
    expect(fmtD(60)).toBe('1h 0m');
    expect(fmtD(90)).toBe('1h 30m');
    expect(fmtD(605)).toBe('10h 5m');
  });
});

describe('nowM', () => {
  afterEach(() => vi.useRealTimers());

  it('returns current wall-clock time in minutes since midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, 9, 30, 0));
    expect(nowM()).toBe(9 * 60 + 30);
  });
});

describe('todayKey', () => {
  afterEach(() => vi.useRealTimers());

  it('returns the current date as a toDateString key', () => {
    vi.useFakeTimers();
    const d = new Date(2024, 5, 15, 12, 0, 0);
    vi.setSystemTime(d);
    expect(todayKey()).toBe(d.toDateString());
  });
});

describe('todayDay (Mon-first weekday label)', () => {
  afterEach(() => vi.useRealTimers());

  it.each([
    [new Date(2024, 0, 1), 'Mon'], // Monday
    [new Date(2024, 0, 3), 'Wed'],
    [new Date(2024, 0, 6), 'Sat'],
    [new Date(2024, 0, 7), 'Sun'], // Sunday maps to end of the week
  ])('maps %s to %s', (date, label) => {
    vi.useFakeTimers();
    vi.setSystemTime(date);
    expect(todayDay()).toBe(label);
  });
});
