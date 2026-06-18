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
});
