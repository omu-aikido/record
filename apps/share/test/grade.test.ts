import { describe, test, expect } from 'bun:test';
import { grade, translateGrade, timeForNextGrade } from '../index';

describe('grade array', () => {
  test('should have 11 entries', () => {
    expect(grade).toHaveLength(11);
  });

  test('should contain correct grade definitions', () => {
    expect(grade).toContainEqual({ name: '無級', grade: 0 });
    expect(grade).toContainEqual({ name: '五級', grade: 5 });
    expect(grade).toContainEqual({ name: '四級', grade: 4 });
    expect(grade).toContainEqual({ name: '三級', grade: 3 });
    expect(grade).toContainEqual({ name: '二級', grade: 2 });
    expect(grade).toContainEqual({ name: '一級', grade: 1 });
    expect(grade).toContainEqual({ name: '初段', grade: -1 });
    expect(grade).toContainEqual({ name: '二段', grade: -2 });
    expect(grade).toContainEqual({ name: '三段', grade: -3 });
    expect(grade).toContainEqual({ name: '四段', grade: -4 });
    expect(grade).toContainEqual({ name: '五段', grade: -5 });
  });
});

describe('translateGrade()', () => {
  describe('valid grade names', () => {
    test('should translate kyū grades', () => {
      expect(translateGrade('無級')).toBe('無級');
      expect(translateGrade('五級')).toBe('五級');
      expect(translateGrade('四級')).toBe('四級');
      expect(translateGrade('三級')).toBe('三級');
      expect(translateGrade('二級')).toBe('二級');
      expect(translateGrade('一級')).toBe('一級');
    });

    test('should translate dan grades', () => {
      expect(translateGrade('初段')).toBe('初段');
      expect(translateGrade('二段')).toBe('二段');
      expect(translateGrade('三段')).toBe('三段');
      expect(translateGrade('四段')).toBe('四段');
      expect(translateGrade('五段')).toBe('五段');
    });
  });

  describe('valid numeric grades', () => {
    test('should translate numeric grades to names', () => {
      expect(translateGrade(0)).toBe('無級');
      expect(translateGrade(5)).toBe('五級');
      expect(translateGrade(4)).toBe('四級');
      expect(translateGrade(3)).toBe('三級');
      expect(translateGrade(2)).toBe('二級');
      expect(translateGrade(1)).toBe('一級');
      expect(translateGrade(-1)).toBe('初段');
      expect(translateGrade(-2)).toBe('二段');
      expect(translateGrade(-3)).toBe('三段');
      expect(translateGrade(-4)).toBe('四段');
      expect(translateGrade(-5)).toBe('五段');
    });

    test('should translate numeric string grades', () => {
      expect(translateGrade('0')).toBe('無級');
      expect(translateGrade('5')).toBe('五級');
      expect(translateGrade('-1')).toBe('初段');
      expect(translateGrade('-5')).toBe('五段');
    });
  });

  describe('invalid inputs', () => {
    test('should return 不明 for empty string', () => {
      expect(translateGrade('')).toBe('不明');
    });

    test('should return 不明 for out-of-range numbers', () => {
      expect(translateGrade(6)).toBe('不明');
      expect(translateGrade(-6)).toBe('不明');
      expect(translateGrade(100)).toBe('不明');
    });

    test('should return 不明 for non-numeric strings', () => {
      expect(translateGrade('foo')).toBe('不明');
      expect(translateGrade('abc')).toBe('不明');
    });
  });
});

describe('timeForNextGrade()', () => {
  test('should return 40 for 無級 (0)', () => {
    expect(timeForNextGrade(0)).toBe(40);
    expect(timeForNextGrade('0')).toBe(40);
  });

  test('should return 60 for 五級 and 四級 (5, 4)', () => {
    expect(timeForNextGrade(5)).toBe(60);
    expect(timeForNextGrade(4)).toBe(60);
  });

  test('should return 80 for 三級 and 二級 (3, 2)', () => {
    expect(timeForNextGrade(3)).toBe(80);
    expect(timeForNextGrade(2)).toBe(80);
  });

  test('should return 100 for 一級 (1)', () => {
    expect(timeForNextGrade(1)).toBe(100);
    expect(timeForNextGrade('1')).toBe(100);
  });

  test('should return 200 for 初段 (-1)', () => {
    expect(timeForNextGrade(-1)).toBe(200);
    expect(timeForNextGrade('-1')).toBe(200);
  });

  test('should return 300 for higher dan grades (-2 to -5)', () => {
    expect(timeForNextGrade(-2)).toBe(300);
    expect(timeForNextGrade(-3)).toBe(300);
    expect(timeForNextGrade(-4)).toBe(300);
    expect(timeForNextGrade(-5)).toBe(300);
  });

  test('should return 300 for unknown grades', () => {
    expect(timeForNextGrade(6)).toBe(300);
    expect(timeForNextGrade(-6)).toBe(300);
    expect(timeForNextGrade('foo')).toBe(300);
  });
});
