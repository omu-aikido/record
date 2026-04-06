import { describe, test, expect } from 'bun:test';
import { ArkErrors } from 'arktype';
import { updateAccountSchema } from '../index';

function isValid(result: unknown): boolean {
  return !(result instanceof ArkErrors);
}

describe('updateAccountSchema', () => {
  test('should accept valid full object', () => {
    const result = updateAccountSchema({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      profileImage: 'https://example.com/image.png',
    });
    expect(isValid(result)).toBe(true);
  });

  test('should accept empty object', () => {
    const result = updateAccountSchema({});
    expect(isValid(result)).toBe(true);
  });

  test('should accept partial fields', () => {
    expect(isValid(updateAccountSchema({ firstName: 'John' }))).toBe(true);
    expect(isValid(updateAccountSchema({ lastName: 'Doe' }))).toBe(true);
    expect(isValid(updateAccountSchema({ username: 'johndoe' }))).toBe(true);
    expect(isValid(updateAccountSchema({ profileImage: 'data:image/png;base64,...' }))).toBe(true);
  });

  test('should accept omitting optional fields', () => {
    expect(isValid(updateAccountSchema({}))).toBe(true);
    expect(isValid(updateAccountSchema({ lastName: 'Doe' }))).toBe(true);
  });

  test('should reject null values for optional string fields', () => {
    expect(isValid(updateAccountSchema({ firstName: null }))).toBe(false);
    expect(isValid(updateAccountSchema({ lastName: null }))).toBe(false);
    expect(isValid(updateAccountSchema({ username: null }))).toBe(false);
  });

  test('should accept any type for profileImage', () => {
    expect(isValid(updateAccountSchema({ profileImage: 'string' }))).toBe(true);
    expect(isValid(updateAccountSchema({ profileImage: 123 }))).toBe(true);
    expect(isValid(updateAccountSchema({ profileImage: null }))).toBe(true);
    expect(isValid(updateAccountSchema({ profileImage: {} }))).toBe(true);
  });

  test('should reject non-string types for string fields', () => {
    expect(isValid(updateAccountSchema({ firstName: 123 }))).toBe(false);
    expect(isValid(updateAccountSchema({ lastName: true }))).toBe(false);
    expect(isValid(updateAccountSchema({ username: {} }))).toBe(false);
  });
});
