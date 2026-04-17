import { expect, it, describe } from 'vitest';
import { canTransition } from '../src/lib/transitions';

describe('canTransition', () => {
  // ✅ Should be allowed
  it('submitted → in_progress', () => expect(canTransition('submitted', 'in_progress')).toBe(true));
  it('submitted → rejected',    () => expect(canTransition('submitted', 'rejected')).toBe(true));
  it('in_progress → resolved',  () => expect(canTransition('in_progress', 'resolved')).toBe(true));
  it('in_progress → rejected',  () => expect(canTransition('in_progress', 'rejected')).toBe(true));
  it('resolved → closed',       () => expect(canTransition('resolved', 'closed')).toBe(true));
  it('resolved → rejected',     () => expect(canTransition('resolved', 'rejected')).toBe(true)); // ← this one was failing

  // ❌ Should be blocked
  it('closed → anything',       () => expect(canTransition('closed', 'in_progress')).toBe(false));
  it('rejected → anything',     () => expect(canTransition('rejected', 'resolved')).toBe(false));
  it('submitted → closed',      () => expect(canTransition('submitted', 'closed')).toBe(false));
});