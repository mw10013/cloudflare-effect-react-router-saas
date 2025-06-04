# Expected Errors

## Error Tracking

In Effect, if a program can fail with multiple types of errors, they are automatically tracked as a union of those error types. This ensures precise and predictable error handling.

### Example: Automatically Tracking Errors

```typescript
import { Data, Effect, Random } from "effect";

class HttpError extends Data.TaggedError("HttpError")<{}> {}
class ValidationError extends Data.TaggedError("ValidationError")<{}> {}

const program = Effect.gen(function* () {
  const n1 = yield* Random.next;
  const n2 = yield* Random.next;

  if (n1 < 0.5) return yield* Effect.fail(new HttpError());
  if (n2 < 0.5) return yield* Effect.fail(new ValidationError());

  return "some result";
});
```

The type of `program` reflects the possible errors:

```typescript
Effect<string, HttpError | ValidationError, never>;
```

---

## Short-Circuiting

Effect APIs like `Effect.gen`, `Effect.map`, and `Effect.flatMap` short-circuit execution upon encountering the first error. This ensures unnecessary computations are skipped.

### Example: Short-Circuiting Behavior

```typescript
import { Console, Effect } from "effect";

const task1 = Console.log("Executing task1...");
const task2 = Effect.fail("Something went wrong!");
const task3 = Console.log("Executing task3...");

const program = Effect.gen(function* () {
  yield* task1;
  yield* task2;
  yield* task3; // This won't execute due to task2's failure
});

Effect.runPromiseExit(program).then(console.log);
```

---

## Catching All Errors

### `Effect.either`

Transforms an effect into one that encapsulates both success and failure within an `Either` type.

```typescript
import { Data, Effect, Either, Random } from "effect";

class HttpError extends Data.TaggedError("HttpError")<{}> {}
class ValidationError extends Data.TaggedError("ValidationError")<{}> {}

const program = Effect.gen(function* () {
  const n1 = yield* Random.next;
  const n2 = yield* Random.next;

  if (n1 < 0.5) return yield* Effect.fail(new HttpError());
  if (n2 < 0.5) return yield* Effect.fail(new ValidationError());

  return "some result";
});

const recovered = Effect.gen(function* () {
  const failureOrSuccess = yield* Effect.either(program);
  return Either.match(failureOrSuccess, {
    onLeft: (error) => `Recovering from ${error._tag}`,
    onRight: (value) => value,
  });
});
```

---

### `Effect.option`

Encapsulates success or failure within the `Option` type.

```typescript
import { Effect } from "effect";

const maybe1 = Effect.option(Effect.succeed(1));
const maybe2 = Effect.option(Effect.fail("Uh oh!"));

Effect.runPromiseExit(maybe1).then(console.log);
Effect.runPromiseExit(maybe2).then(console.log);
```

---

### `Effect.catchAll`

Handles all errors by providing a fallback effect.

```typescript
import { Data, Effect, Random } from "effect";

class HttpError extends Data.TaggedError("HttpError")<{}> {}
class ValidationError extends Data.TaggedError("ValidationError")<{}> {}

const program = Effect.gen(function* () {
  const n1 = yield* Random.next;
  const n2 = yield* Random.next;

  if (n1 < 0.5) return yield* Effect.fail(new HttpError());
  if (n2 < 0.5) return yield* Effect.fail(new ValidationError());

  return "some result";
});

const recovered = program.pipe(
  Effect.catchAll((error) => Effect.succeed(`Recovering from ${error._tag}`)),
);
```

---

### `Effect.catchAllCause`

Handles both recoverable and unrecoverable errors.

```typescript
import { Cause, Effect } from "effect";

const program = Effect.fail("Something went wrong!");

const recovered = program.pipe(
  Effect.catchAllCause((cause) =>
    Cause.isFailType(cause)
      ? Effect.succeed("Recovered from a regular error")
      : Effect.succeed("Recovered from a defect"),
  ),
);

Effect.runPromise(recovered).then(console.log);
```

---

## Catching Some Errors

### `Effect.catchSome`

Selectively catches and recovers from specific errors.

```typescript
import { Data, Effect, Option, Random } from "effect";

class HttpError extends Data.TaggedError("HttpError")<{}> {}
class ValidationError extends Data.TaggedError("ValidationError")<{}> {}

const program = Effect.gen(function* () {
  const n1 = yield* Random.next;
  const n2 = yield* Random.next;

  if (n1 < 0.5) return yield* Effect.fail(new HttpError());
  if (n2 < 0.5) return yield* Effect.fail(new ValidationError());

  return "some result";
});

const recovered = program.pipe(
  Effect.catchSome((error) =>
    error._tag === "HttpError"
      ? Option.some(Effect.succeed("Recovering from HttpError"))
      : Option.none(),
  ),
);
```

---

### `Effect.catchTag`

Handles specific errors by their `_tag` field.

```typescript
import { Data, Effect, Random } from "effect";

class HttpError extends Data.TaggedError("HttpError")<{}> {}
class ValidationError extends Data.TaggedError("ValidationError")<{}> {}

const program = Effect.gen(function* () {
  const n1 = yield* Random.next;
  const n2 = yield* Random.next;

  if (n1 < 0.5) return yield* Effect.fail(new HttpError());
  if (n2 < 0.5) return yield* Effect.fail(new ValidationError());

  return "some result";
});

const recovered = program.pipe(
  Effect.catchTag("HttpError", (_HttpError) =>
    Effect.succeed("Recovering from HttpError"),
  ),
);
```

---

### `Effect.catchTags`

Handles multiple tagged error types at once.

```typescript
import { Data, Effect, Random } from "effect";

class HttpError extends Data.TaggedError("HttpError")<{}> {}
class ValidationError extends Data.TaggedError("ValidationError")<{}> {}

const program = Effect.gen(function* () {
  const n1 = yield* Random.next;
  const n2 = yield* Random.next;

  if (n1 < 0.5) return yield* Effect.fail(new HttpError());
  if (n2 < 0.5) return yield* Effect.fail(new ValidationError());

  return "some result";
});

const recovered = program.pipe(
  Effect.catchTags({
    HttpError: (_HttpError) => Effect.succeed("Recovering from HttpError"),
    ValidationError: (_ValidationError) =>
      Effect.succeed("Recovering from ValidationError"),
  }),
);
```

---
