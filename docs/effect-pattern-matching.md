# Pattern Matching

## How Pattern Matching Works

Pattern matching follows a structured process:

1. Creating a matcher. Define a `Matcher` that operates on either a specific type or value.
2. Defining patterns. Use combinators such as `Match.when`, `Match.not`, and `Match.tag` to specify matching conditions.
3. Completing the match. Apply a finalizer such as `Match.exhaustive`, `Match.orElse`, or `Match.option` to determine how unmatched cases should be handled.

## Creating a matcher

### Matching by Type

The `Match.type` constructor defines a `Matcher` that operates on a specific type. Once created, you can use patterns like `Match.when` to define conditions for handling different cases.

Example (Matching Numbers and Strings):

```typescript
import { Match } from "effect";

const match = Match.type<string | number>().pipe(
  Match.when(Match.number, (n) => `number: ${n}`),
  Match.when(Match.string, (s) => `string: ${s}`),
  Match.exhaustive,
);

console.log(match(0)); // Output: "number: 0"
console.log(match("hello")); // Output: "string: hello"
```

### Matching by Value

Instead of creating a matcher for a type, you can define one directly from a specific value using `Match.value`.

Example (Matching an Object by Property):

```typescript
import { Match } from "effect";

const input = { name: "John", age: 30 };
const result = Match.value(input).pipe(
  Match.when(
    { name: "John" },
    (user) => `${user.name} is ${user.age} years old`,
  ),
  Match.orElse(() => "Oh, not John"),
);

console.log(result); // Output: "John is 30 years old"
```

### Enforcing a Return Type

You can use `Match.withReturnType<T>()` to ensure that all branches return a specific type.

Example (Validating Return Type Consistency):

```typescript
import { Match } from "effect";

const match = Match.type<{ a: number } | { b: string }>().pipe(
  Match.withReturnType<string>(),
  Match.when({ a: Match.number }, (_) => _.a),
  Match.when({ b: Match.string }, (_) => _.b),
  Match.exhaustive,
);
```

## Defining patterns

### when

The `Match.when` function allows you to define conditions for matching values. It supports both direct value comparisons and predicate functions.

Example (Matching with Values and Predicates):

```typescript
import { Match } from "effect";

const match = Match.type<{ age: number }>().pipe(
  Match.when({ age: (age) => age > 18 }, (user) => `Age: ${user.age}`),
  Match.when({ age: 18 }, () => "You can vote"),
  Match.orElse((user) => `${user.age} is too young`),
);

console.log(match({ age: 20 })); // Output: "Age: 20"
console.log(match({ age: 18 })); // Output: "You can vote"
console.log(match({ age: 4 })); // Output: "4 is too young"
```

### not

The `Match.not` function allows you to exclude specific values while matching all others.

Example (Ignoring a Specific Value):

```typescript
import { Match } from "effect";

const match = Match.type<string | number>().pipe(
  Match.not("hi", () => "ok"),
  Match.orElse(() => "fallback"),
);

console.log(match("hello")); // Output: "ok"
console.log(match("hi")); // Output: "fallback"
```

### tag

The `Match.tag` function allows pattern matching based on the `_tag` field in a discriminated union.

Example (Matching a Discriminated Union by Tag):

```typescript
import { Match } from "effect";

type Event =
  | { readonly _tag: "fetch" }
  | { readonly _tag: "success"; readonly data: string }
  | { readonly _tag: "error"; readonly error: Error }
  | { readonly _tag: "cancel" };

const match = Match.type<Event>().pipe(
  Match.tag("fetch", "success", () => `Ok!`),
  Match.tag("error", (event) => `Error: ${event.error.message}`),
  Match.tag("cancel", () => "Cancelled"),
  Match.exhaustive,
);

console.log(match({ _tag: "success", data: "Hello" })); // Output: "Ok!"
console.log(match({ _tag: "error", error: new Error("Oops!") })); // Output: "Error: Oops!"
```

### Built-in Predicates

The `Match` module provides built-in predicates for common types, such as `Match.number`, `Match.string`, and `Match.boolean`.

Example (Using Built-in Predicates for Property Keys):

```typescript
import { Match } from "effect";

const matchPropertyKey = Match.type<PropertyKey>().pipe(
  Match.when(Match.number, (n) => `Key is a number: ${n}`),
  Match.when(Match.string, (s) => `Key is a string: ${s}`),
  Match.when(Match.symbol, (s) => `Key is a symbol: ${String(s)}`),
  Match.exhaustive,
);

console.log(matchPropertyKey(42)); // Output: "Key is a number: 42"
console.log(matchPropertyKey("username")); // Output: "Key is a string: username"
console.log(matchPropertyKey(Symbol("id"))); // Output: "Key is a symbol: Symbol(id)"
```

## Completing the match

### exhaustive

The `Match.exhaustive` method finalizes the pattern matching process by ensuring that all possible cases are accounted for.

Example (Ensuring All Cases Are Covered):

```typescript
import { Match } from "effect";

const match = Match.type<string | number>().pipe(
  Match.when(Match.number, (n) => `number: ${n}`),
  Match.exhaustive,
);
```

### orElse

The `Match.orElse` method defines a fallback value to return when no other patterns match.

Example (Providing a Default Value When No Patterns Match):

```typescript
import { Match } from "effect";

const match = Match.type<string | number>().pipe(
  Match.when("a", () => "ok"),
  Match.orElse(() => "fallback"),
);

console.log(match("a")); // Output: "ok"
console.log(match("b")); // Output: "fallback"
```

### option

`Match.option` wraps the match result in an `Option`. If a match is found, it returns `Some(value)`, otherwise, it returns `None`.

Example (Extracting a User Role with Option):

```typescript
import { Match } from "effect";

type User = { readonly role: "admin" | "editor" | "viewer" };

const getRole = Match.type<User>().pipe(
  Match.when({ role: "admin" }, () => "Has full access"),
  Match.when({ role: "editor" }, () => "Can edit content"),
  Match.option,
);

console.log(getRole({ role: "admin" })); // Output: { _id: 'Option', _tag: 'Some', value: 'Has full access' }
console.log(getRole({ role: "viewer" })); // Output: { _id: 'Option', _tag: 'None' }
```

### either

The `Match.either` method wraps the result in an `Either`, providing a structured way to distinguish between matched and unmatched cases.

Example (Extracting a User Role with Either):

```typescript
import { Match } from "effect";

type User = { readonly role: "admin" | "editor" | "viewer" };

const getRole = Match.type<User>().pipe(
  Match.when({ role: "admin" }, () => "Has full access"),
  Match.when({ role: "editor" }, () => "Can edit content"),
  Match.either,
);

console.log(getRole({ role: "admin" })); // Output: { _id: 'Either', _tag: 'Right', right: 'Has full access' }
console.log(getRole({ role: "viewer" })); // Output: { _id: 'Either', _tag: 'Left', left: { role: 'viewer' } }
```
