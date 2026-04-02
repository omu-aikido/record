# Share Testing Patterns

Patterns for testing `apps/share` - shared TypeScript types, validations, and utilities.

## Table of Contents

- [Test Setup](#test-setup)
- [Arktype Schema Testing](#arktype-schema-testing)
- [Pure Function Testing](#pure-function-testing)
- [Class Testing](#class-testing)
- [Coverage Checklist](#coverage-checklist)

## Test Setup

```typescript
import { describe, test, expect } from 'bun:test';
import { ArkErrors } from 'arktype';

// Helper for Arktype validation results
function isValid(result: unknown): boolean {
  return !(result instanceof ArkErrors);
}
```

Import from `../index` (the share package re-exports all modules):

```typescript
import { grade, translateGrade, Role, recordQuerySchema } from '../index';
```

## Arktype Schema Testing

Test both valid and invalid cases:

```typescript
describe('schemaName', () => {
  test('should accept valid input', () => {
    const result = schemaName({ field: 'value' });
    expect(isValid(result)).toBe(true);
  });

  test('should reject missing required field', () => {
    const result = schemaName({});
    expect(isValid(result)).toBe(false);
  });

  test('should reject wrong type', () => {
    const result = schemaName({ field: 123 });
    expect(isValid(result)).toBe(false);
  });

  test('should reject null/undefined', () => {
    expect(isValid(schemaName(null))).toBe(false);
    expect(isValid(schemaName(undefined))).toBe(false);
  });
});
```

**Coverage checklist for schemas:**
- [ ] All required fields present (valid case)
- [ ] Each required field missing (individual invalid cases)
- [ ] Each field with wrong type
- [ ] Optional fields omitted (still valid)
- [ ] Null and undefined inputs
- [ ] Nested object validation (if applicable)

## Pure Function Testing

Test all branches and edge cases:

```typescript
describe('functionName()', () => {
  describe('valid inputs', () => {
    test('should handle normal case', () => {
      expect(functionName('normal')).toBe('expected');
    });

    test('should handle edge case', () => {
      expect(functionName('')).toBe('fallback');
    });
  });

  describe('invalid inputs', () => {
    test('should return fallback for null', () => {
      expect(functionName(null)).toBe('fallback');
    });

    test('should return fallback for undefined', () => {
      expect(functionName(undefined)).toBe('fallback');
    });
  });
});
```

**Example from grade.ts:**
```typescript
describe('translateGrade()', () => {
  describe('valid inputs', () => {
    test('should translate all grade names', () => {
      expect(translateGrade('無級')).toBe('無級');
      expect(translateGrade('五段')).toBe('五段');
    });

    test('should translate numeric grades', () => {
      expect(translateGrade(0)).toBe('無級');
      expect(translateGrade(-5)).toBe('五段');
    });
  });

  describe('invalid inputs', () => {
    test('should return 不明 for empty string', () => {
      expect(translateGrade('')).toBe('不明');
    });

    test('should return 不明 for out-of-range', () => {
      expect(translateGrade(6)).toBe('不明');
      expect(translateGrade(-6)).toBe('不明');
    });
  });
});
```

**Coverage checklist for functions:**
- [ ] All switch/case branches
- [ ] All if/else branches
- [ ] Default/fallback paths
- [ ] Null and undefined inputs
- [ ] Empty string/array inputs
- [ ] Boundary values (min, max, just outside range)
- [ ] Type coercion paths (string to number, etc.)

## Class Testing

Test static properties, static methods, and instance methods:

```typescript
describe('ClassName static instances', () => {
  test('should have PROPERTY value', () => {
    expect(ClassName.PROPERTY.value).toBe('expected');
  });
});

describe('ClassName.ALL', () => {
  test('should contain all instances', () => {
    expect(ClassName.ALL).toHaveLength(N);
    expect(ClassName.ALL).toContain(ClassName.INSTANCE);
  });
});

describe('ClassName.parse()', () => {
  test('should parse valid values', () => {
    expect(ClassName.parse('valid')).toBe(ClassName.INSTANCE);
  });

  test('should return undefined for invalid values', () => {
    expect(ClassName.parse('invalid')).toBeUndefined();
    expect(ClassName.parse(null)).toBeUndefined();
  });
});

describe('ClassName.fromString()', () => {
  test('should return correct instance', () => {
    expect(ClassName.fromString('valid')).toBe(ClassName.INSTANCE);
  });

  test('should return null for invalid', () => {
    expect(ClassName.fromString('invalid')).toBeNull();
  });
});

describe('instance.toString()', () => {
  test('should return string representation', () => {
    expect(ClassName.INSTANCE.toString()).toBe('value');
  });
});

describe('ClassName.compare()', () => {
  test('should return 0 for same values', () => {
    expect(ClassName.compare('a', 'a')).toBe(0);
  });

  test('should return negative when first has higher priority', () => {
    expect(ClassName.compare('high', 'low')).toBeLessThan(0);
  });

  test('should return positive when first has lower priority', () => {
    expect(ClassName.compare('low', 'high')).toBeGreaterThan(0);
  });
});
```

**Coverage checklist for classes:**
- [ ] All static properties
- [ ] ALL array contents and ordering
- [ ] Static methods with valid inputs
- [ ] Static methods with invalid inputs (null, undefined, wrong type)
- [ ] Instance methods
- [ ] Arktype type integration (if applicable)
- [ ] Comparison/sorting methods

## Running Tests

```bash
cd /Users/hal/Repo/github.com/omu-aikido/record
bun test apps/share/test/           # Run all share tests
bun test apps/share/test/grade.test.ts  # Run single test file
bun test --coverage                 # Run all with coverage
```
