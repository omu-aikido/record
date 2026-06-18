import { describe, test, expect } from 'bun:test';
import { ArkErrors } from 'arktype';
import { AccountMetadata, AccountInfo, formatDateSlash, isProfileComplete } from '../index';

function isValid(result: unknown): boolean {
  return !(result instanceof ArkErrors);
}

describe('AccountMetadata', () => {
  test('should accept valid full object', () => {
    const result = AccountMetadata({
      role: 'admin',
      grade: 3,
      getGradeAt: '2024-01-01',
      joinedAt: 2024,
      year: 'b1',
      birthday: '2001-02-03',
    });
    expect(isValid(result)).toBe(true);
  });

  test('should accept valid string grade', () => {
    const result = AccountMetadata({
      role: 'member',
      grade: '2',
      getGradeAt: null,
      joinedAt: '2024',
      year: 'm1',
      birthday: '2001-02-03',
    });
    expect(isValid(result)).toBe(true);
  });

  test('should accept valid numeric grade within range', () => {
    expect(
      isValid(
        AccountMetadata({ role: 'member', grade: -5, getGradeAt: null, joinedAt: 2024, year: 'b1', birthday: null })
      )
    ).toBe(true);
    expect(
      isValid(AccountMetadata({ role: 'member', grade: 5, getGradeAt: null, joinedAt: 2024, year: 'b1', birthday: '' }))
    ).toBe(true);
    expect(
      isValid(
        AccountMetadata({
          role: 'member',
          grade: 0,
          getGradeAt: null,
          joinedAt: 2024,
          year: 'b1',
          birthday: '2001-02-03',
        })
      )
    ).toBe(true);
  });

  test('should accept valid year formats', () => {
    expect(
      isValid(
        AccountMetadata({ role: 'member', grade: 0, getGradeAt: null, joinedAt: 2024, year: 'b1', birthday: null })
      )
    ).toBe(true);
    expect(
      isValid(
        AccountMetadata({ role: 'member', grade: 0, getGradeAt: null, joinedAt: 2024, year: 'b4', birthday: null })
      )
    ).toBe(true);
    expect(
      isValid(
        AccountMetadata({ role: 'member', grade: 0, getGradeAt: null, joinedAt: 2024, year: 'm1', birthday: null })
      )
    ).toBe(true);
    expect(
      isValid(
        AccountMetadata({ role: 'member', grade: 0, getGradeAt: null, joinedAt: 2024, year: 'm2', birthday: null })
      )
    ).toBe(true);
    expect(
      isValid(
        AccountMetadata({ role: 'member', grade: 0, getGradeAt: null, joinedAt: 2024, year: 'd1', birthday: null })
      )
    ).toBe(true);
    expect(
      isValid(
        AccountMetadata({ role: 'member', grade: 0, getGradeAt: null, joinedAt: 2024, year: 'd2', birthday: null })
      )
    ).toBe(true);
  });

  test('should accept valid roles', () => {
    expect(
      isValid(
        AccountMetadata({ role: 'admin', grade: 0, getGradeAt: null, joinedAt: 2024, year: 'b1', birthday: null })
      )
    ).toBe(true);
    expect(
      isValid(
        AccountMetadata({ role: 'captain', grade: 0, getGradeAt: null, joinedAt: 2024, year: 'b1', birthday: null })
      )
    ).toBe(true);
    expect(
      isValid(
        AccountMetadata({
          role: 'vice-captain',
          grade: 0,
          getGradeAt: null,
          joinedAt: 2024,
          year: 'b1',
          birthday: null,
        })
      )
    ).toBe(true);
    expect(
      isValid(
        AccountMetadata({ role: 'treasurer', grade: 0, getGradeAt: null, joinedAt: 2024, year: 'b1', birthday: null })
      )
    ).toBe(true);
    expect(
      isValid(
        AccountMetadata({ role: 'member', grade: 0, getGradeAt: null, joinedAt: 2024, year: 'b1', birthday: null })
      )
    ).toBe(true);
  });

  test('should accept getGradeAt as null or empty string', () => {
    expect(
      isValid(
        AccountMetadata({ role: 'member', grade: 0, getGradeAt: null, joinedAt: 2024, year: 'b1', birthday: null })
      )
    ).toBe(true);
    expect(
      isValid(AccountMetadata({ role: 'member', grade: 0, getGradeAt: '', joinedAt: 2024, year: 'b1', birthday: null }))
    ).toBe(true);
  });

  test('should accept getGradeAt as valid date string', () => {
    const result = AccountMetadata({
      role: 'member',
      grade: 0,
      getGradeAt: '2024-06-15',
      joinedAt: 2024,
      year: 'b1',
      birthday: '2001-02-03',
    });
    expect(isValid(result)).toBe(true);
  });

  test('should accept missing birthday and missing profile fields for existing users', () => {
    const result = AccountMetadata({
      role: 'member',
      grade: null,
      getGradeAt: null,
      joinedAt: null,
      year: '',
      birthday: '',
    });
    expect(isValid(result)).toBe(true);
  });

  test('should reject invalid birthday format', () => {
    const result = AccountMetadata({
      role: 'member',
      grade: 0,
      getGradeAt: null,
      joinedAt: 2024,
      year: 'b1',
      birthday: '2001/02/03',
    });
    expect(isValid(result)).toBe(false);
  });

  test('should reject invalid role', () => {
    const result = AccountMetadata({
      role: 'invalid',
      grade: 0,
      getGradeAt: null,
      joinedAt: 2024,
      year: 'b1',
      birthday: null,
    });
    expect(isValid(result)).toBe(false);
  });

  test('should reject invalid year format', () => {
    const result = AccountMetadata({
      role: 'member',
      grade: 0,
      getGradeAt: null,
      joinedAt: 2024,
      year: 'x5',
      birthday: null,
    });
    expect(isValid(result)).toBe(false);
  });

  test('should reject invalid joinedAt (out of range)', () => {
    const result = AccountMetadata({
      role: 'member',
      grade: 0,
      getGradeAt: null,
      joinedAt: 2019,
      year: 'b1',
      birthday: null,
    });
    expect(isValid(result)).toBe(false);
  });

  test('should reject grade out of range', () => {
    expect(
      isValid(
        AccountMetadata({ role: 'member', grade: 6, getGradeAt: null, joinedAt: 2024, year: 'b1', birthday: null })
      )
    ).toBe(false);
    expect(
      isValid(
        AccountMetadata({ role: 'member', grade: -6, getGradeAt: null, joinedAt: 2024, year: 'b1', birthday: null })
      )
    ).toBe(false);
  });
});

describe('profile helpers', () => {
  test('isProfileComplete returns true when required fields exist', () => {
    expect(
      isProfileComplete({
        role: 'member',
        grade: 0,
        getGradeAt: null,
        joinedAt: 2024,
        year: 'b1',
        birthday: '2001-02-03',
      })
    ).toBe(true);
  });

  test('isProfileComplete returns false when birthday is missing', () => {
    expect(
      isProfileComplete({
        role: 'member',
        grade: 0,
        getGradeAt: null,
        joinedAt: 2024,
        year: 'b1',
        birthday: '',
      })
    ).toBe(false);
  });

  test('formatDateSlash converts profile dates for display', () => {
    expect(formatDateSlash('2001-02-03')).toBe('2001/02/03');
    expect(formatDateSlash(null)).toBe('-');
  });
});

describe('AccountInfo', () => {
  test('should accept valid full object', () => {
    const result = AccountInfo({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      profileImage: 'https://example.com/image.png',
    });
    expect(isValid(result)).toBe(true);
  });

  test('should accept empty object', () => {
    const result = AccountInfo({});
    expect(isValid(result)).toBe(true);
  });

  test('should accept partial fields', () => {
    expect(isValid(AccountInfo({ firstName: 'John' }))).toBe(true);
    expect(isValid(AccountInfo({ lastName: 'Doe' }))).toBe(true);
    expect(isValid(AccountInfo({ username: 'johndoe' }))).toBe(true);
  });

  test('should accept undefined values for optional fields', () => {
    expect(isValid(AccountInfo({ firstName: undefined }))).toBe(true);
  });

  test('should reject null values for optional string fields', () => {
    expect(isValid(AccountInfo({ firstName: null }))).toBe(false);
  });
});
