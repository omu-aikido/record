# Bun Test Coverage

Generate tests targeting 100% coverage with `bun:test` across the monorepo.

## Workflow

1. **Identify target directory** - Determine which app (`share`, `server`, or `client`) needs tests
2. **Mirror file structure** - Create parallel `test/` directory matching source structure
3. **Generate test files** - Create `*.test.ts` for each source file
4. **Run coverage** - Execute `bun test --coverage` and identify gaps
5. **Fill gaps** - Add tests for uncovered branches, edge cases, and error paths
6. **Verify** - Confirm 100% coverage before completing

## File Mirroring

Given a source directory, create a parallel `test/` structure:

```
apps/server/src/
├── index.ts
├── app/
│   ├── admin/index.ts
│   └── user/record.ts
```

Becomes:

```
apps/server/test/
├── index.test.ts
├── app/
│   ├── admin/index.test.ts
│   └── user/record.test.ts
```

**Rules:**
- One test file per source module (1:1 mapping)
- Place tests in a separate `test/` directory (not co-located)
- Preserve nested directory structure exactly
- Use `.test.ts` extension for all test files

## Test Configuration

Project uses `bunfig.toml`:

```toml
[test]
coverage = true
coverageReporter = ["text", "lcov"]
retry = 2
randomize = true
onlyFailures = true
```

**Run tests:**
```bash
bun test                    # Run all tests
bun test --coverage         # Run with coverage report
bun test apps/share/test/   # Run specific directory
bun test path/to/file.test.ts  # Run single file
```

## Testing by App Type

| App | Test Type | Key Tools | Reference |
|-----|-----------|-----------|-----------|
| `apps/share` | Unit | `bun:test`, Arktype helpers | [share-patterns.md](references/share-patterns.md) |
| `apps/server` | API/Integration | `bun:test`, `hono/testing` | [server-patterns.md](references/server-patterns.md) |
| `apps/client` | Component | `bun:test`, `@vue/test-utils` | [client-patterns.md](references/client-patterns.md) |

## Achieving 100% Coverage

Coverage means every branch, line, and function is exercised by at least one test.

**Strategy:**
1. Run `bun test --coverage` to identify gaps
2. Read the coverage report to find uncovered lines/branches
3. Add tests specifically targeting those gaps:
   - **Branch coverage**: Test both true/false paths of conditionals
   - **Edge cases**: Test null, undefined, empty, boundary values
   - **Error paths**: Test catch blocks, error returns, validation failures
   - **Default cases**: Test switch default, fallback values
4. Repeat until coverage reaches 100%

**Test structure pattern:**
```typescript
import { describe, test, expect } from 'bun:test';

describe('functionName', () => {
  describe('valid inputs', () => {
    test('should handle case X', () => { ... });
    test('should handle case Y', () => { ... });
  });

  describe('invalid inputs', () => {
    test('should handle error case A', () => { ... });
    test('should handle error case B', () => { ... });
  });
});
```

## Key Principles

1. **Test behavior, not implementation** - Assert outputs and side effects, not internal state
2. **One assertion per test** when possible - Makes failures easier to diagnose
3. **Descriptive test names** - Explain what is being tested and expected result
4. **Boundary value testing** - Test min, max, just-outside-range values
5. **Mock external dependencies** - Isolate the unit under test
6. **Follow existing patterns** - Match the style of existing tests in `apps/share/test/`
