# Advanced Usage

## Declaring New Data Types

...

### Primitive Data Types

Primitive Data Types
To declare a schema for a primitive data type, such as `File`, you can use the `Schema.declare` function along with a type guard.

Example (Declaring a Schema for `File`)

```
   import { Schema } from "effect"
   // Declare a schema for the File type using a type guard   const FileFromSelf = Schema.declare(     (input: unknown): input is File => input instanceof File   )
   const decode = Schema.decodeUnknownSync(FileFromSelf)
   // Decoding a valid File object   console.log(decode(new File([], "")))   /*   Output:   File { size: 0, type: '', name: '', lastModified: 1724774163056 }   */
   // Decoding an invalid input   decode(null)   /*   throws   ParseError: Expected <declaration schema>, actual null   */
```

Annotations like `identifier` and `description` are useful for improving error messages and making schemas self-documenting.
...
...

# Advanced Usage

## Declaring New Data Types

...

### Primitive Data Types

...
To enhance the default error message, you can add annotations, particularly the `identifier`, `title`, and `description` annotations (none of these annotations are required, but they are encouraged
for good practice and can make your schema “self-documenting”). These annotations
will be utilized by the messaging system to return more meaningful messages.

• Identifier: a unique name for the schema
• Title: a brief, descriptive title
• Description: a detailed explanation of the schema’s purpose

Example (Declaring a Schema with Annotations)

```
   import { Schema } from "effect"
   // Declare a schema for the File type with additional annotations   const FileFromSelf = Schema.declare(     (input: unknown): input is File => input instanceof File,     {       // A unique identifier for the schema       identifier: "FileFromSelf",       // Detailed description of the schema       description: "The `File` type in JavaScript"     }   )
   const decode = Schema.decodeUnknownSync(FileFromSelf)
   ...
...
# Advanced Usage


## Declaring New Data Types
...
### Primitive Data Types
...
   // Decoding a valid File object   console.log(decode(new File([], "")))   /*   Output:   File { size: 0, type: '', name: '', lastModified: 1724774163056 }   */
   // Decoding an invalid input   decode(null)   /*   throws   ParseError: Expected FileFromSelf, actual null   */
```

...
...

# Advanced Usage

## Declaring New Data Types

...

### Type Constructors

Type Constructors
Type constructors are generic types that take one or more types as arguments and
return a new type. To define a schema for a type constructor, you can use the `Schema.declare` function.

Example (Declaring a Schema for `ReadonlySet<A>`)

```
   import { ParseResult, Schema } from "effect"
   ...
...
# Advanced Usage


## Declaring New Data Types
...
### Type Constructors
...
   export const MyReadonlySet = <A, I, R>(     // Schema for the elements of the Set     item: Schema.Schema<A, I, R>   ): Schema.Schema<ReadonlySet<A>, ReadonlySet<I>, R> =>     Schema.declare(       // Store the schema for the Set's elements       [item],       {         // Decoding function         decode: (item) => (input, parseOptions, ast) => {           if (input instanceof Set) {             // Decode each element in the Set             const elements = ParseResult.decodeUnknown(Schema.Array(item))(               Array.from(input.values()),               parseOptions             )             // Return a ReadonlySet containing the decoded elements             return ParseResult.map(               elements,               (as): ReadonlySet<A> => new Set(as)             )           }           // Handle invalid input           return ParseResult.fail(new ParseResult.Type(ast, input))         },         // Encoding function         encode: (item) => (input, parseOptions, ast) => {           if (inp...
...
# Advanced Usage


## Declaring New Data Types
...
### Type Constructors
...
   // Define a schema for a ReadonlySet of numbers   const setOfNumbers = MyReadonlySet(Schema.NumberFromString)
   const decode = Schema.decodeUnknownSync(setOfNumbers)
   console.log(decode(new Set(["1", "2", "3"]))) // Set(3) { 1, 2, 3 }
   // Decode an invalid input   decode(null)   /*   throws   ParseError: Expected ReadonlySet<NumberFromString>, actual null   */
   // Decode a Set with an invalid element   decode(new Set(["1", null, "3"]))   /*   throws   ParseError: ReadonlyArray<NumberFromString>   └─ [1]      └─ NumberFromString         └─ Encoded side transformation failure            └─ Expected string, actual null   */
```

The decoding and encoding functions cannot rely on context (the `Requirements` type parameter) and cannot handle asynchronous effects. This means that only
synchronous operations are supported within these functions.
...
...

# Advanced Usage

## Declaring New Data Types

...

### Adding Compilers Annotations

Adding Compilers Annotations
When defining a new data type, some compilers like [Arbitrary](https://effect.website/docs/schema/arbitrary/) or [Pretty](https://effect.website/docs/schema/pretty/) may not know how to handle the new type. This can result in an error, as the
compiler may lack the necessary information for generating instances or producing
readable output:

Example (Attempting to Generate Arbitrary Values Without Required Annotations)

```
   import { Arbitrary, Schema } from "effect"
   // Define a schema for the File type   const FileFromSelf = Schema.declare(     (input: unknown): input is File => input instanceof File,     {       identifier: "FileFromSelf"     }   )
   // Try creating an Arbitrary instance for the schema   const arb = Arbitrary.make(FileFromSelf)   /*   throws:   Error: Missing annotation   details: Generating an Arbitrary for this schema requires an "arbitrary" annotation   schema (Declaration): FileFromSelf   */
```

...
...

# Advanced Usage

## Declaring New Data Types

...

### Adding Compilers Annotations

...
In the above example, attempting to generate arbitrary values for the `FileFromSelf` schema fails because the compiler lacks necessary annotations. To resolve this,
you need to provide annotations for generating arbitrary data:

Example (Adding Arbitrary Annotation for Custom `File` Schema)

```
   import { Arbitrary, FastCheck, Pretty, Schema } from "effect"
   const FileFromSelf = Schema.declare(     (input: unknown): input is File => input instanceof File,     {       identifier: "FileFromSelf",       // Provide a function to generate random File instances       arbitrary: () => (fc) =>         fc           .tuple(fc.string(), fc.string())           .map(([content, path]) => new File([content], path))     }   )
   // Create an Arbitrary instance for the schema   const arb = Arbitrary.make(FileFromSelf)
   ...
...
# Advanced Usage


## Declaring New Data Types
...
### Adding Compilers Annotations
...
   // Generate sample files using the Arbitrary instance   const files = FastCheck.sample(arb, 2)   console.log(files)   /*   Example Output:   [     File { size: 5, type: '', name: 'C', lastModified: 1706435571176 },     File { size: 1, type: '', name: '98Ggmc', lastModified: 1706435571176 }   ]   */
```

For more details on how to add annotations for the Arbitrary compiler, refer to
the [Arbitrary](https://effect.website/docs/schema/arbitrary/) documentation.
...
...

# Advanced Usage

## Declaring New Data Types

Declaring New Data Types

### Primitive Data Types

...

### Type Constructors

...

### Adding Compilers Annotations

...
...

# Advanced Usage

...

## Branded types

...

### Defining a brand schema from scratch

Defining a brand schema from scratch
To define a schema for a branded type from scratch, use the `Schema.brand` function.

Example (Creating a schema for a Branded Type)

```
   import { Schema } from "effect"
   const UserId = Schema.String.pipe(Schema.brand("UserId"))
   // string & Brand<"UserId">   type UserId = typeof UserId.Type
```

Note that you can use `unique symbol`s as brands to ensure uniqueness across modules / packages.

Example (Using a unique symbol as a Brand)

```
   import { Schema } from "effect"
   const UserIdBrand: unique symbol = Symbol.for("UserId")
   const UserId = Schema.String.pipe(Schema.brand(UserIdBrand))
   // string & Brand<typeof UserIdBrand>   type UserId = typeof UserId.Type
```

...
...

# Advanced Usage

...

## Branded types

...

### Reusing an existing branded constructor

Reusing an existing branded constructor
If you have already defined a branded type using the [effect/Brand](https://effect.website/docs/code-style/branded-types/) module, you can reuse it to define a schema using the `Schema.fromBrand` function.

Example (Reusing an Existing Branded Type)

```
   import { Schema } from "effect"   import { Brand } from "effect"
   // the existing branded type   type UserId = string & Brand.Brand<"UserId">
   const UserId = Brand.nominal<UserId>()
   // Define a schema for the branded type   const UserIdSchema = Schema.String.pipe(Schema.fromBrand(UserId))
```

...
...

# Advanced Usage

...

## Branded types

...

### Utilizing Default Constructors

Utilizing Default Constructors
The `Schema.brand` function includes a default constructor to facilitate the creation of branded
values.

```
   import { Schema } from "effect"
   const UserId = Schema.String.pipe(Schema.brand("UserId"))
   const userId = UserId.make("123") // Creates a branded UserId
```

...
...

# Advanced Usage

...

## Branded types

Branded types
TypeScript’s type system is structural, which means that any two types that are
structurally equivalent are considered the same. This can cause issues when
types that are semantically different are treated as if they were the same.

Example (Structural Typing Issue)

```
   type UserId = string   type Username = string
   declare const getUser: (id: UserId) => object
   const myUsername: Username = "gcanti"
   getUser(myUsername) // This erroneously works
```

In the above example, `UserId` and `Username` are both aliases for the same type, `string`. This means that the `getUser` function can mistakenly accept a `Username` as a valid `UserId`, causing bugs and errors.

To prevent this, Effect introduces branded types. These types attach a unique identifier (or “brand”) to a type, allowing you to
differentiate between structurally similar but semantically distinct types.

Example (Defining Branded Types)

```
   import { Brand } from "effect"
   ...
...
# Advanced Usage
...
## Branded types
...
   type UserId = string & Brand.Brand<"UserId">   type Username = string
   declare const getUser: (id: UserId) => object
   const myUsername: Username = "gcanti"
   getUser(myUsername)Error ts(2345) ― Argument of type 'string' is not assignable to parameter of type 'UserId'. Type 'string' is not assignable to type 'Brand<"UserId">'.
```

By defining `UserId` as a branded type, the `getUser` function can accept only values of type `UserId`, and not plain strings or other types that are compatible with strings. This
helps to prevent bugs caused by accidentally passing the wrong type of value to
the function.

There are two ways to define a schema for a branded type, depending on whether
you:

• want to define the schema from scratch
• have already defined a branded type via [effect/Brand](https://effect.website/docs/code-style/branded-types/) and want to reuse it to define a schema

### Defining a brand schema from scratch

...
...

# Advanced Usage

...

## Branded types

...

### Reusing an existing branded constructor

...

### Utilizing Default Constructors

...
...

# Advanced Usage

...

## Property Signatures

...

### Basic Usage

Basic Usage
A property signature can be defined with annotations to provide additional
context about a field.

Example (Adding Annotations to a Property Signature)

```
   import { Schema } from "effect"
   const Person = Schema.Struct({     name: Schema.String,     age: Schema.propertySignature(Schema.NumberFromString).annotations({       title: "Age" // Annotation to label the age field     })   })
```

A `PropertySignature` type contains several parameters, each providing details about the
transformation between the source field (From) and the target field (To). Let’s take a look
at what each of these parameters represents:

` ` `age`: PropertySignature`<` ` ` `ToToken,` ` ` `ToType,` ` ` `FromKey,` ` ` `FromToken,` ` ` `
FromType,` ` ` `HasDefault,` ` ` `Context` ` `>`
| |
| |
| age | Key of the “To” field |
...
...

# Advanced Usage

...

## Property Signatures

...

### Basic Usage

...
| ToToken | Indicates field requirement: "?:" for optional, ":" for required |
| ToType | Type of the “To” field |
| FromKey | (Optional, default = never) Indicates the source field key, typically the same as “To” field key unless specified |
| FromToken | Indicates source field requirement: "?:" for optional, ":" for required |
| FromType | Type of the “From” field |
| HasDefault | Indicates if there is a constructor default value (Boolean) |

In the example above, the `PropertySignature` type for `age` is:

` ` `PropertySignature`<`":"`, number, never, `":"`, string, `false`, never`>`
This means:

| |
| |
| age | Key of the “To” field |
| ToToken | ":" indicates that the age field is required |
| ToType | Type of the age field is number |
| FromKey | never indicates that the decoding occurs from the same field named age |
...
...

# Advanced Usage

...

## Property Signatures

...

### Basic Usage

...
| FromToken | ":" indicates that the decoding occurs from a required age field |
| FromType | Type of the “From” field is string |
| HasDefault | false: indicates there is no default value |

Sometimes, the source field (the “From” field) may have a different name from
the field in your internal model. You can map between these fields using the `Schema.fromKey` function.

Example (Mapping from a Different Key)

```
   import { Schema } from "effect"
   const Person = Schema.Struct({     name: Schema.String,     age: Schema.propertySignature(Schema.NumberFromString).pipe(       Schema.fromKey("AGE") // Maps from "AGE" to "age"     )   })
   console.log(Schema.decodeUnknownSync(Person)({ name: "name", AGE: "18" }))   // Output: { name: 'name', age: 18 }
```

When you map from `"AGE"` to `"age"`, the `PropertySignature` type changes to:
...
...

# Advanced Usage

...

## Property Signatures

...

### Basic Usage

...
` ` ` `-`PropertySignature`<`":"`, number, never, `":"`, string, `false`, never`>` ` ` `+`
PropertySignature`<`":"`, number, ` `"AGE"`, `":"`, string, `false`, never`>`
...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Basic Optional Property

...

##### Decoding

Decoding
| |
| |
| <missing value> | remains <missing value> |
| undefined | remains undefined |
| i: I | transforms to a: A |

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Basic Optional Property

...

##### Encoding

Encoding
| |
| |
| <missing value> | remains <missing value> |
| undefined | remains undefined |
| a: A | transforms back to i: I |

Example (Defining an Optional Number Field)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optional(Schema.NumberFromString)   })
   //     ┌─── { readonly quantity?: string | undefined; }   //     ▼   type Encoded = typeof Product.Encoded
   //     ┌─── { readonly quantity?: number | undefined; }   //     ▼   type Type = typeof Product.Type
   // Decoding examples
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Optional Fields
...
#### Basic Optional Property
...
##### Encoding
...
   console.log(Schema.decodeUnknownSync(Product)({ quantity: "1" }))   // Output: { quantity: 1 }   console.log(Schema.decodeUnknownSync(Product)({}))   // Output: {}   console.log(Schema.decodeUnknownSync(Product)({ quantity: undefined }))   // Output: { quantity: undefined }
   // Encoding examples
   console.log(Schema.encodeSync(Product)({ quantity: 1 }))   // Output: { quantity: "1" }   console.log(Schema.encodeSync(Product)({}))   // Output: {}   console.log(Schema.encodeSync(Product)({ quantity: undefined }))   // Output: { quantity: undefined }
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Basic Optional Property

...

##### Exposed Values

Exposed Values
You can access the original schema type (before it was marked as optional) using
the `from` property.

Example (Accessing the Original Schema)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optional(Schema.NumberFromString)   })
   //      ┌─── typeof Schema.NumberFromString   //      ▼   const from = Product.fields.quantity.from
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Basic Optional Property

Basic Optional Property
The syntax:

` ` `Schema.`optional`(schema: Schema`<`A`, `I`, `R`>`)`
creates an optional property within a schema, allowing fields to be omitted or
set to `undefined`.

##### Decoding

...

##### Encoding

...

##### Exposed Values

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Optional with Nullability

...

##### Decoding

Decoding
| |
| |
| <missing value> | remains <missing value> |
| undefined | remains undefined |
| null | transforms to <missing value> |
| i: I | transforms to a: A |

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Optional with Nullability

...

##### Encoding

Encoding
| |
| |
| <missing value> | remains <missing value> |
| undefined | remains undefined |
| a: A | transforms back to i: I |

Example (Handling Null as Missing Value)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       nullable: true     })   })
   //     ┌─── { readonly quantity?: string | null | undefined; }   //     ▼   type Encoded = typeof Product.Encoded
   //     ┌─── { readonly quantity?: number | undefined; }   //     ▼   type Type = typeof Product.Type
   // Decoding examples
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Optional Fields
...
#### Optional with Nullability
...
##### Encoding
...
   console.log(Schema.decodeUnknownSync(Product)({ quantity: "1" }))   // Output: { quantity: 1 }   console.log(Schema.decodeUnknownSync(Product)({}))   // Output: {}   console.log(Schema.decodeUnknownSync(Product)({ quantity: undefined }))   // Output: { quantity: undefined }   console.log(Schema.decodeUnknownSync(Product)({ quantity: null }))   // Output: {}
   // Encoding examples
   console.log(Schema.encodeSync(Product)({ quantity: 1 }))   // Output: { quantity: "1" }   console.log(Schema.encodeSync(Product)({}))   // Output: {}   console.log(Schema.encodeSync(Product)({ quantity: undefined }))   // Output: { quantity: undefined }
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Optional with Nullability

...

##### Exposed Values

Exposed Values
You can access the original schema type (before it was marked as optional) using
the `from` property.

Example (Accessing the Original Schema)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       nullable: true     })   })
   //      ┌─── typeof Schema.NumberFromString   //      ▼   const from = Product.fields.quantity.from
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Optional with Nullability

Optional with Nullability
The syntax:

` ` `Schema.`optionalWith`(schema: Schema`<`A`, `I`, `R`>`, { nullable: `true` })`
creates an optional property within a schema, treating `null` values the same as missing values.

##### Decoding

...

##### Encoding

...

##### Exposed Values

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Optional with Exactness

...

##### Decoding

Decoding
| |
| |
| <missing value> | remains <missing value> |
| undefined | ParseError |
| i: I | transforms to a: A |

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Optional with Exactness

...

##### Encoding

Encoding
| |
| |
| <missing value> | remains <missing value> |
| a: A | transforms back to i: I |

Example (Using Exactness with Optional Field)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, { exact: true })   })
   //     ┌─── { readonly quantity?: string; }   //     ▼   type Encoded = typeof Product.Encoded
   //     ┌─── { readonly quantity?: number; }   //     ▼   type Type = typeof Product.Type
   // Decoding examples
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Optional Fields
...
#### Optional with Exactness
...
##### Encoding
...
   console.log(Schema.decodeUnknownSync(Product)({ quantity: "1" }))   // Output: { quantity: 1 }   console.log(Schema.decodeUnknownSync(Product)({}))   // Output: {}   console.log(Schema.decodeUnknownSync(Product)({ quantity: undefined }))   /*   throws:   ParseError: { readonly quantity?: NumberFromString }   └─ ["quantity"]      └─ NumberFromString         └─ Encoded side transformation failure            └─ Expected string, actual undefined   */
   // Encoding examples
   console.log(Schema.encodeSync(Product)({ quantity: 1 }))   // Output: { quantity: "1" }   console.log(Schema.encodeSync(Product)({}))   // Output: {}
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Optional with Exactness

...

##### Exposed Values

Exposed Values
You can access the original schema type (before it was marked as optional) using
the `from` property.

Example (Accessing the Original Schema)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, { exact: true })   })
   //      ┌─── typeof Schema.NumberFromString   //      ▼   const from = Product.fields.quantity.from
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Optional with Exactness

Optional with Exactness
The syntax:

` ` `Schema.`optionalWith`(schema: Schema`<`A`, `I`, `R`>`, { exact: `true` })`
creates an optional property while enforcing strict typing. This means that only
the specified type (excluding `undefined`) is accepted. Any attempt to decode `undefined` results in an error.

##### Decoding

...

##### Encoding

...

##### Exposed Values

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Combining Nullability and Exactness

...

##### Decoding

Decoding
| |
| |
| <missing value> | remains <missing value> |
| null | transforms to <missing value> |
| undefined | ParseError |
| i: I | transforms to a: A |

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Combining Nullability and Exactness

...

##### Encoding

Encoding
| |
| |
| <missing value> | remains <missing value> |
| a: A | transforms back to i: I |

Example (Using Exactness and Handling Null as Missing Value with Optional Field)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       exact: true,       nullable: true     })   })
   //     ┌─── { readonly quantity?: string | null; }   //     ▼   type Encoded = typeof Product.Encoded
   //     ┌─── { readonly quantity?: number; }   //     ▼   type Type = typeof Product.Type
   // Decoding examples
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Optional Fields
...
#### Combining Nullability and Exactness
...
##### Encoding
...
   console.log(Schema.decodeUnknownSync(Product)({ quantity: "1" }))   // Output: { quantity: 1 }   console.log(Schema.decodeUnknownSync(Product)({}))   // Output: {}   console.log(Schema.decodeUnknownSync(Product)({ quantity: undefined }))   /*   throws:   ParseError: (Struct (Encoded side) <-> Struct (Type side))   └─ Encoded side transformation failure      └─ Struct (Encoded side)         └─ ["quantity"]            └─ NumberFromString | null               ├─ NumberFromString               │  └─ Encoded side transformation failure               │     └─ Expected string, actual undefined               └─ Expected null, actual undefined   */   console.log(Schema.decodeUnknownSync(Product)({ quantity: null }))   // Output: {}
   // Encoding examples
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Optional Fields
...
#### Combining Nullability and Exactness
...
##### Encoding
...
   console.log(Schema.encodeSync(Product)({ quantity: 1 }))   // Output: { quantity: "1" }   console.log(Schema.encodeSync(Product)({}))   // Output: {}
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Combining Nullability and Exactness

...

##### Exposed Values

Exposed Values
You can access the original schema type (before it was marked as optional) using
the `from` property.

Example (Accessing the Original Schema)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       exact: true,       nullable: true     })   })
   //      ┌─── typeof Schema.NumberFromString   //      ▼   const from = Product.fields.quantity.from
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

...

#### Combining Nullability and Exactness

Combining Nullability and Exactness
The syntax:

` ` `Schema.`optionalWith`(schema: Schema`<`A`, `I`, `R`>`, { exact: `true`, nullable: `true` })`
allows you to define an optional property that enforces strict typing (exact
type only) while also treating `null` as equivalent to a missing value.

##### Decoding

...

##### Encoding

...

##### Exposed Values

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields

Optional Fields

#### Basic Optional Property

...

#### Optional with Nullability

...

#### Optional with Exactness

...

#### Combining Nullability and Exactness

...
...

# Advanced Usage

...

## Property Signatures

...

### Representing Optional Fields with never Type

Representing Optional Fields with never Type
When creating a schema to replicate a TypeScript type that includes optional
fields with the `never` type, like:

` ` ` `type` `MyType` `=` {` ` ` `  `readonly` `quantity`?:` `never` ` ` `}`
the handling of these fields depends on the `exactOptionalPropertyTypes` setting in your `tsconfig.json`. This setting affects whether the schema should treat optional `never`-typed fields as simply absent or allow `undefined` as a value.

Example (`exactOptionalPropertyTypes: false`)

When this feature is turned off, you can employ the `Schema.optional` function. This approach allows the field to implicitly accept `undefined` as a value.

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optional(Schema.Never)   })
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Representing Optional Fields with never Type
...
   //     ┌─── { readonly quantity?: undefined; }   //     ▼   type Encoded = typeof Product.Encoded
   //     ┌─── { readonly quantity?: undefined; }   //     ▼   type Type = typeof Product.Type
```

Example (`exactOptionalPropertyTypes: true`)

When this feature is turned on, the `Schema.optionalWith` function is recommended. It ensures stricter enforcement of the field’s
absence.

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.Never, { exact: true })   })
   //     ┌─── { readonly quantity?: never; }   //     ▼   type Encoded = typeof Product.Encoded
   //     ┌─── { readonly quantity?: never; }   //     ▼   type Type = typeof Product.Type
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Default Values

...

#### Basic Default

...

##### Exposed Values

Exposed Values
You can access the original schema type (before it was marked as optional) using
the `from` property.

Example (Accessing the Original Schema)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       default: () => 1 // Default value for quantity     })   })
   //      ┌─── typeof Schema.NumberFromString   //      ▼   const from = Product.fields.quantity.from
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Default Values

...

#### Basic Default

Basic Default
This is the simplest use case. If the input is missing or `undefined`, the default value will be applied.

Syntax

` ` `Schema.`optionalWith`(schema: Schema`<`A`, `I`, `R`>`, { `default`: () `=>` `A` })`
| |
| |
| Decoding | Applies the default value if the input is missing or undefined |
| Encoding | Transforms the input a: A back to i: I |

Example (Applying Default When Field Is Missing or `undefined`)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       default: () => 1 // Default value for quantity     })   })
   //     ┌─── { readonly quantity?: string | undefined; }   //     ▼   type Encoded = typeof Product.Encoded
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Default Values
...
#### Basic Default
...
   //     ┌─── { readonly quantity: number; }   //     ▼   type Type = typeof Product.Type
   // Decoding examples with default applied
   console.log(Schema.decodeUnknownSync(Product)({}))   // Output: { quantity: 1 }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: undefined }))   // Output: { quantity: 1 }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: "2" }))   // Output: { quantity: 2 }
   // Object construction examples with default applied
   console.log(Product.make({}))   // Output: { quantity: 1 }
   console.log(Product.make({ quantity: 2 }))   // Output: { quantity: 2 }
```

##### Exposed Values

...
...

# Advanced Usage

...

## Property Signatures

...

### Default Values

...

#### Default with Exactness

Default with Exactness
When you want the default value to be applied only if the field is completely
missing (not when it’s `undefined`), you can use the `exact` option.

Syntax

` ` `Schema.`optionalWith`(schema: Schema`<`A`, `I`, `R`>`, {` ` ` `default`: () `=>` `A`,` ` `  `exact: `
true` ` `})`
| |
| |
| Decoding | Applies the default value only if the input is missing |
| Encoding | Transforms the input a: A back to i: I |

Example (Applying Default Only When Field Is Missing)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       default: () => 1, // Default value for quantity       exact: true // Only apply default if quantity is not provided     })   })
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Default Values
...
#### Default with Exactness
...
   //     ┌─── { readonly quantity?: string; }   //     ▼   type Encoded = typeof Product.Encoded
   //     ┌─── { readonly quantity: number; }   //     ▼   type Type = typeof Product.Type
   console.log(Schema.decodeUnknownSync(Product)({}))   // Output: { quantity: 1 }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: "2" }))   // Output: { quantity: 2 }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: undefined }))   /*   throws:   ParseError: (Struct (Encoded side) <-> Struct (Type side))   └─ Encoded side transformation failure      └─ Struct (Encoded side)         └─ ["quantity"]            └─ NumberFromString               └─ Encoded side transformation failure                  └─ Expected string, actual undefined   */
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Default Values

...

#### Default with Nullability

Default with Nullability
In cases where you want `null` values to trigger the default behavior, you can use the `nullable` option. This ensures that if a field is set to `null`, it will be replaced by the default value.

Syntax

` ` `Schema.`optionalWith`(schema: Schema`<`A`, `I`, `R`>`, {` ` ` `default`: () `=>` `A`,` ` `  `
nullable: `true` ` `})`
| |
| |
| Decoding | Applies the default value if the input is missing or undefined or null |
| Encoding | Transforms the input a: A back to i: I |

Example (Applying Default When Field Is Missing or `undefined` or `null`)

```
   import { Schema } from "effect"
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Default Values
...
#### Default with Nullability
...
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       default: () => 1, // Default value for quantity       nullable: true // Apply default if quantity is null     })   })
   //     ┌─── { readonly quantity?: string | null | undefined; }   //     ▼   type Encoded = typeof Product.Encoded
   //     ┌─── { readonly quantity: number; }   //     ▼   type Type = typeof Product.Type
   console.log(Schema.decodeUnknownSync(Product)({}))   // Output: { quantity: 1 }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: undefined }))   // Output: { quantity: 1 }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: null }))   // Output: { quantity: 1 }
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Default Values
...
#### Default with Nullability
...
   console.log(Schema.decodeUnknownSync(Product)({ quantity: "2" }))   // Output: { quantity: 2 }
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Default Values

...

#### Combining Exactness and Nullability

Combining Exactness and Nullability
For a more strict approach, you can combine both `exact` and `nullable` options. This way, the default value is applied only when the field is `null` or missing, and not when it’s explicitly set to `undefined`.

Syntax

` ` `Schema.`optionalWith`(schema: Schema`<`A`, `I`, `R`>`, {` ` ` `default`: () `=>` `A`,` ` `  `exact: `
true`,` ` `  `nullable: `true` ` `})`
| |
| |
| Decoding | Applies the default value if the input is missing or null |
| Encoding | Transforms the input a: A back to i: I |

Example (Applying Default Only When Field Is Missing or `null`)

```
   import { Schema } from "effect"
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Default Values
...
#### Combining Exactness and Nullability
...
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       default: () => 1, // Default value for quantity       exact: true, // Only apply default if quantity is not provided       nullable: true // Apply default if quantity is null     })   })
   //     ┌─── { readonly quantity?: string | null; }   //     ▼   type Encoded = typeof Product.Encoded
   //     ┌─── { readonly quantity: number; }   //     ▼   type Type = typeof Product.Type
   console.log(Schema.decodeUnknownSync(Product)({}))   // Output: { quantity: 1 }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: null }))   // Output: { quantity: 1 }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: "2" }))   // Output: { quantity: 2 }
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Default Values
...
#### Combining Exactness and Nullability
...
   console.log(Schema.decodeUnknownSync(Product)({ quantity: undefined }))   /*   throws:   ParseError: (Struct (Encoded side) <-> Struct (Type side))   └─ Encoded side transformation failure      └─ Struct (Encoded side)         └─ ["quantity"]            └─ NumberFromString               └─ Encoded side transformation failure                  └─ Expected string, actual undefined   */
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Default Values

Default Values
The `default` option in `Schema.optionalWith` allows you to set default values that are applied during both decoding and
object construction phases. This feature ensures that even if certain properties are
not provided by the user, the system will automatically use the specified
default values.

The `Schema.optionalWith` function offers several ways to control how defaults are applied during
decoding and encoding. You can fine-tune whether defaults are applied only when the
input is completely missing, or even when `null` or `undefined` values are provided.

#### Basic Default

...

#### Default with Exactness

...

#### Default with Nullability

...

#### Combining Exactness and Nullability

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Basic Optional with Option Type

...

##### Decoding

Decoding
| |
| |
| <missing value> | transforms to Option.none() |
| undefined | transforms to Option.none() |
| i: I | transforms to Option.some(a: A) |

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Basic Optional with Option Type

...

##### Encoding

Encoding
| |
| |
| Option.none() | transforms to <missing value> |
| Option.some(a: A) | transforms back to i: I |

Example (Handling Optional Field as Option)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, { as: "Option" })   })
   //     ┌─── { readonly quantity?: string | undefined; }   //     ▼   type Encoded = typeof Product.Encoded
   //     ┌─── { readonly quantity: Option<number>; }   //     ▼   type Type = typeof Product.Type
   console.log(Schema.decodeUnknownSync(Product)({}))   // Output: { quantity: { _id: 'Option', _tag: 'None' } }
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Optional Fields as Options
...
#### Basic Optional with Option Type
...
##### Encoding
...
   console.log(Schema.decodeUnknownSync(Product)({ quantity: undefined }))   // Output: { quantity: { _id: 'Option', _tag: 'None' } }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: "2" }))   // Output: { quantity: { _id: 'Option', _tag: 'Some', value: 2 } }
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Basic Optional with Option Type

...

##### Exposed Values

Exposed Values
You can access the original schema type (before it was marked as optional) using
the `from` property.

Example (Accessing the Original Schema)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, { as: "Option" })   })
   //      ┌─── typeof Schema.NumberFromString   //      ▼   const from = Product.fields.quantity.from
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Basic Optional with Option Type

Basic Optional with Option Type
You can configure a schema to treat optional fields as `Option` types, where missing or `undefined` values are converted to `Option.none()` and existing values are wrapped in `Option.some()`.

Syntax

` ` `optionalWith`(schema: Schema`<`A`, `I`, `R`>`, { as: `"Option"` })`

##### Decoding

...

##### Encoding

...

##### Exposed Values

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Optional with Exactness

...

##### Decoding

Decoding
| |
| |
| <missing value> | transforms to Option.none() |
| undefined | ParseError |
| i: I | transforms to Option.some(a: A) |

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Optional with Exactness

...

##### Encoding

Encoding
| |
| |
| Option.none() | transforms to <missing value> |
| Option.some(a: A) | transforms back to i: I |

Example (Using Exactness with Optional Field as Option)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       as: "Option",       exact: true     })   })
   //     ┌─── { readonly quantity?: string; }   //     ▼   type Encoded = typeof Product.Encoded
   //     ┌─── { readonly quantity: Option<number>; }   //     ▼   type Type = typeof Product.Type
   console.log(Schema.decodeUnknownSync(Product)({}))   // Output: { quantity: { _id: 'Option', _tag: 'None' } }
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Optional Fields as Options
...
#### Optional with Exactness
...
##### Encoding
...
   console.log(Schema.decodeUnknownSync(Product)({ quantity: "2" }))   // Output: { quantity: { _id: 'Option', _tag: 'Some', value: 2 } }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: undefined }))   /*   throws:   ParseError: (Struct (Encoded side) <-> Struct (Type side))   └─ Encoded side transformation failure      └─ Struct (Encoded side)         └─ ["quantity"]            └─ NumberFromString               └─ Encoded side transformation failure                  └─ Expected string, actual undefined   */
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Optional with Exactness

...

##### Exposed Values

Exposed Values
You can access the original schema type (before it was marked as optional) using
the `from` property.

Example (Accessing the Original Schema)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       as: "Option",       exact: true     })   })
   //      ┌─── typeof Schema.NumberFromString   //      ▼   const from = Product.fields.quantity.from
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Optional with Exactness

Optional with Exactness
The `exact` option ensures that the default behavior of the optional field applies only
when the field is entirely missing, not when it is `undefined`.

Syntax

` ` `optionalWith`(schema: Schema`<`A`, `I`, `R`>`, {` ` `  `as: `"Option"`,` ` `  `exact: `true` ` `})`

##### Decoding

...

##### Encoding

...

##### Exposed Values

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Optional with Nullability

...

##### Decoding

Decoding
| |
| |
| <missing value> | transforms to Option.none() |
| undefined | transforms to Option.none() |
| null | transforms to Option.none() |
| i: I | transforms to Option.some(a: A) |

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Optional with Nullability

...

##### Encoding

Encoding
| |
| |
| Option.none() | transforms to <missing value> |
| Option.some(a: A) | transforms back to i: I |

Example (Handling Null as Missing Value with Optional Field as Option)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       as: "Option",       nullable: true     })   })
   //     ┌─── { readonly quantity?: string | null | undefined; }   //     ▼   type Encoded = typeof Product.Encoded
   //     ┌─── { readonly quantity: Option<number>; }   //     ▼   type Type = typeof Product.Type
   console.log(Schema.decodeUnknownSync(Product)({}))   // Output: { quantity: { _id: 'Option', _tag: 'None' } }
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Optional Fields as Options
...
#### Optional with Nullability
...
##### Encoding
...
   console.log(Schema.decodeUnknownSync(Product)({ quantity: undefined }))   // Output: { quantity: { _id: 'Option', _tag: 'None' } }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: null }))   // Output: { quantity: { _id: 'Option', _tag: 'None' } }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: "2" }))   // Output: { quantity: { _id: 'Option', _tag: 'Some', value: 2 } }
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Optional with Nullability

...

##### Exposed Values

Exposed Values
You can access the original schema type (before it was marked as optional) using
the `from` property.

Example (Accessing the Original Schema)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       as: "Option",       nullable: true     })   })
   //      ┌─── typeof Schema.NumberFromString   //      ▼   const from = Product.fields.quantity.from
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Optional with Nullability

Optional with Nullability
The `nullable` option extends the default behavior to treat `null` as equivalent to `Option.none()`, alongside missing or `undefined` values.

Syntax

` ` `optionalWith`(schema: Schema`<`A`, `I`, `R`>`, {` ` `  `as: `"Option"`,` ` `  `nullable: `true` ` `})`

##### Decoding

...

##### Encoding

...

##### Exposed Values

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Combining Exactness and Nullability

...

##### Decoding

Decoding
| |
| |
| <missing value> | transforms to Option.none() |
| undefined | ParseError |
| null | transforms to Option.none() |
| i: I | transforms to Option.some(a: A) |

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Combining Exactness and Nullability

...

##### Encoding

Encoding
| |
| |
| Option.none() | transforms to <missing value> |
| Option.some(a: A) | transforms back to i: I |

Example (Using Exactness and Handling Null as Missing Value with Optional Field as
Option)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       as: "Option",       exact: true,       nullable: true     })   })
   //     ┌─── { readonly quantity?: string | null; }   //     ▼   type Encoded = typeof Product.Encoded
   //     ┌─── { readonly quantity: Option<number>; }   //     ▼   type Type = typeof Product.Type
   console.log(Schema.decodeUnknownSync(Product)({}))   // Output: { quantity: { _id: 'Option', _tag: 'None' } }
   ...
...
# Advanced Usage
...
## Property Signatures
...
### Optional Fields as Options
...
#### Combining Exactness and Nullability
...
##### Encoding
...
   console.log(Schema.decodeUnknownSync(Product)({ quantity: null }))   // Output: { quantity: { _id: 'Option', _tag: 'None' } }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: "2" }))   // Output: { quantity: { _id: 'Option', _tag: 'Some', value: 2 } }
   console.log(Schema.decodeUnknownSync(Product)({ quantity: undefined }))   /*   throws:   ParseError: (Struct (Encoded side) <-> Struct (Type side))   └─ Encoded side transformation failure      └─ Struct (Encoded side)         └─ ["quantity"]            └─ NumberFromString               └─ Encoded side transformation failure                  └─ Expected string, actual undefined   */
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Combining Exactness and Nullability

...

##### Exposed Values

Exposed Values
You can access the original schema type (before it was marked as optional) using
the `from` property.

Example (Accessing the Original Schema)

```
   import { Schema } from "effect"
   const Product = Schema.Struct({     quantity: Schema.optionalWith(Schema.NumberFromString, {       as: "Option",       exact: true,       nullable: true     })   })
   //      ┌─── typeof Schema.NumberFromString   //      ▼   const from = Product.fields.quantity.from
```

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

...

#### Combining Exactness and Nullability

Combining Exactness and Nullability
When both `exact` and `nullable` options are used together, only `null` and missing fields are treated as `Option.none()`, while `undefined` is considered an invalid value.

Syntax

` ` `optionalWith`(schema: Schema`<`A`, `I`, `R`>`, {` ` `  `as: `"Option"`,` ` `  `exact: `true`,` ` `  `
nullable: `true` ` `})`

##### Decoding

...

##### Encoding

...

##### Exposed Values

...
...

# Advanced Usage

...

## Property Signatures

...

### Optional Fields as Options

Optional Fields as Options
When working with optional fields, you may want to handle them as [Option](https://effect.website/docs/data-types/option/) types. This approach allows you to explicitly manage the presence or absence of
a field rather than relying on `undefined` or `null`.

#### Basic Optional with Option Type

...

#### Optional with Exactness

...

#### Optional with Nullability

...

#### Combining Exactness and Nullability

...
...

# Advanced Usage

...

## Property Signatures

Property Signatures
A `PropertySignature` represents a transformation from a “From” field to a “To” field. This allows
you to define mappings between incoming data fields and your internal model.

### Basic Usage

...

### Optional Fields

...

### Representing Optional Fields with never Type

...

### Default Values

...

### Optional Fields as Options

...
...

# Advanced Usage

...

## Optional Fields Primitives

...

### optionalToOptional

optionalToOptional
The `Schema.optionalToOptional` API allows you to manage transformations from an optional field in the input to
an optional field in the output. This can be useful for controlling both the
output type and whether a field is present or absent based on specific criteria.

One common use case for `optionalToOptional` is handling fields where a specific input value, such as an empty string,
should be treated as an absent field in the output.

Syntax

` ` `const` `optionalToOptional` `=` <`FA`, `FI`, `FR`, `TA`, `TI`, `TR`>(` ` `  `from`:` `Schema`<`FA`, `FI`, `
FR`>,` ` `  `to`:` `Schema`<`TA`, `TI`, `TR`>,` ` `  `options`:` {` ` `    `readonly` `decode`:` (`o`:` `Option`.`
...
...

# Advanced Usage

...

## Optional Fields Primitives

...

### optionalToOptional

...
Option`<`FA`>) `=>` `Option`.`Option`<`TI`>,` ` ` `readonly` `encode`:` (`o`:` `Option`.`Option`<`TI`>) `=>` `
Option`.`Option`<`FA`>` ` `  `}` ` `): PropertySignature`<`"?:"`, `TA`, `never`, "?:", `FI`, `false`, `FR`
| TR>`
In this function:

• The `from` parameter specifies the input schema, and `to` specifies the output schema.
• The `decode` and `encode` functions define how the field should be interpreted on both sides:
◦ `Option.none()` as an input argument indicates a missing field in the input.
◦ Returning `Option.none()` from either function will omit the field in the output.

Example (Omitting Empty Strings from the Output)

Consider an optional field of type `string` where empty strings in the input should be removed from the output.

```
...
...
# Advanced Usage
...
## Optional Fields Primitives
...
### optionalToOptional
...
   import { Option, Schema } from "effect"
   ...
...
# Advanced Usage
...
## Optional Fields Primitives
...
### optionalToOptional
...
   const schema = Schema.Struct({     nonEmpty: Schema.optionalToOptional(Schema.String, Schema.String, {       //         ┌─── Option<string>       //         ▼       decode: (maybeString) => {         if (Option.isNone(maybeString)) {           // If `maybeString` is `None`, the field is absent in the input.           // Return Option.none() to omit it in the output.           return Option.none()         }         // Extract the value from the `Some` instance         const value = maybeString.value         if (value === "") {           // Treat empty strings as missing in the output           // by returning Option.none().           return Option.none()         }         // Include non-empty strings in the output.         return Option.some(value)       },       // In the encoding phase, you can decide to process the field       // similarly to the decoding phase or use a different logic.       // Here, the logic is left unchanged.       //       //         ┌─── Option<string>       ...
...
# Advanced Usage
...
## Optional Fields Primitives
...
### optionalToOptional
...
   // Decoding examples
   const decode = Schema.decodeUnknownSync(schema)
   console.log(decode({}))   // Output: {}   console.log(decode({ nonEmpty: "" }))   // Output: {}   console.log(decode({ nonEmpty: "a non-empty string" }))   // Output: { nonEmpty: 'a non-empty string' }
   // Encoding examples
   const encode = Schema.encodeSync(schema)
   console.log(encode({}))   // Output: {}   console.log(encode({ nonEmpty: "" }))   // Output: { nonEmpty: '' }   console.log(encode({ nonEmpty: "a non-empty string" }))   // Output: { nonEmpty: 'a non-empty string' }
```

You can simplify the decoding logic with `Option.filter`, which filters out unwanted values in a concise way.

Example (Using `Option.filter` for Decoding)

```
   import { identity, Option, Schema } from "effect"
   ...
...
# Advanced Usage
...
## Optional Fields Primitives
...
### optionalToOptional
...
   const schema = Schema.Struct({     nonEmpty: Schema.optionalToOptional(Schema.String, Schema.String, {       decode: Option.filter((s) => s !== ""),       encode: identity     })   })
```

...
...

# Advanced Usage

...

## Optional Fields Primitives

...

### optionalToRequired

optionalToRequired
The `Schema.optionalToRequired` API lets you transform an optional field into a required one, with custom logic
to handle cases when the field is missing in the input.

Syntax

` ` `const` `optionalToRequired` `=` <`FA`, `FI`, `FR`, `TA`, `TI`, `TR`>(` ` `  `from`:` `Schema`<`FA`, `FI`, `
FR`>,` ` `  `to`:` `Schema`<`TA`, `TI`, `TR`>,` ` `  `options`:` {` ` `    `readonly` `decode`:` (`o`:` `Option`.`
Option`<`FA`>) `=>` `TI`,` ` ` `readonly` `encode`:` (`ti`:` `TI`) `=>` `Option`.`Option`<`FA`>` ` `  `}` ` `
...
...

# Advanced Usage

...

## Optional Fields Primitives

...

### optionalToRequired

...
): PropertySignature`<`":"`, `TA`, `never`, "?:", `FI`, `false`, `FR` | TR>`
In this function:

• `from` specifies the input schema, while `to` specifies the output schema.
• The `decode` and `encode` functions define the transformation behavior:
◦ Passing `Option.none()` to `decode` means the field is absent in the input. The function can then return a default
value for the output.
◦ Returning `Option.none()` in `encode` will omit the field in the output.

Example (Setting `null` as Default for Missing Field)

This example demonstrates how to use `optionalToRequired` to provide a `null` default value when the `nullable` field is missing in the input. During encoding, fields with a value of `null` are omitted from the output.

```
   import { Option, Schema } from "effect"
   ...
...
# Advanced Usage
...
## Optional Fields Primitives
...
### optionalToRequired
...
   const schema = Schema.Struct({     nullable: Schema.optionalToRequired(       // Input schema for an optional string       Schema.String,       // Output schema allowing null or string       Schema.NullOr(Schema.String),       {         //         ┌─── Option<string>         //         ▼         decode: (maybeString) => {           if (Option.isNone(maybeString)) {             // If `maybeString` is `None`, the field is absent in the input.             // Return `null` as the default value for the output.             return null           }           // Extract the value from the `Some` instance           // and use it as the output.           return maybeString.value         },         // During encoding, treat `null` as an absent field         //         //         ┌─── string | null         //         ▼         encode: (stringOrNull) =>           stringOrNull === null             ? // Omit the field by returning `None`               Option.none()             : // Include the field by returning `Some...
...
# Advanced Usage
...
## Optional Fields Primitives
...
### optionalToRequired
...
   // Decoding examples
   const decode = Schema.decodeUnknownSync(schema)
   console.log(decode({}))   // Output: { nullable: null }   console.log(decode({ nullable: "a value" }))   // Output: { nullable: 'a value' }
   // Encoding examples
   const encode = Schema.encodeSync(schema)
   console.log(encode({ nullable: "a value" }))   // Output: { nullable: 'a value' }   console.log(encode({ nullable: null }))   // Output: {}
```

You can streamline the decoding and encoding logic using `Option.getOrElse` and `Option.liftPredicate` for concise and readable transformations.

Example (Using `Option.getOrElse` and `Option.liftPredicate`)

```
   import { Option, Schema } from "effect"
   ...
...
# Advanced Usage
...
## Optional Fields Primitives
...
### optionalToRequired
...
   const schema = Schema.Struct({     nullable: Schema.optionalToRequired(       Schema.String,       Schema.NullOr(Schema.String),       {         decode: Option.getOrElse(() => null),         encode: Option.liftPredicate((value) => value !== null)       }     )   })
```

...
...

# Advanced Usage

...

## Optional Fields Primitives

...

### requiredToOptional

requiredToOptional
The `requiredToOptional` API allows you to transform a required field into an optional one, applying
custom logic to determine when the field can be omitted.

Syntax

` ` `const` `requiredToOptional` `=` <`FA`, `FI`, `FR`, `TA`, `TI`, `TR`>(` ` `  `from`:` `Schema`<`FA`, `FI`, `
FR`>,` ` `  `to`:` `Schema`<`TA`, `TI`, `TR`>,` ` `  `options`:` {` ` `    `readonly` `decode`:` (`fa`:` `FA`) `=>` `
Option`.`Option`<`TI`>` ` ` `readonly` `encode`:` (`o`:` `Option`.`Option`<`TI`>) `=>` `FA` ` ` `}` ` `
...
...

# Advanced Usage

...

## Optional Fields Primitives

...

### requiredToOptional

...
): PropertySignature`<`"?:"`, `TA`, `never`, ":", `FI`, `false`, `FR` | TR>`
With `decode` and `encode` functions, you control the presence or absence of the field:

• `Option.none()` as an argument in `decode` means the field is missing in the input.
• `Option.none()` as a return value from `encode` means the field will be omitted in the output.

Example (Handling Empty String as Missing Value)

In this example, the `name` field is required but treated as optional if it is an empty string. During
decoding, an empty string in `name` is considered absent, while encoding ensures a value (using an empty string as
a default if `name` is absent).

```
   import { Option, Schema } from "effect"
   ...
...
# Advanced Usage
...
## Optional Fields Primitives
...
### requiredToOptional
...
   const schema = Schema.Struct({     name: Schema.requiredToOptional(Schema.String, Schema.String, {       //         ┌─── string       //         ▼       decode: (string) => {         // Treat empty string as a missing value         if (string === "") {           // Omit the field by returning `None`           return Option.none()         }         // Otherwise, return the string as is         return Option.some(string)       },       //         ┌─── Option<string>       //         ▼       encode: (maybeString) => {         // Check if the field is missing         if (Option.isNone(maybeString)) {           // Provide an empty string as default           return ""         }         // Otherwise, return the string as is         return maybeString.value       }     })   })
   // Decoding examples
   const decode = Schema.decodeUnknownSync(schema)
   ...
...
# Advanced Usage
...
## Optional Fields Primitives
...
### requiredToOptional
...
   console.log(decode({ name: "John" }))   // Output: { name: 'John' }   console.log(decode({ name: "" }))   // Output: {}
   // Encoding examples
   const encode = Schema.encodeSync(schema)
   console.log(encode({ name: "John" }))   // Output: { name: 'John' }   console.log(encode({}))   // Output: { name: '' }
```

You can streamline the decoding and encoding logic using `Option.liftPredicate` and `Option.getOrElse` for concise and readable transformations.

Example (Using `Option.liftPredicate` and `Option.getOrElse`)

```
   import { Option, Schema } from "effect"
   const schema = Schema.Struct({     name: Schema.requiredToOptional(Schema.String, Schema.String, {       decode: Option.liftPredicate((s) => s !== ""),       encode: Option.getOrElse(() => "")     })   })
```

...
...

# Advanced Usage

...

## Optional Fields Primitives

Optional Fields Primitives

### optionalToOptional

...

### optionalToRequired

...

### requiredToOptional

...
...

# Advanced Usage

...

## Extending Schemas

...

### Spreading Struct fields

Spreading Struct fields
Structs provide access to their fields through the `fields` property, which allows you to extend an existing struct by adding additional
fields or combining fields from multiple structs.

Example (Adding New Fields)

```
   import { Schema } from "effect"
   const Original = Schema.Struct({     a: Schema.String,     b: Schema.String   })
   const Extended = Schema.Struct({     ...Original.fields,     // Adding new fields     c: Schema.String,     d: Schema.String   })
   //     ┌─── {   //     |      readonly a: string;   //     |      readonly b: string;   //     |      readonly c: string;   //     |      readonly d: string;   //     |    }   //     ▼   type Type = typeof Extended.Type
```

Example (Adding Additional Index Signatures)

```
   import { Schema } from "effect"
   ...
...
# Advanced Usage
...
## Extending Schemas
...
### Spreading Struct fields
...
   const Original = Schema.Struct({     a: Schema.String,     b: Schema.String   })
   const Extended = Schema.Struct(     Original.fields,     // Adding an index signature     Schema.Record({ key: Schema.String, value: Schema.String })   )
   //     ┌─── {   //     │      readonly [x: string]: string;   //     |      readonly a: string;   //     |      readonly b: string;   //     |    }   //     ▼   type Type = typeof Extended.Type
```

Example (Combining Fields from Multiple Structs)

```
   import { Schema } from "effect"
   const Struct1 = Schema.Struct({     a: Schema.String,     b: Schema.String   })
   const Struct2 = Schema.Struct({     c: Schema.String,     d: Schema.String   })
   const Extended = Schema.Struct({     ...Struct1.fields,     ...Struct2.fields   })
   ...
...
# Advanced Usage
...
## Extending Schemas
...
### Spreading Struct fields
...
   //     ┌─── {   //     |      readonly a: string;   //     |      readonly b: string;   //     |      readonly c: string;   //     |      readonly d: string;   //     |    }   //     ▼   type Type = typeof Extended.Type
```

...
...

# Advanced Usage

...

## Extending Schemas

...

### The extend function

The extend function
The `Schema.extend` function provides a structured method to expand schemas, especially useful when
direct field spreading isn’t sufficient—such as when you need to extend a struct with a union of other
structs.

Not all extensions are supported, and compatibility depends on the type of
schemas involved in the extension.

Supported extensions include:

• `Schema.String` with another `Schema.String` refinement or a string literal
• `Schema.Number` with another `Schema.Number` refinement or a number literal
• `Schema.Boolean` with another `Schema.Boolean` refinement or a boolean literal
• A struct with another struct where overlapping fields support extension
• A struct with in index signature
• A struct with a union of supported schemas
• A refinement of a struct with a supported schema
• A `suspend` of a struct with a supported schema
• A transformation between structs where the “from” and “to” sides have no
overlapping fields with the target struct

Example (Extending a Struct with a Union of Structs)
...
...

# Advanced Usage

...

## Extending Schemas

...

### The extend function

...

```
   import { Schema } from "effect"
   const Struct = Schema.Struct({     a: Schema.String   })
   const UnionOfStructs = Schema.Union(     Schema.Struct({ b: Schema.String }),     Schema.Struct({ c: Schema.String })   )
   const Extended = Schema.extend(Struct, UnionOfStructs)
   //     ┌─── {   //     |        readonly a: string;   //     |    } & ({   //     |        readonly b: string;   //     |    } | {   //     |        readonly c: string;   //     |    })   //     ▼   type Type = typeof Extended.Type
```

Example (Attempting to Extend Structs with Conflicting Fields)

This example demonstrates an attempt to extend a struct with another struct that
contains overlapping field names, resulting in an error due to conflicting
types.

```
   import { Schema } from "effect"
   ...
...
# Advanced Usage
...
## Extending Schemas
...
### The extend function
...
   const Struct = Schema.Struct({     a: Schema.String   })
   const OverlappingUnion = Schema.Union(     Schema.Struct({ a: Schema.Number }), // conflicting type for key "a"     Schema.Struct({ d: Schema.String })   )
   const Extended = Schema.extend(Struct, OverlappingUnion)   /*   throws:   Error: Unsupported schema or overlapping types   at path: ["a"]   details: cannot extend string with number   */
```

Example (Extending a Refinement with Another Refinement)

In this example, we extend two refinements, `Integer` and `Positive`, creating a schema that enforces both integer and positivity constraints.

```
   import { Schema } from "effect"
   const Integer = Schema.Int.pipe(Schema.brand("Int"))   const Positive = Schema.Positive.pipe(Schema.brand("Positive"))
   ...
...
# Advanced Usage
...
## Extending Schemas
...
### The extend function
...
   //      ┌─── Schema<number & Brand<"Positive"> & Brand<"Int">, number, never>   //      ▼   const PositiveInteger = Schema.asSchema(Schema.extend(Positive, Integer))
   Schema.decodeUnknownSync(PositiveInteger)(-1)   /*   throws   ParseError: positive & Brand<"Positive"> & int & Brand<"Int">   └─ From side refinement failure      └─ positive & Brand<"Positive">         └─ Predicate refinement failure            └─ Expected a positive number, actual -1   */
   Schema.decodeUnknownSync(PositiveInteger)(1.1)   /*   throws   ParseError: positive & Brand<"Positive"> & int & Brand<"Int">   └─ Predicate refinement failure      └─ Expected an integer, actual 1.1   */
```

...
...

# Advanced Usage

...

## Extending Schemas

Extending Schemas
Schemas in `effect` can be extended in multiple ways, allowing you to combine or enhance existing
types with additional fields or functionality. One common method is to use the `fields` property available in `Struct` schemas. This property provides a convenient way to add fields or merge fields
from different structs while retaining the original `Struct` type. This approach also makes it easier to access and modify fields.

For more complex cases, such as extending a struct with a union, you may want to
use the `Schema.extend` function, which offers flexibility in scenarios where direct field spreading
may not be sufficient.

By using field spreading with `...Struct.fields`, you maintain the schema’s `Struct` type, which allows continued access to the `fields` property for further modifications.

### Spreading Struct fields

...

### The extend function

...
...

# Advanced Usage

...

## Renaming Properties

...

### Renaming a Property During Definition

Renaming a Property During Definition
To rename a property directly during schema creation, you can utilize the `Schema.fromKey` function.

Example (Renaming a Required Property)

```
   import { Schema } from "effect"
   const schema = Schema.Struct({     a: Schema.propertySignature(Schema.String).pipe(Schema.fromKey("c")),     b: Schema.Number   })
   //     ┌─── { readonly c: string; readonly b: number; }   //     ▼   type Encoded = typeof schema.Encoded
   //     ┌─── { readonly a: string; readonly b: number; }   //     ▼   type Type = typeof schema.Type
   console.log(Schema.decodeUnknownSync(schema)({ c: "c", b: 1 }))   // Output: { a: "c", b: 1 }
```

Example (Renaming an Optional Property)

```
   import { Schema } from "effect"
   ...
...
# Advanced Usage
...
## Renaming Properties
...
### Renaming a Property During Definition
...
   const schema = Schema.Struct({     a: Schema.optional(Schema.String).pipe(Schema.fromKey("c")),     b: Schema.Number   })
   //     ┌─── { readonly b: number; readonly c?: string | undefined; }   //     ▼   type Encoded = typeof schema.Encoded
   //     ┌─── { readonly a?: string | undefined; readonly b: number; }   //     ▼   type Type = typeof schema.Type
   console.log(Schema.decodeUnknownSync(schema)({ c: "c", b: 1 }))   // Output: { a: 'c', b: 1 }
   console.log(Schema.decodeUnknownSync(schema)({ b: 1 }))   // Output: { b: 1 }
```

Using `Schema.optional` automatically returns a `PropertySignature`, making it unnecessary to explicitly use `Schema.propertySignature` as required for renaming required fields in the previous example.
...
...

# Advanced Usage

...

## Renaming Properties

...

### Renaming Properties of an Existing Schema

Renaming Properties of an Existing Schema
For existing schemas, the `Schema.rename` API offers a way to systematically change property names across a schema, even
within complex structures like unions, though in case of structs you lose the
original field types.

Example (Renaming Properties in a Struct Schema)

```
   import { Schema } from "effect"
   const Original = Schema.Struct({     c: Schema.String,     b: Schema.Number   })
   // Renaming the "c" property to "a"   //   //   //      ┌─── SchemaClass<{   //      |      readonly a: string;   //      |      readonly b: number;   //      |    }>   //      ▼   const Renamed = Schema.rename(Original, { c: "a" })
   console.log(Schema.decodeUnknownSync(Renamed)({ c: "c", b: 1 }))   // Output: { a: "c", b: 1 }
```

...
...

# Advanced Usage

...

## Renaming Properties

...

### Renaming Properties of an Existing Schema

...
Example (Renaming Properties in Union Schemas)

```
   import { Schema } from "effect"
   const Original = Schema.Union(     Schema.Struct({       c: Schema.String,       b: Schema.Number     }),     Schema.Struct({       c: Schema.String,       d: Schema.Boolean     })   )
   // Renaming the "c" property to "a" for all members   //   //      ┌─── SchemaClass<{   //      |      readonly a: string;   //      |      readonly b: number;   //      |    } | {   //      |      readonly a: string;   //      |      readonly d: number;   //      |    }>   //      ▼   const Renamed = Schema.rename(Original, { c: "a" })
   ...
...
# Advanced Usage
...
## Renaming Properties
...
### Renaming Properties of an Existing Schema
...
   console.log(Schema.decodeUnknownSync(Renamed)({ c: "c", b: 1 }))   // Output: { a: "c", b: 1 }
   console.log(Schema.decodeUnknownSync(Renamed)({ c: "c", d: false }))   // Output: { a: 'c', d: false }
```

...
...

# Advanced Usage

...

## Renaming Properties

Renaming Properties

### Renaming a Property During Definition

...

### Renaming Properties of an Existing Schema

...
...

# Advanced Usage

...

## Recursive Schemas

...

### A Helpful Pattern to Simplify Schema Definition

A Helpful Pattern to Simplify Schema Definition
As we’ve observed, it’s necessary to define an interface for the `Type` of the schema to enable recursive schema definition, which can complicate
things and be quite tedious. One pattern to mitigate this is to separate the field responsible for recursion from all other fields.

Example (Separating Recursive Fields)

```
   import { Schema } from "effect"
   const fields = {     name: Schema.String     // ...other fields as needed   }
   // Define an interface for the Category schema,   // extending the Type of the defined fields   interface Category extends Schema.Struct.Type<typeof fields> {     // Define `subcategories` using recursion     readonly subcategories: ReadonlyArray<Category>   }
   const Category = Schema.Struct({     ...fields, // Spread in the base fields     subcategories: Schema.Array(       // Define `subcategories` using recursion       Schema.suspend((): Schema.Schema<Category> => Category)     )   })
```

...
...

# Advanced Usage

...

## Recursive Schemas

...

### Mutually Recursive Schemas

Mutually Recursive Schemas
You can also use `Schema.suspend` to create mutually recursive schemas, where two schemas reference each other.
In the following example, `Expression` and `Operation` form a simple arithmetic expression tree by referencing each other.

Example (Defining Mutually Recursive Schemas)

```
   import { Schema } from "effect"
   interface Expression {     readonly type: "expression"     readonly value: number | Operation   }
   interface Operation {     readonly type: "operation"     readonly operator: "+" | "-"     readonly left: Expression     readonly right: Expression   }
   const Expression = Schema.Struct({     type: Schema.Literal("expression"),     value: Schema.Union(       Schema.Number,       Schema.suspend((): Schema.Schema<Operation> => Operation)     )   })
   const Operation = Schema.Struct({     type: Schema.Literal("operation"),     operator: Schema.Literal("+", "-"),     left: Expression,     right: Expression   })
```

...
...

# Advanced Usage

...

## Recursive Schemas

...

### Recursive Types with Different Encoded and Type

Recursive Types with Different Encoded and Type
Defining a recursive schema where the `Encoded` type differs from the `Type` type adds another layer of complexity. In such cases, we need to define two
interfaces: one for the `Type` type, as seen previously, and another for the `Encoded` type.

Example (Recursive Schema with Different Encoded and Type Definitions)

Let’s consider an example: suppose we want to add an `id` field to the `Category` schema, where the schema for `id` is `NumberFromString`. It’s important to note that `NumberFromString` is a schema that transforms a string into a number, so the `Type` and `Encoded` types of `NumberFromString` differ, being `number` and `string` respectively. When we add this field to the `Category` schema, TypeScript raises an error:

```
   import { Schema } from "effect"
   const fields = {     id: Schema.NumberFromString,     name: Schema.String   }
   ...
...
# Advanced Usage
...
## Recursive Schemas
...
### Recursive Types with Different Encoded and Type
...
   interface Category extends Schema.Struct.Type<typeof fields> {     readonly subcategories: ReadonlyArray<Category>   }
   const Category = Schema.Struct({     ...fields,     subcategories: Schema.Array(       Schema.suspend((): Schema.Schema<Category> => Category)Error ts(2322) ― Type 'Struct<{ subcategories: Array$<suspend<Category, Category, never>>; id: typeof NumberFromString; name: typeof String$; }>' is not assignable to type 'Schema<Category, Category, never>'. The types of 'Encoded.id' are incompatible between these types. Type 'string' is not assignable to type 'number'.     )   })
```

This error occurs because the explicit annotation `Schema.Schema<Category>` is no longer sufficient and needs to be adjusted by explicitly adding the `Encoded` type:

```
   import { Schema } from "effect"
   const fields = {     id: Schema.NumberFromString,     name: Schema.String   }
   ...
...
# Advanced Usage
...
## Recursive Schemas
...
### Recursive Types with Different Encoded and Type
...
   interface Category extends Schema.Struct.Type<typeof fields> {     readonly subcategories: ReadonlyArray<Category>   }
   interface CategoryEncoded extends Schema.Struct.Encoded<typeof fields> {     readonly subcategories: ReadonlyArray<CategoryEncoded>   }
   const Category = Schema.Struct({     ...fields,     subcategories: Schema.Array(       Schema.suspend(         (): Schema.Schema<Category, CategoryEncoded> => Category       )     )   })
```

[Edit page](https://github.com/Effect-TS/website/edit/main/content/src/content/docs/docs/schema/advanced-usage.mdx)[Previous Filters](https://effect.website/docs/schema/filters/)[Next Projections](https://effect.website/docs/schema/projections/)
...
...

# Advanced Usage

...

## Recursive Schemas

Recursive Schemas
The `Schema.suspend` function is designed for defining schemas that reference themselves, such as in
recursive data structures.

Example (Self-Referencing Schema)

In this example, the `Category` schema references itself through the `subcategories` field, which is an array of `Category` objects.

```
   import { Schema } from "effect"
   interface Category {     readonly name: string     readonly subcategories: ReadonlyArray<Category>   }
   const Category = Schema.Struct({     name: Schema.String,     subcategories: Schema.Array(       Schema.suspend((): Schema.Schema<Category> => Category)     )   })
```

It is necessary to define the `Category` type and add an explicit type annotation because otherwise TypeScript would
struggle to infer types correctly. Without this annotation, you might encounter the
error message:

Example (Type Inference Error)

```
   import { Schema } from "effect"
   ...
...
# Advanced Usage
...
## Recursive Schemas
...
   const Category = Schema.Struct({Error ts(7022) ― 'Category' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.     name: Schema.String,     subcategories: Schema.Array(Schema.suspend(() => Category))Error ts(7024) ― Function implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.   })
```

### A Helpful Pattern to Simplify Schema Definition

...

### Mutually Recursive Schemas

...

### Recursive Types with Different Encoded and Type

...
...

# Advanced Usage

...

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
  ...
  ...

# Advanced Usage

...

## Additional Links

...

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
  ...
  ...

# Advanced Usage

...

## Additional Links

...

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
  ...
  ...

# Advanced Usage

...

## Additional Links

...

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
  ...
  ...

# Advanced Usage

...

## Additional Links

...

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
  ...
  ...

# Advanced Usage

...

## Additional Links

...

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
  ...
  ...

# Advanced Usage

...

## Additional Links

...

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
  ...
  ...

# Advanced Usage

...

## Additional Links

...

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
  ...
  ...

# Advanced Usage

...

## Additional Links

...

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
  ...

# Advanced Usage

## Declaring New Data Types

...

## Branded types

...

## Property Signatures

...

## Optional Fields Primitives

...

## Extending Schemas

...

## Renaming Properties

...

## Recursive Schemas

...

## Additional Links

...
Skip to content[Effect Documentation](https://effect.website/)[Docs](https://effect.website/docs/)[Blog](https://effect.website/blog/)[Podcast](https://effect.website/podcast/)[Play](https://effect.website/play/)[Discord](https://discord.gg/effect-ts)[GitHub](https://github.com/Effect-TS)[X](https://x.com/EffectTS_)[YouTube](https://youtube.com/@effect-ts)[RSS](https://effect.website/blog/rss.xml)Select theme

# Advanced Usage

...
