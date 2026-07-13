import { describe, it, expect } from 'vitest';
import { PERSONAS } from './WarMode.jsx';

describe('PERSONAS', () => {
  it('defines the three expected personas', () => {
    expect(Object.keys(PERSONAS).sort()).toEqual(['monk', 'scholar', 'warrior']);
  });

  it('each persona has the fields the UI relies on', () => {
    for (const key of Object.keys(PERSONAS)) {
      const p = PERSONAS[key];
      expect(p.label).toBeTruthy();
      expect(p.emoji).toBeTruthy();
      expect(p.quote).toBeTruthy();
      expect(p.color).toMatch(/^#[0-9a-f]{3,6}$/i);
      expect(p.accent).toMatch(/^#[0-9a-f]{3,6}$/i);
      expect(p.bg).toMatch(/^#[0-9a-f]{3,6}$/i);
    }
  });
});
