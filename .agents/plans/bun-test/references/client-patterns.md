# Client Testing Patterns

Patterns for testing `apps/client` - Vue 3 components, composables, and pages.

## Table of Contents

- [Test Setup](#test-setup)
- [Composable Testing](#composable-testing)
- [Component Testing](#component-testing)
- [Page Testing](#page-testing)
- [Mocking Dependencies](#mocking-dependencies)
- [Coverage Checklist](#coverage-checklist)

## Test Setup

```typescript
import { describe, test, expect, beforeEach } from 'bun:test';
import { mount, shallowMount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
```

## Composable Testing

### Simple composables (reactivity APIs only)

Test directly without wrapper:

```typescript
import { useCounter } from '../../src/composable/useCounter';

describe('useCounter', () => {
  test('should initialize with 0', () => {
    const { count } = useCounter();
    expect(count.value).toBe(0);
  });

  test('should increment', () => {
    const { count, increment } = useCounter();
    increment();
    expect(count.value).toBe(1);
  });
});
```

### Composables with lifecycle hooks or provide/inject

Use `withSetup` helper:

```typescript
import { createApp } from 'vue';

function withSetup<T>(composable: () => T): [T, ReturnType<typeof createApp>] {
  let result: T;
  const app = createApp({
    setup() {
      result = composable();
      return () => null;
    }
  });
  app.mount(document.createElement('div'));
  return [result!, app];
}
```

Usage:

```typescript
import { useAuth } from '../../src/composable/useAuth';

describe('useAuth', () => {
  test('should provide auth state', () => {
    const [result, app] = withSetup(() => useAuth());

    expect(result.isAuthenticated.value).toBe(false);
    expect(result.user.value).toBeNull();

    app.unmount();
  });

  test('should update on auth change', async () => {
    const [result, app] = withSetup(() => useAuth());

    // Simulate auth change
    result.login({ id: 'user_123' });
    await nextTick();

    expect(result.isAuthenticated.value).toBe(true);

    app.unmount();
  });
});
```

### Composables with TanStack Query

Mock the query client:

```typescript
import { useActivity } from '../../src/composable/useActivity';

describe('useActivity', () => {
  test('should fetch activities', async () => {
    const [result, app] = withSetup(() => useActivity());

    expect(result.isLoading.value).toBe(true);
    await nextTick();
    await new Promise(r => setTimeout(r, 0));

    expect(result.data.value).toBeDefined();

    app.unmount();
  });
});
```

## Component Testing

### Basic component testing

```typescript
import MyComponent from '../../src/components/common/MyComponent.vue';

describe('MyComponent', () => {
  test('should render with default props', () => {
    const wrapper = mount(MyComponent);
    expect(wrapper.text()).toContain('default content');
  });

  test('should render with custom props', () => {
    const wrapper = mount(MyComponent, {
      props: { title: 'Custom Title' }
    });
    expect(wrapper.text()).toContain('Custom Title');
  });
});
```

### Testing user interactions

```typescript
describe('user interactions', () => {
  test('should emit event on click', async () => {
    const wrapper = mount(MyComponent);
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  test('should update on input', async () => {
    const wrapper = mount(MyComponent);
    const input = wrapper.find('input');
    await input.setValue('new value');
    expect(wrapper.emitted('update:modelValue')).toEqual([['new value']]);
  });
});
```

### Testing conditional rendering

```typescript
describe('conditional rendering', () => {
  test('should show content when visible', () => {
    const wrapper = mount(MyComponent, { props: { show: true } });
    expect(wrapper.find('.content').exists()).toBe(true);
  });

  test('should hide content when not visible', () => {
    const wrapper = mount(MyComponent, { props: { show: false } });
    expect(wrapper.find('.content').exists()).toBe(false);
  });
});
```

### Testing slots

```typescript
describe('slots', () => {
  test('should render default slot', () => {
    const wrapper = mount(MyComponent, {
      slots: { default: 'Slot content' }
    });
    expect(wrapper.text()).toContain('Slot content');
  });
});
```

## Page Testing

Test pages with mocked router and API:

```typescript
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../../src/pages/Home.vue';

describe('HomePage', () => {
  test('should render home page', () => {
    const wrapper = mount(HomePage);
    expect(wrapper.exists()).toBe(true);
  });
});
```

## Mocking Dependencies

### Mocking Hono RPC client

```typescript
import { mock } from 'bun:test';

// Mock the API client
const mockApiClient = {
  api: {
    user: {
      record: {
        $get: mock(() => Promise.resolve({ ok: true, data: [] })),
        $post: mock(() => Promise.resolve({ ok: true, data: { id: 1 } }))
      }
    }
  }
};
```

### Mocking Clerk auth

```typescript
// Mock Clerk
mockModule('@clerk/clerk-vue', () => ({
  useUser: () => ({
    isSignedIn: ref(true),
    user: ref({ id: 'user_123', fullName: 'Test User' })
  }),
  useAuth: () => ({
    isSignedIn: ref(true),
    getToken: mock(() => Promise.resolve('mock-token'))
  })
}));
```

### Mocking Vue Router

```typescript
import { createRouter, createWebHistory } from 'vue-router';

const mockRouter = {
  push: mock(() => {}),
  replace: mock(() => {}),
  back: mock(() => {}),
  currentRoute: { value: { path: '/' } }
};
```

## Coverage Checklist

For each composable:
- [ ] Initial state values
- [ ] State mutations (all methods that modify state)
- [ ] Computed values
- [ ] Lifecycle hooks (onMounted, onUnmounted)
- [ ] Error handling
- [ ] Edge cases (empty data, loading states)

For each component:
- [ ] Default rendering
- [ ] All prop variations
- [ ] User interactions (clicks, inputs, selections)
- [ ] Emitted events
- [ ] Conditional rendering (v-if, v-show)
- [ ] List rendering (v-for)
- [ ] Slot content
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

For each page:
- [ ] Page renders
- [ ] Data fetching
- [ ] Navigation
- [ ] Form submissions
- [ ] Validation errors
- [ ] Success states

## Running Tests

```bash
cd /Users/hal/Repo/github.com/omu-aikido/record
bun test apps/client/test/           # Run all client tests
bun test apps/client/test/composable/useAuth.test.ts  # Run single file
bun test --coverage                  # Run all with coverage
```
