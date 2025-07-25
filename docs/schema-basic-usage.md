# Basic Usage

## Primitives

Primitives
The Schema module provides built-in schemas for common primitive types.

| Schema                | Type      |
| :-------------------- | :-------- |
| Schema.String         | string    |
| Schema.Number         | number    |
| Schema.Boolean        | boolean   |
| Schema.BigIntFromSelf | BigInt    |
| Schema.SymbolFromSelf | symbol    |
| Schema.Object         | object    |
| Schema.Undefined      | undefined |
| Schema.Void           | void      |
| Schema.Any            | any       |
| Schema.Unknown        | unknown   |
| Schema.Never          | never     |

Example (Using a Primitive Schema)

```typescript
import { Schema } from "effect";

const schema = Schema.String;
// Infers the type as string
//
//     ┌─── string
//     ▼
type Type = typeof schema.Type;

// Attempt to decode a null value, which will throw a parse error
Schema.decodeUnknownSync(schema)(null);
/*
throws:
ParseError: Expected string, actual null
*/
```

## asSchema

asSchema
To make it easier to work with schemas, built-in schemas are exposed with
shorter, opaque types when possible.

The `Schema.asSchema` function allows you to view any schema as `Schema<Type, Encoded, Context>`.

Example (Expanding a Schema with `asSchema`)

For example, while `Schema.String` is defined as a class with a type of `typeof Schema.String`, using `Schema.asSchema` provides the schema in its extended form as `Schema<string, string, never>`.

```typescript
import { Schema } from "effect";

//     ┌─── typeof Schema.String
//     ▼
const schema = Schema.String;

//     ┌─── Schema<string, string, never>
//     ▼
const nomalized = Schema.asSchema(schema);
```

## Unique Symbols

Unique Symbols
You can create a schema for unique symbols using `Schema.UniqueSymbolFromSelf`.

Example (Creating a Schema for a Unique Symbol)

```typescript
import { Schema } from "effect";

const mySymbol = Symbol.for("mySymbol");
const schema = Schema.UniqueSymbolFromSelf(mySymbol);

//     ┌─── typeof mySymbol
//     ▼
type Type = typeof schema.Type;

Schema.decodeUnknownSync(schema)(null);
/*
throws:
ParseError: Expected Symbol(mySymbol), actual null
*/
```

## Literals

Literals
Literal schemas represent a [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types). You can use them to specify exact values that a type must have.

Literals can be of the following types:

- `string`
- `number`
- `boolean`
- `null`
- `bigint`

Example (Defining Literal Schemas)

```typescript
import { Schema } from "effect";

// Define various literal schemas
Schema.Null; // Same as S.Literal(null)
Schema.Literal("a"); // string literal
Schema.Literal(1); // number literal
Schema.Literal(true); // boolean literal
Schema.Literal(2n); // BigInt literal
```

Example (Defining a Literal Schema for `"a"`)

```typescript
import { Schema } from "effect";

//     ┌─── Literal<["a"]>
//     ▼
const schema = Schema.Literal("a");

//     ┌─── "a"
//     ▼
type Type = typeof schema.Type;

console.log(Schema.decodeUnknownSync(schema)("a"));
// Output: "a"

console.log(Schema.decodeUnknownSync(schema)("b"));
/*
throws:
ParseError: Expected "a", actual "b"
*/
```

### Union of Literals

Union of Literals
You can create a union of multiple literals by passing them as arguments to the `Schema.Literal` constructor:

Example (Defining a Union of Literals)

```typescript
import { Schema } from "effect";

//     ┌─── Literal<["a", "b", "c"]>
//     ▼
const schema = Schema.Literal("a", "b", "c");

//     ┌─── "a" | "b" | "c"
//     ▼
type Type = typeof schema.Type;

Schema.decodeUnknownSync(schema)(null);
/*
throws:
ParseError: "a" | "b" | "c"
├─ Expected "a", actual null
├─ Expected "b", actual null
└─ Expected "c", actual null
*/
```

If you want to set a custom error message for the entire union of literals, you
can use the `override: true` option (see [Custom Error Messages](https://effect.website/docs/schema/error-messages/#custom-error-messages) for more details) to specify a unified message.

Example (Adding a Custom Message to a Union of Literals)

```typescript
import { Schema } from "effect";

// Schema with individual messages for each literal
const individualMessages = Schema.Literal("a", "b", "c");

console.log(Schema.decodeUnknownSync(individualMessages)(null));
/*
throws:
ParseError: "a" | "b" | "c"
├─ Expected "a", actual null
├─ Expected "b", actual null
└─ Expected "c", actual null
*/

// Schema with a unified custom message for all literals
const unifiedMessage = Schema.Literal("a", "b", "c").annotations({
  message: () => ({ message: "Not a valid code", override: true }),
});

console.log(Schema.decodeUnknownSync(unifiedMessage)(null));
/*
throws:
ParseError: Not a valid code
*/
```

### Exposed Values

Exposed Values
You can access the literals defined in a literal schema using the `literals` property:

```typescript
import { Schema } from "effect";

const schema = Schema.Literal("a", "b", "c");

//      ┌─── readonly ["a", "b", "c"]
//      ▼
const literals = schema.literals;
```

### The pickLiteral Utility

The pickLiteral Utility
You can use `Schema.pickLiteral` with a literal schema to narrow down its possible values.

Example (Using `pickLiteral` to Narrow Values)

```typescript
import { Schema } from "effect";

// Create a schema for a subset of literals ("a" and "b") from a larger set
//
//      ┌─── Literal<["a", "b"]>
//      ▼
const schema = Schema.Literal("a", "b", "c").pipe(Schema.pickLiteral("a", "b"));
```

Sometimes, you may need to reuse a literal schema in other parts of your code.
Below is an example demonstrating how to do this:

Example (Creating a Subtype from a Literal Schema)

```typescript
import { Schema } from "effect";

// Define the base set of fruit categories
const FruitCategory = Schema.Literal("sweet", "citrus", "tropical");

// Define a general Fruit schema with the base category set
const Fruit = Schema.Struct({
  id: Schema.Number,
  category: FruitCategory,
});

// Define a specific Fruit schema for only "sweet" and "citrus" categories
const SweetAndCitrusFruit = Schema.Struct({
  id: Schema.Number,
  category: FruitCategory.pipe(Schema.pickLiteral("sweet", "citrus")),
});
```

In this example, `FruitCategory` serves as the source of truth for the different fruit categories. We reuse it
to create a subtype of `Fruit` called `SweetAndCitrusFruit`, ensuring that only the specified categories (`"sweet"` and `"citrus"`) are allowed. This approach helps maintain consistency throughout your code and
provides type safety if the category definition changes.

## Template literals

Template literals
In TypeScript, [template literals types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) allow you to embed expressions within string literals. The `Schema.TemplateLiteral` constructor allows you to create a schema for these template literal types.

Example (Defining Template Literals)

```typescript
import { Schema } from "effect";

// This creates a schema for: `a${string}`
//
//      ┌─── TemplateLiteral<`a${string}`>
//      ▼
const schema1 = Schema.TemplateLiteral("a", Schema.String);

// This creates a schema for:
// `https://${string}.com` | `https://${string}.net`
const schema2 = Schema.TemplateLiteral(
  "https://",
  Schema.String,
  ".",
  Schema.Literal("com", "net"),
);
```

Example (From [template literals types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) Documentation)

Let’s look at a more complex example. Suppose you have two sets of locale IDs
for emails and footers. You can use the `Schema.TemplateLiteral` constructor to create a schema that combines these IDs:

```typescript
import { Schema } from "effect";

const EmailLocaleIDs = Schema.Literal("welcome_email", "email_heading");
const FooterLocaleIDs = Schema.Literal("footer_title", "footer_sendoff");

// This creates a schema for:
// "welcome_email_id" | "email_heading_id" |
// "footer_title_id" | "footer_sendoff_id"
const schema = Schema.TemplateLiteral(
  Schema.Union(EmailLocaleIDs, FooterLocaleIDs),
  "_id",
);
```

### Supported Span Types

Supported Span Types
The `Schema.TemplateLiteral` constructor supports the following types of spans:

- `Schema.String`
- `Schema.Number`
- Literals: `string | number | boolean | null | bigint`. These can be either wrapped by `Schema.Literal` or used directly
- Unions of the above types
- Brands of the above types

Example (Using a Branded String in a Template Literal)

```typescript
import { Schema } from "effect";

// Create a branded string schema for an authorization token
const AuthorizationToken = Schema.String.pipe(
  Schema.brand("AuthorizationToken"),
);

// This creates a schema for:
// `Bearer ${string & Brand<"AuthorizationToken">}`
const schema = Schema.TemplateLiteral("Bearer ", AuthorizationToken);
```

### TemplateLiteralParser

TemplateLiteralParser
The `Schema.TemplateLiteral` constructor, while useful as a simple validator, only verifies that an input
conforms to a specific string pattern by converting template literal definitions
into regular expressions. Similarly, [Schema.pattern](https://effect.website/docs/schema/filters/#string-filters) employs regular expressions directly for the same purpose. Post-validation,
both methods require additional manual parsing to convert the validated string into
a usable data format.

To address these limitations and eliminate the need for manual post-validation
parsing, the `Schema.TemplateLiteralParser` API has been developed. It not only validates the input format but also
automatically parses it into a more structured and type-safe output, specifically into
a tuple format.

The `Schema.TemplateLiteralParser` constructor supports the same types of spans as `Schema.TemplateLiteral`.

Example (Using TemplateLiteralParser for Parsing and Encoding)

```typescript
import { Schema } from "effect";

//      ┌─── Schema<readonly [number, "a", string], `${string}a${string}`>
//      ▼
const schema = Schema.TemplateLiteralParser(
  Schema.NumberFromString,
  "a",
  Schema.NonEmptyString,
);

console.log(Schema.decodeSync(schema)("100afoo"));
// Output: [ 100, 'a', 'foo' ]

console.log(Schema.encodeSync(schema)([100, "a", "foo"]));
// Output: '100afoo'
```

## Native enums

Native enums
The Schema module provides support for native TypeScript enums. You can define a
schema for an enum using `Schema.Enums`, allowing you to validate values that belong to the enum.

Example (Defining a Schema for an Enum)

```typescript
import { Schema } from "effect";

enum Fruits {
  Apple,
  Banana,
}

//      ┌─── Enums<typeof Fruits>
//      ▼
const schema = Schema.Enums(Fruits);

//
//     ┌─── Fruits
//     ▼
type Type = typeof schema.Type;
```

### Exposed Values

Exposed Values
Enums are accessible through the `enums` property of the schema. You can use this property to retrieve individual
members or the entire set of enum values.

```typescript
import { Schema } from "effect";

enum Fruits {
  Apple,
  Banana,
}

const schema = Schema.Enums(Fruits);

schema.enums; // Returns all enum members
schema.enums.Apple; // Access the Apple member
schema.enums.Banana; // Access the Banana member
```

## Unions

Unions
The Schema module includes a built-in `Schema.Union` constructor for creating “OR” types, allowing you to define schemas that can
represent multiple types.

Example (Defining a Union Schema)

```typescript
import { Schema } from "effect";

//      ┌─── Union<[typeof Schema.String, typeof Schema.Number]>
//      ▼
const schema = Schema.Union(Schema.String, Schema.Number);

//     ┌─── string | number
//     ▼
type Type = typeof schema.Type;
```

### Union Member Evaluation Order

Union Member Evaluation Order
When decoding, union members are evaluated in the order they are defined. If a
value matches the first member, it will be decoded using that schema. If not, the
decoding process moves on to the next member.

If multiple schemas could decode the same value, the order matters. Placing a
more general schema before a more specific one may result in missing properties,
as the first matching schema will be used.

Example (Handling Overlapping Schemas in a Union)

```typescript
import { Schema } from "effect";

// Define two overlapping schemas
const Member1 = Schema.Struct({
  a: Schema.String,
});

const Member2 = Schema.Struct({
  a: Schema.String,
  b: Schema.Number,
});

// ❌ Define a union where Member1 appears first
const Bad = Schema.Union(Member1, Member2);

console.log(Schema.decodeUnknownSync(Bad)({ a: "a", b: 12 }));
// Output: { a: 'a' }  (Member1 matched first, so `b` was ignored)

// ✅ Define a union where Member2 appears first
const Good = Schema.Union(Member2, Member1);

console.log(Schema.decodeUnknownSync(Good)({ a: "a", b: 12 }));
// Output: { a: 'a', b: 12 } (Member2 matched first, so `b` was included)
```

### Union of Literals

While you can create a union of literals by combining individual literal
schemas:

Example (Using Individual Literal Schemas)

```typescript
import { Schema } from "effect";

//      ┌─── Union<[Schema.Literal<["a"]>, Schema.Literal<["b"]>, Schema.Literal<["c"]>]>
//      ▼
const schema = Schema.Union(
  Schema.Literal("a"),
  Schema.Literal("b"),
  Schema.Literal("c"),
);
```

You can simplify the process by passing multiple literals directly to the `Schema.Literal` constructor:

Example (Defining a Union of Literals)

```typescript
import { Schema } from "effect";

//     ┌─── Literal<["a", "b", "c"]>
//     ▼
const schema = Schema.Literal("a", "b", "c");

//     ┌─── "a" | "b" | "c"
//     ▼
type Type = typeof schema.Type;
```

If you want to set a custom error message for the entire union of literals, you
can use the `override: true` option (see [Custom Error Messages](https://effect.website/docs/schema/error-messages/#custom-error-messages) for more details) to specify a unified message.

Example (Adding a Custom Message to a Union of Literals)

```typescript
import { Schema } from "effect";

// Schema with individual messages for each literal
const individualMessages = Schema.Literal("a", "b", "c");

console.log(Schema.decodeUnknownSync(individualMessages)(null));
/*
throws:
ParseError: "a" | "b" | "c"
├─ Expected "a", actual null
├─ Expected "b", actual null
└─ Expected "c", actual null
*/

// Schema with a unified custom message for all literals
const unifiedMessage = Schema.Literal("a", "b", "c").annotations({
  message: () => ({ message: "Not a valid code", override: true }),
});

console.log(Schema.decodeUnknownSync(unifiedMessage)(null));
/*
throws:
ParseError: Not a valid code
*/
```

### Nullables

Nullables
The Schema module includes utility functions for defining schemas that allow
nullable types, helping to handle values that may be `null`, `undefined`, or both.

Example (Creating Nullable Schemas)

```typescript
import { Schema } from "effect";

// Represents a schema for a string or null value
Schema.NullOr(Schema.String);

// Represents a schema for a string, null, or undefined value
Schema.NullishOr(Schema.String);

// Represents a schema for a string or undefined value
Schema.UndefinedOr(Schema.String);
```

### Discriminated unions

[Discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) in TypeScript are a way of modeling complex data structures that may take on
different forms based on a specific set of conditions or properties. They allow
you to define a type that represents multiple related shapes, where each shape is
uniquely identified by a shared discriminant property.

In a discriminated union, each variant of the union has a common property,
called the discriminant. The discriminant is a literal type, which means it can only
have a finite set of possible values. Based on the value of the discriminant
property, TypeScript can infer which variant of the union is currently in use.

Example (Defining a Discriminated Union in TypeScript)

```typescript
type Circle = {
  readonly kind: "circle";
  readonly radius: number;
};

type Square = {
  readonly kind: "square";
  readonly sideLength: number;
};

type Shape = Circle | Square;
```

In the `Schema` module, you can define a discriminated union similarly by specifying a literal
field as the discriminant for each type.

Example (Defining a Discriminated Union Using Schema)

```typescript
import { Schema } from "effect";

const Circle = Schema.Struct({
  kind: Schema.Literal("circle"),
  radius: Schema.Number,
});

const Square = Schema.Struct({
  kind: Schema.Literal("square"),
  sideLength: Schema.Number,
});

const Shape = Schema.Union(Circle, Square);
```

In this example, the `Schema.Literal` constructor sets up the `kind` property as the discriminant for both `Circle` and `Square` schemas. The `Shape` schema then represents a union of these two types, allowing TypeScript to infer
the specific shape based on the `kind` value.

### Transforming a Simple Union into a Discriminated Union

If you start with a simple union and want to transform it into a discriminated
union, you can add a special property to each member. This allows TypeScript to
automatically infer the correct type based on the value of the discriminant
property.

Example (Initial Simple Union)

For example, let’s say you’ve defined a `Shape` union as a combination of `Circle` and `Square` without any special property:

```typescript
import { Schema } from "effect";

const Circle = Schema.Struct({
  radius: Schema.Number,
});

const Square = Schema.Struct({
  sideLength: Schema.Number,
});

const Shape = Schema.Union(Circle, Square);
```

To make your code more manageable, you may want to transform the simple union
into a discriminated union. This way, TypeScript will be able to automatically
determine which member of the union you’re working with based on the value of a
specific property.

To achieve this, you can add a special property to each member of the union,
which will allow TypeScript to know which type it’s dealing with at runtime. Here’s
how you can [transform](https://effect.website/docs/schema/transformations/#transform) the `Shape` schema into another schema that represents a discriminated union:

Example (Adding Discriminant Property)

```typescript
import { Schema } from "effect";

const Circle = Schema.Struct({
  radius: Schema.Number,
});

const Square = Schema.Struct({
  sideLength: Schema.Number,
});

const DiscriminatedShape = Schema.Union(
  Schema.transform(
    Circle,
    // Add a "kind" property with the literal value "circle" to Circle
    Schema.Struct({ ...Circle.fields, kind: Schema.Literal("circle") }),
    {
      strict: true,
      // Add the discriminant property to Circle
      decode: (circle) => ({ ...circle, kind: "circle" as const }),
      // Remove the discriminant property
      encode: ({ kind: _kind, ...rest }) => rest,
    },
  ),
  Schema.transform(
    Square,
    // Add a "kind" property with the literal value "square" to Square
    Schema.Struct({ ...Square.fields, kind: Schema.Literal("square") }),
    {
      strict: true,
      // Add the discriminant property to Square
      decode: (square) => ({ ...square, kind: "square" as const }),
      // Remove the discriminant property
      encode: ({ kind: _kind, ...rest }) => rest,
    },
  ),
);

console.log(Schema.decodeUnknownSync(DiscriminatedShape)({ radius: 10 }));
// Output: { radius: 10, kind: 'circle' }

console.log(Schema.decodeUnknownSync(DiscriminatedShape)({ sideLength: 10 }));
// Output: { sideLength: 10, kind: 'square' }
```

The previous solution works perfectly and shows how we can add properties to our
schema at will, making it easier to consume the result within our domain model.
However, it requires a lot of boilerplate. Fortunately, there is an API called `Schema.attachPropertySignature` designed specifically for this use case, which allows us to achieve the same
result with much less effort:

Example (Using `Schema.attachPropertySignature` for Less Code)

```typescript
import { Schema } from "effect";

const Circle = Schema.Struct({
  radius: Schema.Number,
});

const Square = Schema.Struct({
  sideLength: Schema.Number,
});

const DiscriminatedShape = Schema.Union(
  Circle.pipe(Schema.attachPropertySignature("kind", "circle")),
  Square.pipe(Schema.attachPropertySignature("kind", "square")),
);

// decoding
console.log(Schema.decodeUnknownSync(DiscriminatedShape)({ radius: 10 }));
// Output: { radius: 10, kind: 'circle' }

// encoding
console.log(
  Schema.encodeSync(DiscriminatedShape)({
    kind: "circle",
    radius: 10,
  }),
);
// Output: { radius: 10 }
```

Please note that with `Schema.attachPropertySignature`, you can only add a property, it cannot replace or override an existing one.

### Exposed Values

You can access the individual members of a union schema represented as a tuple:

```typescript
import { Schema } from "effect";

const schema = Schema.Union(Schema.String, Schema.Number);

// Accesses the members of the union
const members = schema.members;

//      ┌─── typeof Schema.String
//      ▼
const firstMember = members[0];

//      ┌─── typeof Schema.Number
//      ▼
const secondMember = members[1];
```

## Tuples

Tuples
The Schema module allows you to define tuples, which are ordered collections of
elements that may have different types. You can define tuples with required,
optional, or rest elements.

### Required Elements

To define a tuple with required elements, you can use the `Schema.Tuple` constructor and simply list the element schemas in order:

Example (Defining a Tuple with Required Elements)

```typescript
import { Schema } from "effect";

// Define a tuple with a string and a number as required elements
//
//      ┌─── Tuple<[typeof Schema.String, typeof Schema.Number]>
//      ▼
const schema = Schema.Tuple(Schema.String, Schema.Number);

//     ┌─── readonly [string, number]
//     ▼
type Type = typeof schema.Type;
```

### Append a Required Element

You can append additional required elements to an existing tuple by using the
spread operator:

Example (Adding an Element to an Existing Tuple)

```typescript
import { Schema } from "effect";

const tuple1 = Schema.Tuple(Schema.String, Schema.Number);

// Append a boolean to the existing tuple
const tuple2 = Schema.Tuple(...tuple1.elements, Schema.Boolean);

//     ┌─── readonly [string, number, boolean]
//     ▼
type Type = typeof tuple2.Type;
```

### Optional Elements

To define an optional element, use the `Schema.optionalElement` constructor.

Example (Defining a Tuple with Optional Elements)

```typescript
import { Schema } from "effect";

// Define a tuple with a required string and an optional number
const schema = Schema.Tuple(
  Schema.String, // required element
  Schema.optionalElement(Schema.Number), // optional element
);

//     ┌─── readonly [string, number?]
//     ▼
type Type = typeof schema.Type;
```

### Rest Element

To define a rest element, add it after the list of required or optional
elements. The rest element allows the tuple to accept additional elements of a specific
type.

Example (Using a Rest Element)

```typescript
import { Schema } from "effect";

// Define a tuple with required elements and a rest element of type boolean
const schema = Schema.Tuple(
  [Schema.String, Schema.optionalElement(Schema.Number)], // elements
  Schema.Boolean, // rest element
);

//     ┌─── readonly [string, number?, ...boolean[]]
//     ▼
type Type = typeof schema.Type;
```

You can also include other elements after the rest:

Example (Including Additional Elements After a Rest Element)

```typescript
import { Schema } from "effect";

// Define a tuple with required elements, a rest element,
// and an additional element
const schema = Schema.Tuple(
  [Schema.String, Schema.optionalElement(Schema.Number)], // elements
  Schema.Boolean, // rest element
  Schema.String, // additional element
);

//     ┌─── readonly [string, number | undefined, ...boolean[], string]
//     ▼
type Type = typeof schema.Type;
```

### Annotations

Annotations are useful for adding metadata to tuple elements, making it easier
to describe their purpose or requirements. This is especially helpful for
generating documentation or JSON schemas.

Example (Adding Annotations to Tuple Elements)

```typescript
import { JSONSchema, Schema } from "effect";

// Define a tuple representing a point with annotations for each coordinate
const Point = Schema.Tuple(
  Schema.element(Schema.Number).annotations({
    title: "X",
    description: "X coordinate",
  }),
  Schema.optionalElement(Schema.Number).annotations({
    title: "Y",
    description: "optional Y coordinate",
  }),
);

// Generate a JSON Schema from the tuple
console.log(JSONSchema.make(Point));
/*
Output:
{
  '$schema': 'http://json-schema.org/draft-07/schema#',
  type: 'array',
  minItems: 1,
  items: [
    { type: 'number', description: 'X coordinate', title: 'X' },
    {
      type: 'number',
      description: 'optional Y coordinate',
      title: 'Y'
    }
  ],
  additionalItems: false
}
*/
```

### Exposed Values

You can access the elements and rest elements of a tuple schema using the `elements` and `rest` properties:

Example (Accessing Elements and Rest Element in a Tuple Schema)

```typescript
import { Schema } from "effect";

// Define a tuple with required, optional, and rest elements
const schema = Schema.Tuple(
  [Schema.String, Schema.optionalElement(Schema.Number)], // elements
  Schema.Boolean, // rest element
  Schema.String, // additional element
);

// Access the required and optional elements of the tuple
//
//      ┌─── readonly [typeof Schema.String, Schema.Element<typeof Schema.Number, "?">]
//      ▼
const tupleElements = schema.elements;

// Access the rest element of the tuple
//
//      ┌─── readonly [typeof Schema.Boolean, typeof Schema.String]
//      ▼
const restElement = schema.rest;
```

## Arrays

Arrays
The Schema module allows you to define schemas for arrays, making it easy to
validate collections of elements of a specific type.

Example (Defining an Array Schema)

```typescript
import { Schema } from "effect";

// Define a schema for an array of numbers
//
//      ┌─── Array$<typeof Schema.Number>
//      ▼
const schema = Schema.Array(Schema.Number);

//     ┌─── readonly number[]
//     ▼
type Type = typeof schema.Type;
```

### Mutable Arrays

By default, `Schema.Array` generates a type marked as `readonly`. To create a schema for a mutable array, you can use the `Schema.mutable` function, which makes the array type mutable in a shallow manner.

Example (Creating a Mutable Array Schema)

```typescript
import { Schema } from "effect";

// Define a schema for a mutable array of numbers
//
//      ┌─── mutable<Schema.Array$<typeof Schema.Number>>
//      ▼
const schema = Schema.mutable(Schema.Array(Schema.Number));

//     ┌─── number[]
//     ▼
type Type = typeof schema.Type;
```

### Exposed Values

You can access the value type of an array schema using the `value` property:

Example (Accessing the Value Type of an Array Schema)

```typescript
import { Schema } from "effect";

const schema = Schema.Array(Schema.Number);

// Access the value type of the array schema
//
//      ┌─── typeof Schema.Number
//      ▼
const value = schema.value;
```

## Non Empty Arrays

Non Empty Arrays
The Schema module also provides a way to define schemas for non-empty arrays,
ensuring that the array always contains at least one element.

Example (Defining a Non-Empty Array Schema)

```typescript
import { Schema } from "effect";

// Define a schema for a non-empty array of numbers
//
//      ┌─── NonEmptyArray<typeof Schema.Number>
//      ▼
const schema = Schema.NonEmptyArray(Schema.Number);

//     ┌─── readonly [number, ...number[]]
//     ▼
type Type = typeof schema.Type;
```

### Exposed Values

You can access the value type of a non-empty array schema using the `value` property:

Example (Accessing the Value Type of a Non-Empty Array Schema)

```typescript
import { Schema } from "effect";

// Define a schema for a non-empty array of numbers
const schema = Schema.NonEmptyArray(Schema.Number);

// Access the value type of the non-empty array schema
//
//      ┌─── typeof Schema.Number
//      ▼
const value = schema.value;
```

## Records

Records
The Schema module provides support for defining record types, which are
collections of key-value pairs where the key can be a string, symbol, or other types,
and the value has a defined schema.

### String Keys

You can define a record with string keys and a specified type for the values.

Example (String Keys with Number Values)

```typescript
import { Schema } from "effect";

// Define a record schema with string keys and number values
//
//      ┌─── Record$<typeof Schema.String, typeof Schema.Number>
//      ▼
const schema = Schema.Record({ key: Schema.String, value: Schema.Number });

//     ┌─── { readonly [x: string]: number; }
//     ▼
type Type = typeof schema.Type;
```

### Symbol Keys

Records can also use symbols as keys.

Example (Symbol Keys with Number Values)

```typescript
import { Schema } from "effect";

// Define a record schema with symbol keys and number values
const schema = Schema.Record({
  key: Schema.SymbolFromSelf,
  value: Schema.Number,
});

//     ┌─── { readonly [x: symbol]: number; }
//     ▼
type Type = typeof schema.Type;
```

### Union of Literal Keys

Use a union of literals to restrict keys to a specific set of values.

Example (Union of String Literals as Keys)

```typescript
import { Schema } from "effect";

// Define a record schema where keys are limited
// to specific string literals ("a" or "b")
const schema = Schema.Record({
  key: Schema.Union(Schema.Literal("a"), Schema.Literal("b")),
  value: Schema.Number,
});

//     ┌─── { readonly a: number; readonly b: number; }
//     ▼
type Type = typeof schema.Type;
```

### Template Literal Keys

Records can use template literals as keys, allowing for more complex key
patterns.

Example (Template Literal Keys with Number Values)

```typescript
import { Schema } from "effect";

// Define a record schema with keys that match
// the template literal pattern "a${string}"
const schema = Schema.Record({
  key: Schema.TemplateLiteral(Schema.Literal("a"), Schema.String),
  value: Schema.Number,
});

//     ┌─── { readonly [x: `a${string}`]: number; }
//     ▼
type Type = typeof schema.Type;
```

### Refined Keys

You can refine the key type with additional constraints.

Example (Filtering Keys by Minimum Length)

```typescript
import { Schema } from "effect";

// Define a record schema where keys are strings with a minimum length of 2
const schema = Schema.Record({
  key: Schema.String.pipe(Schema.minLength(2)),
  value: Schema.Number,
});

//     ┌─── { readonly [x: string]: number; }
//     ▼
type Type = typeof schema.Type;
```

Refinements on keys act as filters rather than causing a decoding failure. If a
key does not meet the constraints (such as a pattern or minimum length check),
it is removed from the decoded output instead of triggering an error.

Example (Keys That Do Not Meet Constraints Are Removed)

```typescript
import { Schema } from "effect";

const schema = Schema.Record({
  key: Schema.String.pipe(Schema.minLength(2)),
  value: Schema.Number,
});

console.log(Schema.decodeUnknownSync(schema)({ a: 1, bb: 2 }));
// Output: { bb: 2 } ("a" is removed because it is too short)
```

If you want decoding to fail when a key does not meet the constraints, you can
set [onExcessProperty](https://effect.website/docs/schema/getting-started/#managing-excess-properties) to `"error"`.

Example (Forcing an Error on Invalid Keys)

```typescript
import { Schema } from "effect";

const schema = Schema.Record({
  key: Schema.String.pipe(Schema.minLength(2)),
  value: Schema.Number,
});

console.log(
  Schema.decodeUnknownSync(schema, { onExcessProperty: "error" })({
    a: 1,
    bb: 2,
  }),
);
/*
throws:
ParseError: { readonly [x: minLength(2)]: number }
└─ ["a"]
   └─ is unexpected, expected: minLength(2)
*/
```

### Transforming Keys

The `Schema.Record` API does not support transformations on key schemas. Attempting to apply a
transformation to keys will result in an `Unsupported key schema` error:

Example (Attempting to Transform Keys)

```typescript
import { Schema } from "effect";

const schema = Schema.Record({
  key: Schema.Trim,
  value: Schema.NumberFromString,
});
/*
throws:
Error: Unsupported key schema
schema (Transformation): Trim
*/
```

This restriction exists because transformations can create conflicts if multiple
keys map to the same value after transformation. To prevent these issues, key
transformations must be handled explicitly by the user.

To modify record keys, you must apply transformations outside of `Schema.Record`. A common approach is to use [Schema.transform](https://effect.website/docs/schema/transformations/#transform) to adjust keys during decoding.

Example (Trimming Keys While Decoding)

```typescript
import { identity, Record, Schema } from "effect";

const schema = Schema.transform(
  // Define the input schema with unprocessed keys
  Schema.Record({
    key: Schema.String,
    value: Schema.NumberFromString,
  }),
  // Define the output schema with transformed keys
  Schema.Record({
    key: Schema.Trimmed,
    value: Schema.Number,
  }),
  {
    strict: true,
    // Trim keys during decoding
    decode: (record) => Record.mapKeys(record, (key) => key.trim()),
    encode: identity,
  },
);

console.log(Schema.decodeUnknownSync(schema)({ " key1 ": "1", key2: "2" }));
// Output: { key1: 1, key2: 2 }
```

### Mutable Records

By default, `Schema.Record` generates a type marked as `readonly`. To create a schema for a mutable record, you can use the `Schema.mutable` function, which makes the record type mutable in a shallow manner.

Example (Creating a Mutable Record Schema)

```typescript
import { Schema } from "effect";

// Create a schema for a mutable record with string keys and number values
const schema = Schema.mutable(
  Schema.Record({ key: Schema.String, value: Schema.Number }),
);

//     ┌─── { [x: string]: number; }
//     ▼
type Type = typeof schema.Type;
```

### Exposed Values

You can access the `key` and `value` types of a record schema using the `key` and `value` properties:

Example (Accessing Key and Value Types)

```typescript
import { Schema } from "effect";

const schema = Schema.Record({ key: Schema.String, value: Schema.Number });

// Accesses the key
//
//     ┌─── typeof Schema.String
//     ▼
const key = schema.key;

// Accesses the value
//
//      ┌─── typeof Schema.Number
//      ▼
const value = schema.value;
```

## Structs

### Property Signatures

The `Schema.Struct` constructor defines a schema for an object with specific properties.

Example (Defining a Struct Schema)

This example defines a struct schema for an object with the following
properties:

- `name`: a string
- `age`: a number

```typescript
import { Schema } from "effect";

//      ┌─── Schema.Struct<{
//      │      name: typeof Schema.String;
//      │      age: typeof Schema.Number;
//      │    }>
//      ▼
const schema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
});

// The inferred TypeScript type from the schema
//
//     ┌─── {
//     │      readonly name: string;
//     │      readonly age: number;
//     │    }
//     ▼
type Type = typeof schema.Type;
```

Using `Schema.Struct({})` results in a TypeScript type `{}`, which behaves similarly to `unknown`. This means that any data will be considered valid, as there are no defined
constraints.

### Index Signatures

The `Schema.Struct` constructor can optionally accept a list of key/value pairs representing index
signatures, allowing you to define additional dynamic properties.

```typescript
declare const Struct: (props, ...indexSignatures) => Struct<...>
```

Example (Adding an Index Signature)

```typescript
import { Schema } from "effect";

// Define a struct with a specific property "a"
// and an index signature allowing additional properties
const schema = Schema.Struct(
  // Defined properties
  { a: Schema.Number },
  // Index signature: allows additional string keys with number values
  { key: Schema.String, value: Schema.Number },
);

// The inferred TypeScript type:
//
//     ┌─── {
//     │      readonly [x: string]: number;
//     │      readonly a: number;
//     │    }
//     ▼
type Type = typeof schema.Type;
```

Example (Using `Schema.Record`)

You can achieve the same result using `Schema.Record`:

```typescript
import { Schema } from "effect";

// Define a struct with a fixed property "a"
// and a dynamic index signature using Schema.Record
const schema = Schema.Struct(
  { a: Schema.Number },
  Schema.Record({ key: Schema.String, value: Schema.Number }),
);

// The inferred TypeScript type:
//
//     ┌─── {
//     │      readonly [x: string]: number;
//     │      readonly a: number;
//     │    }
//     ▼
type Type = typeof schema.Type;
```

### Multiple Index Signatures

You can define one index signature per key type (`string` or `symbol`). Defining multiple index signatures of the same type is not allowed.

Example (Valid Multiple Index Signatures)

```typescript
import { Schema } from "effect";

// Define a struct with a fixed property "a"
// and valid index signatures for both strings and symbols
const schema = Schema.Struct(
  { a: Schema.Number },
  // String index signature
  { key: Schema.String, value: Schema.Number },
  // Symbol index signature
  { key: Schema.SymbolFromSelf, value: Schema.Number },
);

// The inferred TypeScript type:
//
//     ┌─── {
//     │      readonly [x: string]: number;
//     │      readonly [x: symbol]: number;
//     │      readonly a: number;
//     │    }
//     ▼
type Type = typeof schema.Type;
```

Defining multiple index signatures of the same key type (`string` or `symbol`) will cause an error.

Example (Invalid Multiple Index Signatures)

```typescript
import { Schema } from "effect";

Schema.Struct(
  { a: Schema.Number },
  // Attempting to define multiple string index signatures
  { key: Schema.String, value: Schema.Number },
  { key: Schema.String, value: Schema.Boolean },
);
/*
throws:
Error: Duplicate index signature
details: string index signature
*/
```

### Conflicting Index Signatures

When defining schemas with index signatures, conflicts can arise if a fixed
property has a different type than the values allowed by the index signature. This
can lead to unexpected TypeScript behavior.

Example (Conflicting Index Signature)

```typescript
import { Schema } from "effect";

// Attempting to define a struct with a conflicting index signature
// - The fixed property "a" is a number
// - The index signature requires all values to be strings
const schema = Schema.Struct(
  { a: Schema.String },
  { key: Schema.String, value: Schema.Number },
);

// ❌ Incorrect TypeScript type:
//
//     ┌─── {
//     │      readonly [x: string]: number;
//     │      readonly a: string;
//     │    }
//     ▼
type Type = typeof schema.Type;
```

The TypeScript compiler flags this as an error when defining the type manually:

```typescript
// This type is invalid because the index signature
// conflicts with the fixed property `a`
type Test = {
  readonly a: string; // Error ts(2411) ― Property 'a' of type 'string' is not assignable to 'string' index type 'number'.
  readonly [x: string]: number;
};
```

This happens because TypeScript does not allow an index signature to contradict
a fixed property.

#### Workaround for Conflicting Index Signatures

When working with schemas, a conflict can occur if a fixed property has a
different type than the values allowed by an index signature. This situation often
arises when dealing with external APIs that do not follow strict TypeScript
conventions.

To prevent conflicts, you can separate the fixed properties from the indexed
properties and handle them as distinct parts of the schema.

Example (Extracting Fixed and Indexed Properties)

Consider an object where:

- `"a"` is a fixed property of type `string`.
- All other keys store numbers, which conflict with `"a"`.

```typescript
// This type is invalid because the index signature
// conflicts with the fixed property `a`
type Test = {
  a: string; // Error ts(2411) ― Property 'a' of type 'string' is not assignable to 'string' index type 'number'.
  [x: string]: number;
};
```

To avoid this issue, we can separate the properties into two distinct types:

```typescript
// Fixed properties schema
type FixedProperties = {
  readonly a: string;
};

// Index signature properties schema
type IndexSignatureProperties = {
  readonly [x: string]: number;
};

// The final output groups both properties in a tuple
type OutputData = readonly [FixedProperties, IndexSignatureProperties];
```

By using [Schema.transform](https://effect.website/docs/schema/transformations/#transform) and [Schema.compose](https://effect.website/docs/schema/transformations/#composition), you can preprocess the input data before validation. This approach ensures
that fixed properties and index signature properties are treated independently.

```typescript
import { Schema } from "effect";

// Define a schema for the fixed property "a"
const FixedProperties = Schema.Struct({
  a: Schema.String,
});

// Define a schema for index signature properties
const IndexSignatureProperties = Schema.Record({
  // Exclude keys that are already present in FixedProperties
  key: Schema.String.pipe(
    Schema.filter((key) => !Object.keys(FixedProperties.fields).includes(key)),
  ),
  value: Schema.Number,
});

// Create a schema that duplicates an object into two parts
const Duplicate = Schema.transform(
  Schema.Object,
  Schema.Tuple(Schema.Object, Schema.Object),
  {
    strict: true,
    // Create a tuple containing the input twice
    decode: (a) => [a, a] as const,
    // Merge both parts back when encoding
    encode: ([a, b]) => ({ ...a, ...b }),
  },
);

//      ┌─── Schema<readonly [
//      |      { readonly a: string; },
//      |      { readonly [x: string]: number; }
//      |    ], object>
//      ▼
const Result = Schema.compose(
  Duplicate,
  Schema.Tuple(FixedProperties, IndexSignatureProperties).annotations({
    parseOptions: { onExcessProperty: "ignore" },
  }),
);

// Decoding: Separates fixed and indexed properties
console.log(Schema.decodeUnknownSync(Result)({ a: "a", b: 1, c: 2 }));
// Output: [ { a: 'a' }, { b: 1, c: 2 } ]

// Encoding: Combines them back into an object
console.log(Schema.encodeSync(Result)([{ a: "a" }, { b: 1, c: 2 }]));
// Output: { a: 'a', b: 1, c: 2 }
```

### Exposed Values

You can access the fields and records of a struct schema using the `fields` and `records` properties:

Example (Accessing Fields and Records)

```typescript
import { Schema } from "effect";

const schema = Schema.Struct(
  { a: Schema.Number },
  Schema.Record({ key: Schema.String, value: Schema.Number }),
);

// Accesses the fields
//
//      ┌─── { readonly a: typeof Schema.Number; }
//      ▼
const fields = schema.fields;

// Accesses the records
//
//      ┌─── readonly [Schema.Record$<typeof Schema.String, typeof Schema.Number>]
//      ▼
const records = schema.records;
```

### Mutable Structs

By default, `Schema.Struct` generates a type with properties marked as `readonly`. To create a mutable version of the struct, use the `Schema.mutable` function, which makes the properties mutable in a shallow manner.

Example (Creating a Mutable Struct Schema)

```typescript
import { Schema } from "effect";

const schema = Schema.mutable(
  Schema.Struct({ a: Schema.String, b: Schema.Number }),
);

//     ┌─── { a: string; b: number; }
//     ▼
type Type = typeof schema.Type;
```

## Tagged Structs

In TypeScript tags help to enhance type discrimination and pattern matching by
providing a simple yet powerful way to define and recognize different data types.

### What is a Tag?

A tag is a literal value added to data structures, commonly used in structs, to
distinguish between various object types or variants within tagged unions. This
literal acts as a discriminator, making it easier to handle and process
different types of data correctly and efficiently.

### Using the tag Constructor

The `Schema.tag` constructor is specifically designed to create a property signature that holds
a specific literal value, serving as the discriminator for object types.

Example (Defining a Tagged Struct)

```typescript
import { Schema } from "effect";

const User = Schema.Struct({
  _tag: Schema.tag("User"),
  name: Schema.String,
  age: Schema.Number,
});

//     ┌─── { readonly _tag: "User"; readonly name: string; readonly age: number; }
//     ▼
type Type = typeof User.Type;

console.log(User.make({ name: "John", age: 44 }));
/*
Output:
{ _tag: 'User', name: 'John', age: 44 }
*/
```

In the example above, `Schema.tag("User")` attaches a `_tag` property to the `User` struct schema, effectively labeling objects of this struct type as “User”. This
label is automatically applied when using the `make` method to create new instances, simplifying object creation and ensuring
consistent tagging.

### Simplifying Tagged Structs with TaggedStruct

The `Schema.TaggedStruct` constructor streamlines the process of creating tagged structs by directly
integrating the tag into the struct definition. This method provides a clearer and
more declarative approach to building data structures with embedded
discriminators.

Example (Using `TaggedStruct` for a Simplified Tagged Struct)

```typescript
import { Schema } from "effect";

const User = Schema.TaggedStruct("User", {
  name: Schema.String,
  age: Schema.Number,
});

// `_tag` is automatically applied when constructing an instance
console.log(User.make({ name: "John", age: 44 }));
// Output: { _tag: 'User', name: 'John', age: 44 }

// `_tag` is required when decoding from an unknown source
console.log(Schema.decodeUnknownSync(User)({ name: "John", age: 44 }));
/*
throws:
ParseError: { readonly _tag: "User"; readonly name: string; readonly age: number }
└─ ["_tag"]
   └─ is missing
*/
```

In this example:

- The `_tag` property is optional when constructing an instance with `make`, allowing the schema to automatically apply it.
- When decoding unknown data, `_tag` is required to ensure correct type identification. This distinction between
  instance construction and decoding is useful for preserving the tag’s role as a
  type discriminator while simplifying instance creation.

If you need `_tag` to be applied automatically during decoding as well, you can create a
customized version of `Schema.TaggedStruct`:

Example (Custom `TaggedStruct` with `_tag` Applied during Decoding)

```typescript
import type { SchemaAST } from "effect";
import { Schema } from "effect";

const TaggedStruct = <
  Tag extends SchemaAST.LiteralValue,
  Fields extends Schema.Struct.Fields,
>(
  tag: Tag,
  fields: Fields,
) =>
  Schema.Struct({
    _tag: Schema.Literal(tag).pipe(
      Schema.optional,
      Schema.withDefaults({
        constructor: () => tag, // Apply _tag during instance construction
        decoding: () => tag, // Apply _tag during decoding
      }),
    ),
    ...fields,
  });

const User = TaggedStruct("User", {
  name: Schema.String,
  age: Schema.Number,
});

console.log(User.make({ name: "John", age: 44 }));
// Output: { _tag: 'User', name: 'John', age: 44 }

console.log(Schema.decodeUnknownSync(User)({ name: "John", age: 44 }));
// Output: { _tag: 'User', name: 'John', age: 44 }
```

### Multiple Tags

While a primary tag is often sufficient, TypeScript allows you to define
multiple tags for more complex data structuring needs. Here’s an example demonstrating
the use of multiple tags within a single struct:

Example (Adding Multiple Tags to a Struct)

This example defines a product schema with a primary tag (`"Product"`) and an additional category tag (`"Electronics"`), adding further specificity to the data structure.

```typescript
import { Schema } from "effect";

const Product = Schema.TaggedStruct("Product", {
  category: Schema.tag("Electronics"),
  name: Schema.String,
  price: Schema.Number,
});

// `_tag` and `category` are optional when creating an instance
console.log(Product.make({ name: "Smartphone", price: 999 }));
/*
Output:
{
  _tag: 'Product',
  category: 'Electronics',
  name: 'Smartphone',
  price: 999
}
*/
```

## instanceOf

When you need to define a schema for your custom data type defined through a `class`, the most convenient and fast way is to use the `Schema.instanceOf` constructor.

Example (Defining a Schema with `instanceOf`)

```typescript
import { Schema } from "effect";

// Define a custom class
class MyData {
  constructor(readonly name: string) {}
}

// Create a schema for the class
const MyDataSchema = Schema.instanceOf(MyData);

//     ┌─── MyData
//     ▼
type Type = typeof MyDataSchema.Type;

console.log(Schema.decodeUnknownSync(MyDataSchema)(new MyData("name")));
// Output: MyData { name: 'name' }

console.log(Schema.decodeUnknownSync(MyDataSchema)({ name: "name" }));
/*
throws:
ParseError: Expected MyData, actual {"name":"name"}
*/
```

The `Schema.instanceOf` constructor is just a lightweight wrapper of the [Schema.declare](https://effect.website/docs/schema/advanced-usage/#declaring-new-data-types) API, which is the primitive in `effect/Schema` for declaring new custom data types.

### Private Constructors

Note that `Schema.instanceOf` can only be used for classes that expose a public constructor. If you try to use it with classes that, for some reason, have marked the
constructor as `private`, you’ll receive a TypeScript error:

Example (Error With Private Constructors)

```typescript
import { Schema } from "effect";

class MyData {
  static make = (name: string) => new MyData(name);
  private constructor(readonly name: string) {}
}

const MyDataSchema = Schema.instanceOf(MyData); // Error ts(2345) ― Argument of type 'typeof MyData' is not assignable to parameter of type 'abstract new (...args: any) => any'. Cannot assign a 'private' constructor type to a 'public' constructor type.
```

In such cases, you cannot use `Schema.instanceOf`, and you must rely on [Schema.declare](https://effect.website/docs/schema/advanced-usage/#declaring-new-data-types) like this:

Example (Using `Schema.declare` With Private Constructors)

```typescript
import { Schema } from "effect";

class MyData {
  static make = (name: string) => new MyData(name);
  private constructor(readonly name: string) {}
}

const MyDataSchema = Schema.declare(
  (input: unknown): input is MyData => input instanceof MyData,
).annotations({ identifier: "MyData" });

console.log(Schema.decodeUnknownSync(MyDataSchema)(MyData.make("name")));
// Output: MyData { name: 'name' }

console.log(Schema.decodeUnknownSync(MyDataSchema)({ name: "name" }));
/*
throws:
ParseError: Expected MyData, actual {"name":"name"}
*/
```

### Validating Fields of the Instance

To validate the fields of a class instance, you can use a [filter](https://effect.website/docs/schema/filters/). This approach combines instance validation with additional checks on the
instance’s fields.

Example (Adding Field Validation to an Instance Schema)

```typescript
import { Either, ParseResult, Schema } from "effect";

class MyData {
  constructor(readonly name: string) {}
}

const MyDataFields = Schema.Struct({
  name: Schema.NonEmptyString,
});

// Define a schema for the class instance with additional field validation
const MyDataSchema = Schema.instanceOf(MyData).pipe(
  Schema.filter((a, options) =>
    // Validate the fields of the instance
    ParseResult.validateEither(MyDataFields)(a, options).pipe(
      // Invert success and failure for filtering
      Either.flip,
      // Return undefined if validation succeeds, or an error if it fails
      Either.getOrUndefined,
    ),
  ),
);

// Example: Valid instance
console.log(Schema.validateSync(MyDataSchema)(new MyData("John")));
// Output: MyData { name: 'John' }

// Example: Invalid instance (empty name)
console.log(Schema.validateSync(MyDataSchema)(new MyData("")));
/*
throws:
ParseError: { MyData | filter }
└─ Predicate refinement failure
   └─ { readonly name: NonEmptyString }
      └─ ["name"]
         └─ NonEmptyString
            └─ Predicate refinement failure
               └─ Expected a non empty string, actual ""
*/
```

## Picking

The `pick` static function available on each struct schema can be used to create a new `Struct` by selecting specific properties from an existing `Struct`.

Example (Picking Properties from a Struct)

```typescript
import { Schema } from "effect";

// Define a struct schema with properties "a", "b", and "c"
const MyStruct = Schema.Struct({
  a: Schema.String,
  b: Schema.Number,
  c: Schema.Boolean,
});

// Create a new schema that picks properties "a" and "c"
//
//      ┌─── Struct<{
//      |      a: typeof Schema.String;
//      |      c: typeof Schema.Boolean;
//      |    }>
//      ▼
const PickedSchema = MyStruct.pick("a", "c");
```

The `Schema.pick` function can be applied more broadly beyond just `Struct` types, such as with unions of schemas. However it returns a generic `SchemaClass`.

Example (Picking Properties from a Union)

```typescript
import { Schema } from "effect";

// Define a union of two struct schemas
const MyUnion = Schema.Union(
  Schema.Struct({ a: Schema.String, b: Schema.String, c: Schema.String }),
  Schema.Struct({ a: Schema.Number, b: Schema.Number, d: Schema.Number }),
);

// Create a new schema that picks properties "a" and "b"
//
//      ┌─── SchemaClass<{
//      |      readonly a: string | number;
//      |      readonly b: string | number;
//      |    }>
//      ▼
const PickedSchema = MyUnion.pipe(Schema.pick("a", "b"));
```

## Omitting

The `omit` static function available in each struct schema can be used to create a new `Struct` by excluding particular properties from an existing `Struct`.

Example (Omitting Properties from a Struct)

```typescript
import { Schema } from "effect";

// Define a struct schema with properties "a", "b", and "c"
const MyStruct = Schema.Struct({
  a: Schema.String,
  b: Schema.Number,
  c: Schema.Boolean,
});

// Create a new schema that omits property "b"
//
//      ┌─── Schema.Struct<{
//      |      a: typeof Schema.String;
//      |      c: typeof Schema.Boolean;
//      |    }>
//      ▼
const PickedSchema = MyStruct.omit("b");
```

The `Schema.omit` function can be applied more broadly beyond just `Struct` types, such as with unions of schemas. However it returns a generic `Schema`.

Example (Omitting Properties from a Union)

```typescript
import { Schema } from "effect";

// Define a union of two struct schemas
const MyUnion = Schema.Union(
  Schema.Struct({ a: Schema.String, b: Schema.String, c: Schema.String }),
  Schema.Struct({ a: Schema.Number, b: Schema.Number, d: Schema.Number }),
);

// Create a new schema that omits property "b"
//
//      ┌─── SchemaClass<{
//      |      readonly a: string | number;
//      |    }>
//      ▼
const PickedSchema = MyUnion.pipe(Schema.omit("b"));
```

## partial

The `Schema.partial` function makes all properties within a schema optional.

Example (Making All Properties Optional)

```typescript
import { Schema } from "effect";

// Create a schema with an optional property "a"
const schema = Schema.partial(Schema.Struct({ a: Schema.String }));

//     ┌─── { readonly a?: string | undefined; }
//     ▼
type Type = typeof schema.Type;
```

By default, the `Schema.partial` operation adds `undefined` to the type of each property. If you want to avoid this, you can use `Schema.partialWith` and pass `{ exact: true }` as an argument.

Example (Defining an Exact Partial Schema)

```typescript
import { Schema } from "effect";

// Create a schema with an optional property "a" without allowing undefined
const schema = Schema.partialWith(
  Schema.Struct({
    a: Schema.String,
  }),
  { exact: true },
);

//     ┌─── { readonly a?: string; }
//     ▼
type Type = typeof schema.Type;
```

## required

The `Schema.required` function ensures that all properties in a schema are mandatory.

Example (Making All Properties Required)

```typescript
import { Schema } from "effect";

// Create a schema and make all properties required
const schema = Schema.required(
  Schema.Struct({
    a: Schema.optionalWith(Schema.String, { exact: true }),
    b: Schema.optionalWith(Schema.Number, { exact: true }),
  }),
);

//     ┌─── { readonly a: string; readonly b: number; }
//     ▼
type Type = typeof schema.Type;
```

In this example, both `a` and `b` are made required, even though they were initially defined as optional.

## keyof

The `Schema.keyof` operation creates a schema that represents the keys of a given object schema.

Example (Extracting Keys from an Object Schema)

```typescript
import { Schema } from "effect";

const schema = Schema.Struct({
  a: Schema.String,
  b: Schema.Number,
});

const keys = Schema.keyof(schema);

//     ┌─── "a" | "b"
//     ▼
type Type = typeof keys.Type;
```
