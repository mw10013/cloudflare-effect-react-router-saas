# Class APIs

When working with schemas, you have a choice beyond the `Schema.Struct` constructor. You can leverage the power of classes through the `Schema.Class` utility, which comes with its own set of advantages tailored to common use cases:

Classes offer several features that simplify the schema creation process:

- All-in-One Definition: With classes, you can define both a schema and an opaque type simultaneously.
- Shared Functionality: You can incorporate shared functionality using class methods or getters.
- Value Hashing and Equality: Utilize the built-in capability for checking value equality and applying hashing (thanks to `Class` implementing `Data.Class`).

Classes defined with `Schema.Class` act as [transformations](https://effect.website/docs/schema/transformations/). See Class Schemas are Transformations for details.

## Definition

To define a class using `Schema.Class`, you need to specify:

- The type of the class being created.
- A unique identifier for the class.
- The desired fields.

Example (Defining a Schema Class)

```typescript
import { Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {}
```

In this example, `Person` is both a schema and a TypeScript class. Instances of `Person` are created using the defined schema, ensuring compliance with the specified fields.

Example (Creating Instances)

```typescript
import { Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {}

console.log(new Person({ id: 1, name: "John" }));
/*
Output:
Person { id: 1, name: 'John' }
*/

// Using the factory function
console.log(Person.make({ id: 1, name: "John" }));
/*
Output:
Person { id: 1, name: 'John' }
*/
```

You need to specify an identifier to make the class global. This ensures that two classes with the same identifier refer to the same instance, avoiding reliance on `instanceof` checks.

This behavior is similar to how we handle other class-based APIs like `Context.Tag`.

Using a unique identifier is particularly useful in scenarios where live reloads can occur, as it helps preserve the instance across reloads. It ensures there is no duplication of instances (although it shouldn’t happen, some bundlers and frameworks can behave unpredictably).

### Class Schemas are Transformations

Class schemas [transform](https://effect.website/docs/schema/transformations/) a struct schema into a [declaration](https://effect.website/docs/schema/advanced-usage/#declaring-new-data-types) schema that represents a class type.

- When decoding, a plain object is converted into an instance of the class.
- When encoding, a class instance is converted back into a plain object.

Example (Decoding and Encoding a Class)

```typescript
import { Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {}

const person = Person.make({ id: 1, name: "John" });

// Decode from a plain object into a class instance
const decoded = Schema.decodeUnknownSync(Person)({ id: 1, name: "John" });
console.log(decoded);
// Output: Person { id: 1, name: 'John' }

// Encode a class instance back into a plain object
const encoded = Schema.encodeUnknownSync(Person)(person);
console.log(encoded);
// Output: { id: 1, name: 'John' }
```

### Defining Classes Without Fields

When your schema does not require any fields, you can define a class with an empty object.

Example (Defining and Using a Class Without Arguments)

```typescript
import { Schema } from "effect";

// Define a class with no fields
class NoArgs extends Schema.Class<NoArgs>("NoArgs")({}) {}

// Create an instance using the default constructor
const noargs1 = new NoArgs();

// Alternatively, create an instance by explicitly passing an empty object
const noargs2 = new NoArgs({});
```

### Defining Classes With Filters

Filters allow you to validate input when decoding, encoding, or creating an instance. Instead of specifying raw fields, you can pass a `Schema.Struct` with a filter applied.

Example (Applying a Filter to a Schema Class)

```typescript
import { Schema } from "effect";

class WithFilter extends Schema.Class<WithFilter>("WithFilter")(
  Schema.Struct({
    a: Schema.NumberFromString,
    b: Schema.NumberFromString,
  }).pipe(Schema.filter(({ a, b }) => a >= b || "a must be greater than b")),
) {}

// Constructor
console.log(new WithFilter({ a: 1, b: 2 }));
/*
throws:
ParseError: WithFilter (Constructor)
└─ Predicate refinement failure
   └─ a must be greater than b
*/

// Decoding
console.log(Schema.decodeUnknownSync(WithFilter)({ a: "1", b: "2" }));
/*
throws:
ParseError: (WithFilter (Encoded side) <-> WithFilter)
└─ Encoded side transformation failure
   └─ WithFilter (Encoded side)
      └─ Predicate refinement failure
         └─ a must be greater than b
*/
```

## Validating Properties via Class Constructors

When you define a class using `Schema.Class`, the constructor automatically checks that the provided properties adhere to the schema’s rules.

### Defining and Instantiating a Valid Class Instance

The constructor ensures that each property, like `id` and `name`, adheres to the schema. For instance, `id` must be a number, and `name` must be a non-empty string.

Example (Creating a Valid Instance)

```typescript
import { Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {}

// Create an instance with valid properties
const john = new Person({ id: 1, name: "John" });
```

### Handling Invalid Properties

If invalid properties are provided during instantiation, the constructor throws an error, explaining why the validation failed.

Example (Creating an Instance with Invalid Properties)

```typescript
import { Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {}

// Attempt to create an instance with an invalid `name`
new Person({ id: 1, name: "" });
/*
throws:
ParseError: Person (Constructor)
└─ ["name"]
   └─ NonEmptyString
      └─ Predicate refinement failure
         └─ Expected NonEmptyString, actual ""
*/
```

The error clearly specifies that the `name` field failed to meet the `NonEmptyString` requirement.

### Bypassing Validation

In some scenarios, you might want to bypass the validation logic. While not generally recommended, the library provides an option to do so.

Example (Bypassing Validation)

```typescript
import { Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {}

// Bypass validation during instantiation
const john = new Person({ id: 1, name: "" }, true);

// Or use the `disableValidation` option explicitly
new Person({ id: 1, name: "" }, { disableValidation: true });
```

## Automatic Hashing and Equality in Classes

Instances of classes created with `Schema.Class` support the `Equal` trait through their integration with `Data.Class`. This enables straightforward value comparisons, even across different instances.

### Basic Equality Check

Two class instances are considered equal if their properties have identical values.

Example (Comparing Instances with Equal Properties)

```typescript
import { Equal, Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {}

const john1 = new Person({ id: 1, name: "John" });
const john2 = new Person({ id: 1, name: "John" });

// Compare instances
console.log(Equal.equals(john1, john2));
// Output: true
```

### Nested or Complex Properties

The `Equal` trait performs comparisons at the first level. If a property is a more complex structure, such as an array, instances may not be considered equal, even if the arrays themselves have identical values.

Example (Shallow Equality for Arrays)

```typescript
import { Equal, Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
  hobbies: Schema.Array(Schema.String), // Standard array schema
}) {}

const john1 = new Person({
  id: 1,
  name: "John",
  hobbies: ["reading", "coding"],
});
const john2 = new Person({
  id: 1,
  name: "John",
  hobbies: ["reading", "coding"],
});

// Equality fails because `hobbies` are not deeply compared
console.log(Equal.equals(john1, john2));
// Output: false
```

To achieve deep equality for nested structures like arrays, use `Schema.Data` in combination with `Data.array`. This enables the library to compare each element of the array rather than treating it as a single entity.

Example (Using `Schema.Data` for Deep Equality)

```typescript
import { Data, Equal, Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
  hobbies: Schema.Data(Schema.Array(Schema.String)), // Enable deep equality
}) {}

const john1 = new Person({
  id: 1,
  name: "John",
  hobbies: Data.array(["reading", "coding"]),
});
const john2 = new Person({
  id: 1,
  name: "John",
  hobbies: Data.array(["reading", "coding"]),
});

// Equality succeeds because `hobbies` are deeply compared
console.log(Equal.equals(john1, john2));
// Output: true
```

## Extending Classes with Custom Logic

Schema classes provide the flexibility to include custom getters and methods, allowing you to extend their functionality beyond the defined fields.

### Adding Custom Getters

A getter can be used to derive computed values from the fields of the class. For example, a `Person` class can include a getter to return the `name` property in uppercase.

Example (Adding a Getter for Uppercase Name)

```typescript
import { Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {
  // Custom getter to return the name in uppercase
  get upperName() {
    return this.name.toUpperCase();
  }
}

const john = new Person({ id: 1, name: "John" });

// Use the custom getter
console.log(john.upperName);
// Output: "JOHN"
```

### Adding Custom Methods

In addition to getters, you can define methods to encapsulate more complex logic or operations involving the class’s fields.

Example (Adding a Method)

```typescript
import { Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {
  // Custom method to return a greeting
  greet() {
    return `Hello, my name is ${this.name}.`;
  }
}

const john = new Person({ id: 1, name: "John" });

// Use the custom method
console.log(john.greet());
// Output: "Hello, my name is John."
```

## Leveraging Classes as Schema Definitions

When you define a class with `Schema.Class`, it serves both as a schema and as a class. This dual functionality allows the class to be used wherever a schema is required.

Example (Using a Class in an Array Schema)

```typescript
import { Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {}

// Use the Person class in an array schema
const Persons = Schema.Array(Person);

//     ┌─── readonly Person[]
//     ▼
type Type = typeof Persons.Type;
```

### Exposed Values

The class also includes a `fields` static property, which outlines the fields defined during the class creation.

Example (Accessing the `fields` Property)

```typescript
import { Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {}

//       ┌─── {
//       |      readonly id: typeof Schema.Number;
//       |      readonly name: typeof Schema.NonEmptyString;
//       |    }
//       ▼
Person.fields;
```

## Adding Annotations

Defining a class with `Schema.Class` is similar to creating a [transformation](https://effect.website/docs/schema/transformations/) schema that converts a struct schema into a [declaration](https://effect.website/docs/schema/advanced-usage/#declaring-new-data-types) schema representing the class type.

For example, consider the following class definition:

```typescript
import { Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {}
```

Under the hood, this definition creates a transformation schema that maps:

```
Schema.Struct({
  id: Schema.Number,
  name: Schema.NonEmptyString
})
```

to a schema representing the `Person` class:

```
Schema.declare((input) => input instanceof Person)
```

So, defining a schema with `Schema.Class` involves three schemas:

- The “from” schema (the struct)
- The “to” schema (the class)
- The “transformation” schema (struct -> class)

You can annotate each of these schemas by passing a tuple as the second argument to the `Schema.Class` API.

Example (Annotating Different Parts of the Class Schema)

```typescript
import { Schema, SchemaAST } from "effect";

class Person extends Schema.Class<Person>("Person")(
  {
    id: Schema.Number,
    name: Schema.NonEmptyString,
  },
  [
    // Annotations for the "to" schema
    { description: `"to" description` },

    // Annotations for the "transformation schema
    { description: `"transformation" description` },

    // Annotations for the "from" schema
    { description: `"from" description` },
  ],
) {}

console.log(SchemaAST.getDescriptionAnnotation(Person.ast.to));
// Output: { _id: 'Option', _tag: 'Some', value: '"to" description' }

console.log(SchemaAST.getDescriptionAnnotation(Person.ast));
// Output: { _id: 'Option', _tag: 'Some', value: '"transformation" description' }

console.log(SchemaAST.getDescriptionAnnotation(Person.ast.from));
// Output: { _id: 'Option', _tag: 'Some', value: '"from" description' }
```

If you do not want to annotate all three schemas, you can pass `undefined` for the ones you wish to skip.

Example (Skipping Annotations)

```typescript
import { Schema, SchemaAST } from "effect";

class Person extends Schema.Class<Person>("Person")(
  {
    id: Schema.Number,
    name: Schema.NonEmptyString,
  },
  [
    // No annotations for the "to" schema
    undefined,

    // Annotations for the "transformation schema
    { description: `"transformation" description` },
  ],
) {}

console.log(SchemaAST.getDescriptionAnnotation(Person.ast.to));
// Output: { _id: 'Option', _tag: 'None' }

console.log(SchemaAST.getDescriptionAnnotation(Person.ast));
// Output: { _id: 'Option', _tag: 'Some', value: '"transformation" description' }

console.log(SchemaAST.getDescriptionAnnotation(Person.ast.from));
// Output: { _id: 'Option', _tag: 'None' }
```

By default, the unique identifier used to define the class is also applied as the default `identifier` annotation for the Class Schema.

Example (Default Identifier Annotation)

```typescript
import { Schema, SchemaAST } from "effect";

// Used as default identifier annotation ────┐
//                                           |
//                                           ▼
class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {}

console.log(SchemaAST.getIdentifierAnnotation(Person.ast.to));
// Output: { _id: 'Option', _tag: 'Some', value: 'Person' }
```

## Recursive Schemas

The `Schema.suspend` combinator is useful when you need to define a schema that depends on itself, like in the case of recursive data structures. In this example, the `Category` schema depends on itself because it has a field `subcategories` that is an array of `Category` objects.

Example (Self-Referencing Schema)

```typescript
import { Schema } from "effect";

// Define a Category schema with a recursive subcategories field
class Category extends Schema.Class<Category>("Category")({
  name: Schema.String,
  subcategories: Schema.Array(
    Schema.suspend((): Schema.Schema<Category> => Category),
  ),
}) {}
```

It is necessary to add an explicit type annotation because otherwise TypeScript would struggle to infer types correctly. Without this annotation, you might encounter this error message:

Example (Missing Type Annotation Error)

```typescript
import { Schema } from "effect";

class Category extends Schema.Class<Category>("Category")({
  //Error ts(2506) ― 'Category' is referenced directly or indirectly in its own base expression.
  name: Schema.String,
  subcategories: Schema.Array(Schema.suspend(() => Category)), //Error ts(7024) ― Function implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.
}) {}
```

### Mutually Recursive Schemas

Sometimes, schemas depend on each other in a mutually recursive way. For instance, an arithmetic expression tree might include `Expression` nodes that can either be numbers or `Operation` nodes, which in turn reference `Expression` nodes.

Example (Arithmetic Expression Tree)

```typescript
import { Schema } from "effect";

class Expression extends Schema.Class<Expression>("Expression")({
  type: Schema.Literal("expression"),
  value: Schema.Union(
    Schema.Number,
    Schema.suspend((): Schema.Schema<Operation> => Operation),
  ),
}) {}

class Operation extends Schema.Class<Operation>("Operation")({
  type: Schema.Literal("operation"),
  operator: Schema.Literal("+", "-"),
  left: Expression,
  right: Expression,
}) {}
```

### Recursive Types with Different Encoded and Type

Defining recursive schemas where the `Encoded` type differs from the `Type` type introduces additional complexity. For instance, if a schema includes fields that transform data (e.g., `NumberFromString`), the `Encoded` and `Type` types may not align.

In such cases, we need to define an interface for the `Encoded` type.

Let’s consider an example: suppose we want to add an `id` field to the `Category` schema, where the schema for `id` is `NumberFromString`. It’s important to note that `NumberFromString` is a schema that transforms a string into a number, so the `Type` and `Encoded` types of `NumberFromString` differ, being `number` and `string` respectively. When we add this field to the `Category` schema, TypeScript raises an error:

```typescript
import { Schema } from "effect";

class Category extends Schema.Class<Category>("Category")({
  id: Schema.NumberFromString,
  name: Schema.String,
  subcategories: Schema.Array(
    Schema.suspend((): Schema.Schema<Category> => Category), //Error ts(2322) ― Type 'typeof Category' is not assignable to type 'Schema<Category, Category, never>'. The types of 'Encoded.id' are incompatible between these types. Type 'string' is not assignable to type 'number'.
  ),
}) {}
```

This error occurs because the explicit annotation `S.suspend((): S.Schema<Category> => Category` is no longer sufficient and needs to be adjusted by explicitly adding the `Encoded` type:

Example (Adjusting the Schema with Explicit `Encoded` Type)

```typescript
import { Schema } from "effect";

interface CategoryEncoded {
  readonly id: string;
  readonly name: string;
  readonly subcategories: ReadonlyArray<CategoryEncoded>;
}

class Category extends Schema.Class<Category>("Category")({
  id: Schema.NumberFromString,
  name: Schema.String,
  subcategories: Schema.Array(
    Schema.suspend((): Schema.Schema<Category, CategoryEncoded> => Category),
  ),
}) {}
```

As we’ve observed, it’s necessary to define an interface for the `Encoded` of the schema to enable recursive schema definition, which can complicate things and be quite tedious. One pattern to mitigate this is to separate the field responsible for recursion from all other fields.

Example (Separating Recursive Field)

```typescript
import { Schema } from "effect";

const fields = {
  id: Schema.NumberFromString,
  name: Schema.String,
  // ...possibly other fields
};

interface CategoryEncoded extends Schema.Struct.Encoded<typeof fields> {
  // Define `subcategories` using recursion
  readonly subcategories: ReadonlyArray<CategoryEncoded>;
}

class Category extends Schema.Class<Category>("Category")({
  ...fields, // Include the fields
  subcategories: Schema.Array(
    // Define `subcategories` using recursion
    Schema.suspend((): Schema.Schema<Category, CategoryEncoded> => Category),
  ),
}) {}
```

## Tagged Class variants

You can also create classes that extend `TaggedClass` and `TaggedError` from the `effect/Data` module.

Example (Creating Tagged Classes and Errors)

```typescript
import { Schema } from "effect";

// Define a tagged class with a "name" field
class TaggedPerson extends Schema.TaggedClass<TaggedPerson>()("TaggedPerson", {
  name: Schema.String,
}) {}

// Define a tagged error with a "status" field
class HttpError extends Schema.TaggedError<HttpError>()("HttpError", {
  status: Schema.Number,
}) {}

const joe = new TaggedPerson({ name: "Joe" });
console.log(joe._tag);
// Output: "TaggedPerson"

const error = new HttpError({ status: 404 });
console.log(error._tag);
// Output: "HttpError"

console.log(error.stack); // access the stack trace
```

## Extending existing Classes

The `extend` static utility allows you to enhance an existing schema class by adding additional fields and functionality. This approach helps in building on top of existing schemas without redefining them from scratch.

Example (Extending a Schema Class)

```typescript
import { Schema } from "effect";

// Define the base class
class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {
  // A custom getter that converts the name to uppercase
  get upperName() {
    return this.name.toUpperCase();
  }
}

// Extend the base class to include an "age" field
class PersonWithAge extends Person.extend<PersonWithAge>("PersonWithAge")({
  age: Schema.Number,
}) {
  // A custom getter to check if the person is an adult
  get isAdult() {
    return this.age >= 18;
  }
}

// Usage
const john = new PersonWithAge({ id: 1, name: "John", age: 25 });
console.log(john.upperName); // Output: "JOHN"
console.log(john.isAdult); // Output: true
```

Note that you can only add additional fields when extending a class.

Example (Attempting to Overwrite Existing Fields)

```typescript
import { Schema } from "effect";

class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {
  get upperName() {
    return this.name.toUpperCase();
  }
}

class BadExtension extends Person.extend<BadExtension>("BadExtension")({
  name: Schema.Number,
}) {}
/*
throws:
Error: Duplicate property signature
details: Duplicate key "name"
*/
```

This error occurs because allowing fields to be overwritten is not safe. It could interfere with any getters or methods defined on the class that rely on the original definition. For example, in this case, the `upperName` getter would break if the `name` field was changed to a number.

## Transformations

You can enhance schema classes with effectful transformations to enrich or validate entities, particularly when working with data sourced from external systems like databases or APIs.

Example (Effectful Transformation)

The following example demonstrates adding an `age` field to a `Person` class. The `age` value is derived asynchronously based on the `id` field.

```typescript
import { Effect, Option, ParseResult, Schema } from "effect";

// Base class definition
class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.String,
}) {}

console.log(Schema.decodeUnknownSync(Person)({ id: 1, name: "name" }));
/*
Output:
Person { id: 1, name: 'name' }
*/

// Simulate fetching age asynchronously based on id
function getAge(id: number): Effect.Effect<number, Error> {
  return Effect.succeed(id + 2);
}

// Extended class with a transformation
class PersonWithTransform extends Person.transformOrFail<PersonWithTransform>(
  "PersonWithTransform",
)(
  {
    age: Schema.optionalWith(Schema.Number, { exact: true, as: "Option" }),
  },
  {
    // Decoding logic for the new field
    decode: (input) =>
      Effect.mapBoth(getAge(input.id), {
        onFailure: (e) =>
          new ParseResult.Type(Schema.String.ast, input.id, e.message),
        // Must return { age: Option<number> }
        onSuccess: (age) => ({ ...input, age: Option.some(age) }),
      }),
    encode: ParseResult.succeed,
  },
) {}

Schema.decodeUnknownPromise(PersonWithTransform)({
  id: 1,
  name: "name",
}).then(console.log);
/*
Output:
PersonWithTransform {
  id: 1,
  name: 'name',
  age: { _id: 'Option', _tag: 'Some', value: 3 }
}
*/

// Extended class with a conditional Transformation
class PersonWithTransformFrom extends Person.transformOrFailFrom<PersonWithTransformFrom>(
  "PersonWithTransformFrom",
)(
  {
    age: Schema.optionalWith(Schema.Number, { exact: true, as: "Option" }),
  },
  {
    decode: (input) =>
      Effect.mapBoth(getAge(input.id), {
        onFailure: (e) =>
          new ParseResult.Type(Schema.String.ast, input, e.message),
        // Must return { age?: number }
        onSuccess: (age) => (age > 18 ? { ...input, age } : { ...input }),
      }),
    encode: ParseResult.succeed,
  },
) {}

Schema.decodeUnknownPromise(PersonWithTransformFrom)({
  id: 1,
  name: "name",
}).then(console.log);
/*
Output:
PersonWithTransformFrom {
  id: 1,
  name: 'name',
  age: { _id: 'Option', _tag: 'None' }
}
*/
```

The decision of which API to use, either `transformOrFail` or `transformOrFailFrom`, depends on when you wish to execute the transformation:

1.  Using `transformOrFail`:
    - The transformation occurs at the end of the process.
    - It expects you to provide a value of type `{ age: Option<number> }`.
    - After processing the initial input, the new transformation comes into play, and you need to ensure the final output adheres to the specified structure.
2.  Using `transformOrFailFrom`:
    - The new transformation starts as soon as the initial input is handled.
    - You should provide a value `{ age?: number }`.
    - Based on this fresh input, the subsequent transformation `Schema.optionalWith(Schema.Number, { exact: true, as: "Option" })` is executed.
    - This approach allows for immediate handling of the input, potentially influencing the subsequent transformations.

## Additional Links

- [Introduction](https://effect.website/docs/getting-started/introduction/)
- [Why Effect?](https://effect.website/docs/getting-started/why-effect/)
- [Installation](https://effect.website/docs/getting-started/installation/)
- [Create Effect App](https://effect.website/docs/getting-started/create-effect-app/)
- [Importing Effect](https://effect.website/docs/getting-started/importing-effect/)
- [The Effect Type](https://effect.website/docs/getting-started/the-effect-type/)
- [Creating Effects](https://effect.website/docs/getting-started/creating-effects/)
- [Running Effects](https://effect.website/docs/getting-started/running-effects/)
- [Using Generators](https://effect.website/docs/getting-started/using-generators/)
- [Building Pipelines](https://effect.website/docs/getting-started/building-pipelines/)
- [Control Flow Operators](https://effect.website/docs/getting-started/control-flow/)
- [Two Types of Errors](https://effect.website/docs/error-management/two-error-types/)
- [Expected Errors](https://effect.website/docs/error-management/expected-errors/)
- [Unexpected Errors](https://effect.website/docs/error-management/unexpected-errors/)
- [Fallback](https://effect.website/docs/error-management/fallback/)
- [Matching](https://effect.website/docs/error-management/matching/)
- [Retrying](https://effect.website/docs/error-management/retrying/)
- [Timing Out](https://effect.website/docs/error-management/timing-out/)
- [Sandboxing](https://effect.website/docs/error-management/sandboxing/)
- [Error Accumulation](https://effect.website/docs/error-management/error-accumulation/)
- [Error Channel Operations](https://effect.website/docs/error-management/error-channel-operations/)
- [Parallel and Sequential Errors](https://effect.website/docs/error-management/parallel-and-sequential-errors/)
- [Yieldable Errors](https://effect.website/docs/error-management/yieldable-errors/)
- [Managing Services](https://effect.website/docs/requirements-management/services/)
- [Default Services](https://effect.website/docs/requirements-management/default-services/)
- [Managing Layers](https://effect.website/docs/requirements-management/layers/)
- [Layer Memoization](https://effect.website/docs/requirements-management/layer-memoization/)
- [Introduction](https://effect.website/docs/resource-management/introduction/)
- [Scope](https://effect.website/docs/resource-management/scope/)
- [Logging](https://effect.website/docs/observability/logging/)
- [Metrics](https://effect.website/docs/observability/metrics/)
- [Tracing](https://effect.website/docs/observability/tracing/)
- [Supervisor](https://effect.website/docs/observability/supervisor/)
- [Configuration](https://effect.website/docs/configuration/)
- [Runtime](https://effect.website/docs/runtime/)
- [Introduction](https://effect.website/docs/scheduling/introduction/)
- [Repetition](https://effect.website/docs/scheduling/repetition/)
- [Built-In Schedules](https://effect.website/docs/scheduling/built-in-schedules/)
- [Schedule Combinators](https://effect.website/docs/scheduling/schedule-combinators/)
- [Cron](https://effect.website/docs/scheduling/cron/)
- [Examples](https://effect.website/docs/scheduling/examples/)
- [Ref](https://effect.website/docs/state-management/ref/)
- [SynchronizedRef](https://effect.website/docs/state-management/synchronizedref/)
- [SubscriptionRef](https://effect.website/docs/state-management/subscriptionref/)
- [Batching](https://effect.website/docs/batching/)
- [Caching Effects](https://effect.website/docs/caching/caching-effects/)
- [Cache](https://effect.website/docs/caching/cache/)
- [Basic Concurrency](https://effect.website/docs/concurrency/basic-concurrency/)
- [Fibers](https://effect.website/docs/concurrency/fibers/)
- [Deferred](https://effect.website/docs/concurrency/deferred/)
- [Queue](https://effect.website/docs/concurrency/queue/)
- [PubSub](https://effect.website/docs/concurrency/pubsub/)
- [Semaphore](https://effect.website/docs/concurrency/semaphore/)
- [Latch](https://effect.website/docs/concurrency/latch/)
- [Introduction](https://effect.website/docs/stream/introduction/)
- [Creating Streams](https://effect.website/docs/stream/creating/)
- [Consuming Streams](https://effect.website/docs/stream/consuming-streams/)
- [Error Handling](https://effect.website/docs/stream/error-handling/)
- [Operations](https://effect.website/docs/stream/operations/)
- [Resourceful Streams](https://effect.website/docs/stream/resourceful-streams/)
- [Introduction](https://effect.website/docs/sink/introduction/)
- [Creating Sinks](https://effect.website/docs/sink/creating/)
- [Operations](https://effect.website/docs/sink/operations/)
- [Concurrency](https://effect.website/docs/sink/concurrency/)
- [Leftovers](https://effect.website/docs/sink/leftovers/)
- [TestClock](https://effect.website/docs/testing/testclock/)
- [Guidelines](https://effect.website/docs/code-style/guidelines/)
- [Dual APIs](https://effect.website/docs/code-style/dual/)
- [Branded Types](https://effect.website/docs/code-style/branded-types/)
- [Pattern Matching](https://effect.website/docs/code-style/pattern-matching/)
- [Excessive Nesting](https://effect.website/docs/code-style/do/)
- [BigDecimal](https://effect.website/docs/data-types/bigdecimal/)
- [Cause](https://effect.website/docs/data-types/cause/)
- [Chunk](https://effect.website/docs/data-types/chunk/)
- [Data](https://effect.website/docs/data-types/data/)
- [DateTime](https://effect.website/docs/data-types/datetime/)
- [Duration](https://effect.website/docs/data-types/duration/)
- [Either](https://effect.website/docs/data-types/either/)
- [Exit](https://effect.website/docs/data-types/exit/)
- [HashSet](https://effect.website/docs/data-types/hash-set/)
- [Option](https://effect.website/docs/data-types/option/)
- [Redacted](https://effect.website/docs/data-types/redacted/)
- [Equal](https://effect.website/docs/trait/equal/)
- [Hash](https://effect.website/docs/trait/hash/)
- [Equivalence](https://effect.website/docs/behaviour/equivalence/)
- [Order](https://effect.website/docs/behaviour/order/)
- [Introduction](https://effect.website/docs/schema/introduction/)
- [Getting Started](https://effect.website/docs/schema/getting-started/)
- [Basic Usage](https://effect.website/docs/schema/basic-usage/)
- [Filters](https://effect.website/docs/schema/filters/)
- [Advanced Usage](https://effect.website/docs/schema/advanced-usage/)
- [Projections](https://effect.website/docs/schema/projections/)
- [Transformations](https://effect.website/docs/schema/transformations/)
- [Annotations](https://effect.website/docs/schema/annotations/)
- [Error Messages](https://effect.website/docs/schema/error-messages/)
- [Error Formatters](https://effect.website/docs/schema/error-formatters/)
- [Class APIs](https://effect.website/docs/schema/classes/)
- [Default Constructors](https://effect.website/docs/schema/default-constructors/)
- [Effect Data Types](https://effect.website/docs/schema/effect-data-types/)
- [Standard Schema](https://effect.website/docs/schema/standard-schema/)
- [Arbitrary](https://effect.website/docs/schema/arbitrary/)
- [JSON Schema](https://effect.website/docs/schema/json-schema/)
- [Equivalence](https://effect.website/docs/schema/equivalence/)
- [Pretty Printer](https://effect.website/docs/schema/pretty/)
- [Introduction](https://effect.website/docs/ai/introduction/)
- [Getting Started](https://effect.website/docs/ai/getting-started/)
- [Execution Planning](https://effect.website/docs/ai/planning-llm-interactions/)
- [Tool Use](https://effect.website/docs/ai/tool-use/)
- [Getting Started](https://effect.website/docs/micro/new-users/)
- [Micro for Effect Users](https://effect.website/docs/micro/effect-users/)
- [Introduction](https://effect.website/docs/platform/introduction/)
- [Command](https://effect.website/docs/platform/command/)
- [FileSystem](https://effect.website/docs/platform/file-system/)
- [KeyValueStore](https://effect.website/docs/platform/key-value-store/)
- [Path](https://effect.website/docs/platform/path/)
- [PlatformLogger](https://effect.website/docs/platform/platformlogger/)
- [Runtime](https://effect.website/docs/platform/runtime/)
- [Terminal](https://effect.website/docs/platform/terminal/)
- [Myths](https://effect.website/docs/additional-resources/myths/)
- [API Reference](https://effect.website/docs/additional-resources/api-reference/)
- [Coming From ZIO](https://effect.website/docs/additional-resources/coming-from-zio/)
- [Effect vs fp-ts](https://effect.website/docs/additional-resources/effect-vs-fp-ts/)
- [Effect vs Promise](https://effect.website/docs/additional-resources/effect-vs-promise/)
