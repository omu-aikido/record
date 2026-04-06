import { describe, test, expect } from 'bun:test';
import { year, translateYear } from '../index';

describe('year array', () => {
  test('should have 8 entries', () => {
    expect(year).toHaveLength(8);
  });

  test('should contain correct undergraduate years', () => {
    expect(year).toContainEqual({ name: '1回生', year: 'b1' });
    expect(year).toContainEqual({ name: '2回生', year: 'b2' });
    expect(year).toContainEqual({ name: '3回生', year: 'b3' });
    expect(year).toContainEqual({ name: '4回生', year: 'b4' });
  });

  test('should contain correct graduate years', () => {
    expect(year).toContainEqual({ name: '修士1年', year: 'm1' });
    expect(year).toContainEqual({ name: '修士2年', year: 'm2' });
    expect(year).toContainEqual({ name: '博士1年', year: 'd1' });
    expect(year).toContainEqual({ name: '博士2年', year: 'd2' });
  });
});

describe('translateYear()', () => {
  describe('valid year codes', () => {
    test('should translate b1-b4 to undergraduate labels', () => {
      expect(translateYear('b1')).toBe('1回生');
      expect(translateYear('b2')).toBe('2回生');
      expect(translateYear('b3')).toBe('3回生');
      expect(translateYear('b4')).toBe('4回生');
    });

    test('should translate m1-m2 to master labels', () => {
      expect(translateYear('m1')).toBe('修士1年');
      expect(translateYear('m2')).toBe('修士2年');
    });

    test('should translate d1-d2 to doctoral labels', () => {
      expect(translateYear('d1')).toBe('博士1年');
      expect(translateYear('d2')).toBe('博士2年');
    });

    test('should be case insensitive', () => {
      expect(translateYear('B1')).toBe('1回生');
      expect(translateYear('M1')).toBe('修士1年');
      expect(translateYear('D2')).toBe('博士2年');
    });
  });

  describe('valid Japanese labels', () => {
    test('should translate undergraduate labels', () => {
      expect(translateYear('1回生')).toBe('1回生');
      expect(translateYear('2回生')).toBe('2回生');
      expect(translateYear('3回生')).toBe('3回生');
      expect(translateYear('4回生')).toBe('4回生');
    });

    test('should translate graduate labels', () => {
      expect(translateYear('修士1年')).toBe('修士1年');
      expect(translateYear('修士2年')).toBe('修士2年');
      expect(translateYear('博士1年')).toBe('博士1年');
      expect(translateYear('博士2年')).toBe('博士2年');
    });
  });

  describe('valid UI labels', () => {
    test('should translate undergraduate UI labels', () => {
      expect(translateYear('学部 1年')).toBe('1回生');
      expect(translateYear('学部 2年')).toBe('2回生');
      expect(translateYear('学部 3年')).toBe('3回生');
      expect(translateYear('学部 4年')).toBe('4回生');
    });

    test('should translate graduate UI labels', () => {
      expect(translateYear('修士 1年')).toBe('修士1年');
      expect(translateYear('修士 2年')).toBe('修士2年');
      expect(translateYear('博士 1年')).toBe('博士1年');
      expect(translateYear('博士 2年')).toBe('博士2年');
    });
  });

  describe('invalid inputs', () => {
    test('should return 不明 for empty string', () => {
      expect(translateYear('')).toBe('不明');
    });

    test('should return 不明 for whitespace-only string', () => {
      expect(translateYear('   ')).toBe('不明');
    });

    test('should return 不明 for unknown strings', () => {
      expect(translateYear('foo')).toBe('不明');
      expect(translateYear('x5')).toBe('不明');
      expect(translateYear('b5')).toBe('不明');
      expect(translateYear('m3')).toBe('不明');
      expect(translateYear('d3')).toBe('不明');
    });
  });
});
