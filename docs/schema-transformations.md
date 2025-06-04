# Schema Transformations

## transform

### Understanding Input and Output

Understanding Input and Output
“Output” and “input” depend on what you are doing (decoding or encoding):

When decoding:

• The source schema `Schema<SourceType, SourceEncoded>` produces a `SourceType`.
• The target schema `Schema<TargetType, TargetEncoded>` expects a `TargetEncoded`.
• The decoding path looks like this: `SourceEncoded` → `TargetType`.

If `SourceType` and `TargetEncoded` differ, you can provide a `decode` function to convert the source schema’s output into the target schema’s input.

When encoding:

• The target schema `Schema<TargetType, TargetEncoded>` produces a `TargetEncoded`.
• The source schema `Schema<SourceType, SourceEncoded>` expects a `SourceType`.
• The encoding path looks like this: `TargetType` → `SourceEncoded`.

If `TargetEncoded` and `SourceType` differ, you can provide an `encode` function to convert the target schema’s output into the source schema’s input.

### Combining Two Primitive Schemas

Combining Two Primitive Schemas
In this example, we start with a schema that accepts `"on"` or `"off"` and transform it into a boolean schema. The `decode` function turns `"on"` into `true` and `"off"` into `false`. The `encode` function does the reverse. This gives us a `Schema<boolean, "on" | "off">`.

Example (Converting a String to a Boolean)

```typescript
import { Schema } from "effect";

const BooleanFromString = Schema.transform(
  Schema.Literal("on", "off"),
  Schema.Boolean,
  {
    strict: true,
    decode: (literal) => literal === "on",
    encode: (bool) => (bool ? "on" : "off"),
  },
);

console.log(Schema.decodeUnknownSync(BooleanFromString)("on")); // Output: true
```

### Combining Two Transformation Schemas

Combining Two Transformation Schemas
Below is an example where both the source and target schemas transform their data:

• The source schema is `Schema.NumberFromString`, which is `Schema<number, string>`.
• The target schema is `BooleanFromString` (defined above), which is `Schema<boolean, "on" | "off">`.

This example involves four types and requires two conversions:

• When decoding, convert a `number` into `"on" | "off"`. For example, treat any positive number as `"on"`.
• When encoding, convert `"on" | "off"` back into a `number`. For example, treat `"on"` as `1` and `"off"` as `-1`.

Example (Combining Two Transformation Schemas)

```typescript
import { Schema } from "effect";

const BooleanFromNumericString = Schema.transform(
  Schema.NumberFromString,
  BooleanFromString,
  {
    strict: true,
    decode: (n) => (n > 0 ? "on" : "off"),
    encode: (bool) => (bool === "on" ? 1 : -1),
  },
);

console.log(Schema.decodeUnknownSync(BooleanFromNumericString)("100")); // Output: true
```

### Non-strict Option

Non-strict option
In some cases, strict type checking can create issues during data transformations, especially when the types might slightly differ in specific transformations. To address these scenarios, `Schema.transform` offers the option `strict: false`, which relaxes type constraints and allows more flexible transformations.

Example (Creating a Clamping Constructor)

```typescript
import { Number, Schema } from "effect";

const clamp =
  (minimum: number, maximum: number) =>
  <A extends number, I, R>(self: Schema.Schema<A, I, R>) =>
    Schema.transform(
      self,
      self.pipe(
        Schema.typeSchema,
        Schema.filter((a) => a >= minimum && a <= maximum),
      ),
      {
        strict: false,
        decode: (a) => Math.max(minimum, Math.min(maximum, a)),
        encode: (a) => a,
      },
    );
```

## transformOrFail

### Error Handling

The `Schema.transformOrFail` function utilizes the ParseResult module to manage potential errors:

• `ParseResult.succeed`: Indicates a successful transformation, where no errors occurred.
• `ParseResult.fail`: Signals a failed transformation, creating a new ParseError based on the provided ParseIssue.

Example (Converting a String to a Number)

```typescript
import { ParseResult, Schema } from "effect";

export const NumberFromString = Schema.transformOrFail(
  Schema.String,
  Schema.Number,
  {
    strict: true,
    decode: (input, options, ast) => {
      const parsed = parseFloat(input);
      if (isNaN(parsed)) {
        return ParseResult.fail(
          new ParseResult.Type(
            ast,
            input,
            "Failed to convert string to number",
          ),
        );
      }
      return ParseResult.succeed(parsed);
    },
    encode: (input, options, ast) => ParseResult.succeed(input.toString()),
  },
);

console.log(Schema.decodeUnknownSync(NumberFromString)("123")); // Output: 123
```

### Async Transformations

Async Transformations
In modern applications, especially those interacting with external APIs, you might need to transform data asynchronously. `Schema.transformOrFail` supports asynchronous transformations by allowing you to return an `Effect`.

Example (Validating Data with an API Call)

```typescript
import { Effect, ParseResult, Schema } from "effect";

const get = (url: string): Effect.Effect<unknown, Error> =>
  Effect.tryPromise({
    try: () =>
      fetch(url).then((res) => {
        if (res.ok) {
          return res.json() as Promise<unknown>;
        }
        throw new Error(String(res.status));
      }),
    catch: (e) => new Error(String(e)),
  });

const PeopleId = Schema.String.pipe(Schema.brand("PeopleId"));

const PeopleIdFromString = Schema.transformOrFail(Schema.String, PeopleId, {
  strict: true,
  decode: (s, _, ast) =>
    Effect.mapBoth(get(`https://swapi.dev/api/people/${s}`), {
      onFailure: (e) => new ParseResult.Type(ast, s, e.message),
      onSuccess: () => s,
    }),
  encode: ParseResult.succeed,
});

Effect.runPromiseExit(Schema.decodeUnknown(PeopleIdFromString)("1")).then(
  console.log,
);
```

## One-Way Transformations with Forbidden Encoding

One-Way Transformations with Forbidden Encoding
In some cases, encoding a value back to its original form may not make sense or may be undesirable. You can use `Schema.transformOrFail` to define a one-way transformation and explicitly return a `Forbidden` parse error during the encoding process.

Example (Password Hashing with Forbidden Encoding)

```typescript
import { createHash } from "node:crypto";
import { ParseResult, Redacted, Schema } from "effect";

const PlainPassword = Schema.String.pipe(
  Schema.minLength(6),
  Schema.brand("PlainPassword"),
);
const HashedPassword = Schema.String.pipe(Schema.brand("HashedPassword"));

export const PasswordHashing = Schema.transformOrFail(
  PlainPassword,
  Schema.RedactedFromSelf(HashedPassword),
  {
    strict: true,
    decode: (plainPassword) => {
      const hash = createHash("sha256").update(plainPassword).digest("hex");
      return ParseResult.succeed(Redacted.make(hash));
    },
    encode: (hashedPassword, _, ast) =>
      ParseResult.fail(
        new ParseResult.Forbidden(
          ast,
          hashedPassword,
          "Encoding hashed passwords back to plain text is forbidden.",
        ),
      ),
  },
);

console.log(Schema.decodeUnknownSync(PasswordHashing)("myPlainPassword123"));
```
