---
applyTo: "**/*.test.ts"
---

# Vitest Mocking Instructions

- https://laconicwit.com/vi-mock-is-a-footgun-why-vi-spyon-should-be-your-default/

## General Principles

- Prefer `vi.spyOn` over `vi.mock` for mocking module functions in tests.
- Use `vi.mock` only when you need to completely disable a dependency (e.g., logging, analytics, noisy side effects).
- Avoid the `vi.mock + vi.requireActual` pattern; use `vi.spyOn` for partial mocking.

## Why Prefer `vi.spyOn`

- `vi.spyOn` patches only the specific method you target, leaving the rest of the module intact.
- Mocks created with `vi.spyOn` are local to the test, not global to the file.
- TypeScript type safety is preserved with `vi.spyOn`; you get compile-time errors for incorrect usage.
- `vi.mock` replaces the entire module, which can break unrelated code and create hidden coupling between tests.
- `vi.mock` is hoisted and runs before any imports, which can lead to confusing and brittle test execution order.

## Best Practices

- Always import modules as namespaces for spying:

  ```ts
  import * as userService from "./userService";
  ```

- Create spies close to where they're used, inside the test:

  ```ts
  test("fetches user", () => {
    vi.spyOn(userService, "getUser").mockResolvedValue({ id: 1, name: "John" });
    // ...test logic...
  });
  ```

- Restore all spies after each test to prevent bleed:

```ts
afterEach(() => {
  vi.restoreAllMocks();
});
```

- For functions wrapped in closures (e.g., debounce/throttle), ensure you use live bindings:

```ts
// Instead of capturing the function reference:
const debounced = debounce(expensiveOperation, 300);
// Use a closure to preserve live binding:
const debounced = debounce(() => expensiveOperation(), 300);
```

## When to Use vi.mock

- Only use vi.mock for dependencies you want to fully disable (not just control behavior).
- Example:

```
vi.mock('./logger')
```
