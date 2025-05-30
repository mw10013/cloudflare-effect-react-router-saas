# Building a Composable Policy System in TypeScript with Effect

```
#fetch https://lucas-barake.github.io/building-a-composable-policy-system/
```

This blog post is also available as a video on YouTube above.

We’ve all been there. That moment when you open a codebase and see authorization checks like `if user.role === 'admin'` scattered everywhere. It seems innocent at first, but this common pattern contains a hidden time bomb waiting to explode.

Roles are just labels - they’re human-friendly groupings that help us organize permissions. The real security gates should be those individual permissions themselves. It’s similar to job titles versus actual responsibilities - a “Manager” title doesn’t automatically grant access to the corporate credit card, but having the specific “expense_approval” permission does.

The core issue with role-based checks is that they conflate two separate concerns:

1.  Human organization (grouping permissions into roles)
2.  Authorization logic (enforcing specific capabilities)

When we hardcode role checks, we’re essentially baking our organizational structure into the security model. This creates a fragile system where every organizational change requires code changes.

The solution? Treat roles as a management layer and build your authorization system on granular permissions. This is where Access Control Lists (ACLs) shine.

## Building Permission Primitives

Let’s start by creating strong primitives for our permissions system. We want:

*   Type-safe permission definitions
*   Compile-time validation
*   Clear domain-action relationships

A type-safe permission factory gives us these benefits:

```typescript
type PermissionAction = "read" | "manage" | "delete";
type PermissionConfig = Record<string, ReadonlyArray<PermissionAction>>;

// Creates union types like "posts:read" | "posts:manage" | ...
type InferPermissions<T extends PermissionConfig> = {
  [K in keyof T]: T[K][number] extends PermissionAction
    ? `${K & string}:${T[K][number]}`
    : never;
}[keyof T];

export const makePermissions = <T extends PermissionConfig>(
  config: T
): Array<InferPermissions<T>> => {
  return Object.entries(config).flatMap(([domain, actions]) =>
    actions.map((action) => `${domain}:${action}` as InferPermissions<T>)
  );
};
```

This approach creates a type-safe way to generate permission strings. The key benefits:

1.  Self-documenting structure - Permissions follow `domain:action` format
2.  Compile-time validation - Misspelled actions trigger type errors
3.  Single source of truth - Define permissions once, use everywhere

Here’s how we’d define permissions for a content platform:

```typescript
const Permissions = makePermissions({
  posts: ["read", "manage", "delete"], // Can read, manage, and delete posts
  comments: ["read", "manage"] // Can read and manage comments
} as const); // ← Note the const assertion!

// Create a Schema for type-safe permission validation
export const Permission = Schema.Literal(...Permissions).annotations({
  identifier: "Permission"
});
export type Permission = typeof Permission.Type;
```

Notice we’ve intentionally omitted `comments:delete` - maybe we want to keep comments around for moderation. The type system will now prevent anyone from accidentally checking for this non-existent permission.

## Carrying Permissions with Effect Context

Now that we have our permissions defined, we need a way to access them throughout our application. Effect’s context system provides an elegant solution:

```typescript
export class CurrentUser extends Context.Tag("CurrentUser")<
  CurrentUser,
  {
    readonly sessionId: string;
    readonly userId: UserId;
    readonly permissions: Set<Permission>;
  }
> {}
```

This acts as a type-safe container that carries our user’s permissions wherever they go in the application.

Our authentication middleware becomes the entry point that populates this context:

```typescript
export class UserAuthMiddleware extends HttpApiMiddleware.Tag<UserAuthMiddleware>()(
  "UserAuthMiddleware",
  {
    failure: CustomHttpApiError.Unauthorized,
    provides: CurrentUser
  }
) {}
```

In real-world usage, this middleware would:

1.  Inspect incoming requests
2.  Validate authentication tokens
3.  Load user permissions (from JWT claims, database, etc.)
4.  Pack the `CurrentUser` context for downstream use

To give you a concrete idea of how this works, here’s a simple implementation:

```typescript
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as CustomHttpApiError from "@org/domain/CustomHttpApiError";
import { UserId } from "@org/domain/EntityIds";
import { Permission, UserAuthMiddleware } from "@org/domain/Policy";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import jwt from "jsonwebtoken";

const Headers = Schema.Struct({
  authorization: Schema.NonEmptyTrimmedString.pipe(
    Schema.startsWith("Bearer ")
  ).pipe(
    Schema.transform(Schema.String, {
      decode: (value) => value.slice(7),
      encode: (value) => `Bearer ${value}`,
      strict: true
    })
  )
});

const CurrentUserSchema = Schema.Struct({
  sessionId: Schema.String,
  userId: UserId,
  permissions: Schema.Set(Permission)
});

export const UserAuthMiddlewareLive = Layer.effect(
  UserAuthMiddleware,
  Effect.sync(() => {
    return Effect.gen(function* () {
      const headers = yield* HttpServerRequest.schemaHeaders(Headers).pipe(
        Effect.mapError(() => new CustomHttpApiError.Unauthorized())
      );

      const payload = yield* Effect.try({
        try: () => jwt.verify(headers.authorization, "your_secret_key"),
        catch: () => new CustomHttpApiError.Unauthorized()
      });

      return yield* Effect.orDie(
        Schema.decodeUnknown(CurrentUserSchema)(payload)
      );
    }).pipe(Effect.withSpan("auth.middleware"));
  })
);
```

## Building a Composable Policy System

When building authorization for our application, I wanted to move beyond sprinkling `if` statements throughout the codebase. Why? Because those checks become hard to test, difficult to reuse, and nearly impossible to reason about as a system.

Instead, I needed a system where authorization rules were first-class citizens that could be composed, tested, and reasoned about independently.

### The Foundation: What is a Policy?

Let’s start with the core concept:

```typescript
/**
 * Represents an access policy that can be evaluated against the current user.
 * A policy is a function that returns Effect.void if access is granted,
 * or fails with a CustomHttpApiError.Forbidden if access is denied.
 */
type Policy<E = never, R = never> = Effect.Effect<
  void,
  CustomHttpApiError.Forbidden | E,
  CurrentUser | R
>;
```

A Policy is simply an Effect that either:

*   Succeeds with nothing (`void`) when access is granted
*   Fails with a Forbidden error when access is denied

This simple abstraction is the foundation of our entire authorization system. By modeling policies as Effects, we gain all the benefits of Effect’s composition, error handling, and context management.

### Creating Policies

With the type defined, we need an easy way to create policies. Here’s a helper that handles the boilerplate of fetching the current user and transforming a boolean check into a success or failure:

```typescript
/**
 * Creates a policy from a predicate function that evaluates the current user.
 */
export const policy = <E, R>(
  predicate: (user: CurrentUser["Type"]) => Effect.Effect<boolean, E, R>
): Policy<E, R> =>
  Effect.flatMap(CurrentUser, (user) =>
    Effect.flatMap(predicate(user), (result) =>
      result ? Effect.void : Effect.fail(new CustomHttpApiError.Forbidden())
    )
  );
```

This helper simplifies defining policies. You just provide a function that takes a user and returns a boolean Effect - the rest is handled for you.

With this foundation, we can build permission-based policies:

```typescript
/**
 * Creates a policy that checks if the current user has a specific permission.
 */
export const permission = (requiredPermission: Permission): Policy =>
  policy((user) => Effect.succeed(user.permissions.has(requiredPermission)));
```

This creates a policy that succeeds if the user has the specified permission, or fails with a Forbidden error if they don’t.

### Applying Policies to Effects

Now we need to connect these policies to our business logic without cluttering the implementation:

```typescript
/**
 * Applies a policy as a pre-check to an effect.
 * If the policy fails, the effect will fail with Forbidden.
 */
export const withPolicy =
  <E, R>(policy: Policy<E, R>) =>
  <A, E2, R2>(self: Effect.Effect<A, E2, R2>) =>
    Effect.zipRight(policy, self);
```

The `withPolicy` function creates a wrapper around any Effect. It first evaluates the policy, and only if the policy succeeds does it run the original effect. If the policy fails, the entire computation short-circuits with a `Forbidden` error.

Now we can write code like this:

```typescript
import * as Policy from "@org/domain/Policy";

const deletePost = (postId: string) =>
  Effect.tryPromise(() => db.posts.delete(postId)).pipe(
    Policy.withPolicy(Policy.permission("posts:delete"))
  );
```

The code is clear and declarative. The type system ensures we only check valid permissions, and Effect’s context handling takes care of the dependency wiring.

### The Power of Composition: Combining Policies

Where this approach really shines is in composing policies. We can create complex authorization rules by combining simpler ones:

```typescript
/**
 * Composes multiple policies with AND semantics - all policies must pass.
 */
export const all = <E, R>(
  ...policies: NonEmptyReadonlyArray<Policy<E, R>>
): Policy<E, R> =>
  Effect.all(policies, {
    concurrency: 1,
    discard: true
  });

/**
 * Composes multiple policies with OR semantics - at least one policy must pass.
 */
export const any = <E, R>(
  ...policies: NonEmptyReadonlyArray<Policy<E, R>>
): Policy<E, R> => Effect.firstSuccessOf(policies);
```

These combinators let us express complex authorization rules clearly:

```typescript
// User must have both permissions to access this endpoint
const restrictedEndpoint = Effect.promise(() => /* sensitive operation */).pipe(
  Policy.withPolicy(Policy.all(
    Policy.permission("admin:access"),
    Policy.permission("sensitive:read")
  ))
);

// User can access this endpoint with either permission
const flexibleEndpoint = Effect.promise(() => /* common operation */).pipe(
  Policy.withPolicy(
    Policy.any(
      Policy.permission("posts:read"),
      Policy.permission("comments:read")
    )
  )
);
```

This approach is more readable than traditional if-statements and more maintainable. Each policy is a self-contained unit that can be tested in isolation, and complex authorization rules are built by composing these units together.

### Testing Policies

One of the biggest benefits of this approach is testability. Here’s how we can test these policies:

```typescript
import { describe, it } from "@effect/vitest";
import { deepStrictEqual } from "assert";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import { UserId } from "../src/EntityIds.js";
import * as Policy from "../src/Policy.js";

const mockUser = (
  perms: Array<Policy.Permission>
): Policy.CurrentUser["Type"] =>
  ({
    sessionId: "test-session",
    userId: UserId.make("test-user"),
    permissions: new Set(perms)
  }) as const;

const provideCurrentUser = (perms: Array<Policy.Permission>) =>
  Effect.provide(Layer.succeed(Policy.CurrentUser, mockUser(perms)));

it.effect("denies access when user doesn't have required permission", () =>
  Effect.gen(function* () {
    const result = yield* Effect.succeed("allowed").pipe(
      Policy.withPolicy(Policy.permission("comments:manage")),
      Effect.exit
    );

    deepStrictEqual(Exit.isFailure(result), true);
  }).pipe(provideCurrentUser(["comments:read"]))
);

it.effect("grants access when user has any required permission", () =>
  Effect.gen(function* () {
    const result = yield* Effect.succeed("allowed").pipe(
      Policy.withPolicy(
        Policy.any(
          Policy.permission("posts:read"),
          Policy.permission("comments:manage")
        )
      ),
      Effect.exit
    );

    deepStrictEqual(Exit.isSuccess(result), true);
  }).pipe(provideCurrentUser(["posts:read"]))
);
```

What makes this approach particularly powerful is Effect’s composability. We can write our business logic first, focusing on the core functionality, and then add permission guards where needed through simple piping. This clean separation lets us reason about our application in layers - core operations first, then security boundaries.

> 💡 Pro tip: For optimal performance AND security, place these guards as the last step in your pipeline chain. Due to Effect’s execution model, this positions them first in the actual evaluation order, allowing you to fail fast before running expensive or sensitive operations.

## Extending with Attribute-Based Access Control

Permission-based policies are great, but they don’t cover all authorization scenarios. Sometimes we need to make access decisions based on the relationship between the user and the resource - like “is this user the owner of this post?” or “is this user an admin of this forum?”

This is where Attribute-Based Access Control (ABAC) comes into play. Our policy system is already equipped to handle these complex scenarios.

Here’s how we can create attribute-based policies using our existing primitives:

```typescript
import { Database } from "@org/database";
import * as Policy from "@org/domain/Policy";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";

export class PostsRepo extends Effect.Service<PostsRepo>()("PostsRepo", {
  effect: Effect.gen(function* () {
    const db = yield* Database.Database;

    const findFirst = db.makeQuery((execute, id: string) =>
      execute((client) =>
        client.query.postsTable.findFirst({
          where: (columns, { eq }) => eq(columns.id, id)
        })
      ).pipe(Effect.flatMap(Option.fromNullable))
    );

    return {
      findFirst
    } as const;
  })
}) {}

export class PostsPolicy extends Effect.Service<PostsPolicy>()("PostsPolicy", {
  dependencies: [PostsRepo.Default],
  effect: Effect.gen(function* () {
    const postsRepo = yield* PostsRepo;

    // Check if the current user is the owner of a post
    const isOwner = (postId: string) =>
      Policy.policy((user) =>
        postsRepo
          .findFirst(postId)
          .pipe(Effect.map((post) => post.authorId === user.userId))
      );

    // Combine permission and attribute checks
    const canEdit = (postId: string) =>
      Policy.any(
        Policy.permission("posts:manage"), // Admins can edit any post
        isOwner(postId) // Authors can edit their own posts
      );

    return {
      isOwner,
      canEdit
    } as const;
  })
}) {}
```

This approach lets us define domain-specific policies that cleanly encapsulate the access control logic for each entity type. Our `isOwner` policy checks if the current user is the author of a specific post by querying the database.

What’s powerful here is how we can compose attribute-based policies with permission-based ones. The `canEdit` policy allows access if either:

1.  The user has the `posts:manage` permission (they’re an admin)
2.  They are the owner of the post

This kind of complex authorization rule would be a mess to implement with traditional if-statements, but with our policy system, it’s just a simple type-safe composition.

At the controller level, we can then apply these policies with minimal fuss:

```typescript
Effect.gen(function* () {
  const postsPolicy = yield* PostsPolicy;

  const updatePost = Effect.promise(() => /* update post logic */).pipe(
    Policy.withPolicy(postsPolicy.canEdit("post-123"))
  );

  return yield* updatePost;
});
```

The beauty of this approach is that our business logic remains clean and focused on its core responsibilities. The authorization concerns are handled separately through policies, which can be composed and reused across the application.

## Conclusion

We’ve covered a lot of ground in this post, from the fundamental mistake of checking roles directly to building a robust, type-safe, and composable policy system with Effect. Let’s recap the key takeaways:

1.  **Roles are for humans, permissions are for code** - Roles are just convenient groupings of permissions that make management easier for humans. Your code should always check for specific permissions, not roles.
2.  **Type safety is your friend** - By creating a strongly-typed permission system, we catch permission errors at compile time rather than runtime. No more typos in permission strings or checking for permissions that don’t exist.
3.  **Composition is powerful** - Effect’s functional approach lets us compose policies in a clean, declarative way. We can combine policies with AND/OR logic and apply them to any Effect in our application.
4.  **ABAC enhances flexibility** - When simple permission checks aren’t enough, attribute-based policies give you the flexibility to make access decisions based on the relationship between users and resources.
5.  **Separation of concerns** - By treating policies as first-class citizens, we can separate authorization logic from business logic, making our code more maintainable and easier to reason about.

The approach outlined in this post scales well with application complexity. As your authorization requirements grow, you can add new permissions and policies without changing your existing code structure. The composable nature of policies means you can build complex authorization rules from simple building blocks, keeping your code DRY and maintainable.

For a complete implementation of everything we’ve discussed, [check out the full code in my Effect sandbox repository](https://github.com/lucas-barake/effect-sandbox/blob/main/src/domain/Policy.ts).

Remember, the goal isn’t just to implement authorization, but to do it in a way that’s maintainable, type-safe, and aligned with your business rules. By focusing on permissions rather than roles, and leveraging Effect’s powerful abstractions, you can build an authorization system that grows with your application and keeps your code clean and maintainable.

Happy coding!

[Lucas Barake](https://lucas-barake.github.io/) | [GitHub](https://github.com/lucas-barake) | [YouTube](https://youtube.com/@lucas-barake)
March 4, 2025
