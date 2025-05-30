import { Context, Effect, Schema } from "effect";
import { type NonEmptyReadonlyArray } from "effect/Array";
import { UnknownException } from "effect/Cause";

export type PermissionAction = "read" | "manage" | "delete";
export type PermissionConfig = Record<string, ReadonlyArray<PermissionAction>>;

export type InferPermissions<T extends PermissionConfig> = {
  [K in keyof T]: T[K][number] extends PermissionAction
    ? `${K & string}:${T[K][number]}`
    : never;
}[keyof T];

export const makePermissions = <T extends PermissionConfig>(
  config: T,
): Array<InferPermissions<T>> => {
  return Object.entries(config).flatMap(([domain, actions]) =>
    actions.map((action) => `${domain}:${action}` as InferPermissions<T>),
  );
};

// ==========================================
// Permissions
// ==========================================

const Permissions = makePermissions({
  __test: ["read", "manage", "delete"],
} as const);

export const Permission = Schema.Literal(...Permissions).annotations({
  identifier: "Permission",
});
export type Permission = typeof Permission.Type;

// ==========================================
// Authentication Middleware
// ==========================================

export class CurrentUser extends Context.Tag("CurrentUser")<
  CurrentUser,
  {
    readonly sessionId: string;
    // readonly userId: UserId;
    readonly userId: number;
    readonly permissions: Set<Permission>;
  }
>() {}

// export class UserAuthMiddleware extends HttpApiMiddleware.Tag<UserAuthMiddleware>()(
//   "UserAuthMiddleware",
//   {
//     failure: CustomHttpApiError.Unauthorized,
//     provides: CurrentUser,
//   },
// ) {}

// ==========================================
// Policy
// ==========================================

/**
 * Represents an access policy that can be evaluated against the current user.
 * A policy is a function that returns Effect.void if access is granted,
 * or fails with an UnknownException if access is denied.
 */
type Policy<E = never, R = never> = Effect.Effect<
  void,
  UnknownException | E, // Updated to use UnknownException
  CurrentUser | R
>;

/**
 * Creates a policy from a predicate function that evaluates the current user.
 */
export const policy = <E, R>(
  predicate: (user: CurrentUser["Type"]) => Effect.Effect<boolean, E, R>,
  message?: string,
): Policy<E, R> =>
  Effect.flatMap(CurrentUser, (user) =>
    Effect.flatMap(
      predicate(user),
      (result) =>
        result
          ? Effect.void
          : Effect.fail(new UnknownException(undefined, message)), // Updated to use new UnknownException
    ),
  );

/**
 * Applies a predicate as a pre-check to an effect.
 * If the predicate returns false, the effect will fail with Forbidden.
 */
export const withPolicy =
  <E, R>(policy: Policy<E, R>) =>
  <A, E2, R2>(self: Effect.Effect<A, E2, R2>) =>
    Effect.zipRight(policy, self);

/**
 * Composes multiple policies with AND semantics - all policies must pass.
 * Returns a new policy that succeeds only if all the given policies succeed.
 */
export const all = <E, R>(
  ...policies: NonEmptyReadonlyArray<Policy<E, R>>
): Policy<E, R> =>
  Effect.all(policies, {
    concurrency: 1,
    discard: true,
  });

/**
 * Composes multiple policies with OR semantics - at least one policy must pass.
 * Returns a new policy that succeeds if any of the given policies succeed.
 */
export const any = <E, R>(
  ...policies: NonEmptyReadonlyArray<Policy<E, R>>
): Policy<E, R> => Effect.firstSuccessOf(policies);

/**
 * Creates a policy that checks if the current user has a specific permission.
 */
export const permission = (requiredPermission: Permission): Policy =>
  policy((user) => Effect.succeed(user.permissions.has(requiredPermission)));
