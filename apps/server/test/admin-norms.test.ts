import { describe, expect, test } from 'bun:test';

import { buildNormSummary } from '../src/app/admin/stats';

describe('buildNormSummary', () => {
  test('calculates current, required, progress, and isMet', () => {
    const result = buildNormSummary({ grade: 0 }, [{ period: 1.5 }, { period: 1.5 }, { period: 1.5 }]);

    expect(result).toEqual({
      current: 3,
      required: 40,
      progress: 8,
      isMet: false,
    });
  });

  test('counts only activities on or after the current grade date', () => {
    const result = buildNormSummary({ grade: 0, getGradeAt: '2024-04-01' }, [
      { date: '2024-03-31', period: 1.5 },
      { date: '2024-04-01', period: 1.5 },
      { date: '2024-04-02', period: 1.5 },
    ]);

    expect(result.current).toBe(2);
    expect(result.progress).toBe(5);
  });
});
