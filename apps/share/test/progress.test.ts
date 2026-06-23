import { describe, expect, test } from 'bun:test';

import {
  buildPromotionProgress,
  buildPromotionProgressFromPracticeCount,
  countPracticeDays,
  resolvePromotionSince,
} from '../src/progress';

describe('resolvePromotionSince', () => {
  test('returns getGradeAt when present', () => {
    expect(resolvePromotionSince({ getGradeAt: '2024-06-15', joinedAt: 2024 })).toBe('2024-06-15');
  });

  test('falls back to joinedAt as April 1 of the joined year', () => {
    expect(resolvePromotionSince({ getGradeAt: null, joinedAt: 2024 })).toBe('2024-04-01');
  });
});

describe('countPracticeDays', () => {
  test('converts total period to 1.5 hour practice days', () => {
    expect(countPracticeDays(4.5)).toBe(3);
  });
});

describe('buildPromotionProgress', () => {
  test('counts only activities on or after the promotion baseline', () => {
    expect(
      buildPromotionProgress({ grade: 0, getGradeAt: '2024-04-01', joinedAt: 2024 }, [
        { date: '2024-03-31', period: 1.5 },
        { date: '2024-04-01', period: 1.5 },
        { date: '2024-04-02', period: 1.5 },
        { date: '2024-04-03', period: 1.5 },
      ])
    ).toEqual({
      current: 3,
      required: 40,
      progress: 8,
      isMet: false,
    });
  });
});

describe('buildPromotionProgressFromPracticeCount', () => {
  test('builds the same promotion summary from an already counted practice total', () => {
    expect(buildPromotionProgressFromPracticeCount(0, 3)).toEqual({
      current: 3,
      required: 40,
      progress: 8,
      isMet: false,
    });
  });
});
