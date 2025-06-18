import { Schema } from "effect";

/**
 * Derived from https://github.com/lucas-barake/effect-monorepo/blob/main/packages/domain/src/SchemaUtils.ts
 */
export const Email = Schema.compose(Schema.Trim, Schema.Lowercase).pipe(
  Schema.minLength(1, {
    message: () => "Email is required",
  }),
  Schema.maxLength(254, {
    message: () => "Email cannot exceed 254 characters.",
  }),
  Schema.pattern(
    /^(?!\.)(?!.*\.\.)([a-z0-9_+-.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9-]*\.)+[a-z]{2,}$/,
    {
      message: () => "Invalid email format.",
    },
  ),
  Schema.brand("Email"),
);
export type Email = Schema.Schema.Type<typeof Email>;

export const UserId = Schema.Number.pipe(Schema.brand("UserId"));
export type UserId = Schema.Schema.Type<typeof UserId>;
export const UserIdFromString = Schema.NumberFromString.pipe(
  Schema.brand("UserId"),
);

export const AccountId = Schema.Number.pipe(Schema.brand("AccountId"));
export type AccountId = Schema.Schema.Type<typeof AccountId>;

export const AccountMemberId = Schema.Number.pipe(
  Schema.brand("AccountMemberId"),
);
export type AccountMemberId = Schema.Schema.Type<typeof AccountMemberId>;

export const AccountMemberIdFromString = Schema.NumberFromString.pipe(
  Schema.brand("AccountMemberId"),
);

export const UserType = Schema.Literal("customer", "staffer"); // Must align with UserType table
export type UserType = Schema.Schema.Type<typeof UserType>;

export class User extends Schema.Class<User>("User")({
  userId: UserId,
  name: Schema.NullOr(Schema.String),
  email: Email,
  userType: UserType,
  note: Schema.String,
  createdAt: Schema.DateFromString,
  lockedAt: Schema.NullOr(Schema.DateFromString),
  deletedAt: Schema.NullOr(Schema.DateFromString),
}) {}

// Use .pipe() for Schema.pick to ensure correct type inference with Schema.Class
export const UserSubject = User.pipe(
  Schema.pick("userId", "email", "userType"),
);
export interface UserSubject extends Schema.Schema.Type<typeof UserSubject> {}

// Use .pipe() for Schema.pick to ensure correct type inference with Schema.Class
export const SessionUser = User.pipe(
  Schema.pick("userId", "email", "userType"),
);
export interface SessionUser extends Schema.Schema.Type<typeof SessionUser> {}

export const SessionData = Schema.Struct({
  sessionUser: Schema.optional(SessionUser),
  d1SessionBookmark: Schema.optional(Schema.Union(Schema.String, Schema.Null)),
});
export type SessionData = Schema.Schema.Type<typeof SessionData>;

export class Account extends Schema.Class<Account>("Account")({
  accountId: AccountId,
  userId: UserId,
  stripeCustomerId: Schema.NullOr(Schema.String),
  stripeSubscriptionId: Schema.NullOr(Schema.String),
  stripeProductId: Schema.NullOr(Schema.String),
  planName: Schema.NullOr(Schema.String),
  subscriptionStatus: Schema.NullOr(Schema.String),
  createdAt: Schema.DateFromString,
}) {}

export class AccountWithUser extends Account.extend<AccountWithUser>(
  "AccountWithUser",
)({
  user: User,
}) {}

export const AccountMemberStatus = Schema.Literal("pending", "active"); // Must align with AccountMemberStatus table
export type AccountMemberStatus = Schema.Schema.Type<
  typeof AccountMemberStatus
>;

export const AccountMemberRole = Schema.Literal("admin", "member"); // Must align with AccountMemberRole table
export type AccountMemberRole = Schema.Schema.Type<typeof AccountMemberRole>;

export class AccountMember extends Schema.Class<AccountMember>("AccountMember")(
  {
    accountMemberId: AccountMemberId,
    userId: UserId,
    accountId: AccountId,
    status: AccountMemberStatus,
    role: AccountMemberRole,
  },
) {}

export class AccountMemberWithUser extends AccountMember.extend<AccountMemberWithUser>(
  "AccountMemberWithUser",
)({
  user: User,
}) {}

export class AccountMemberWithAccount extends AccountMember.extend<AccountMemberWithAccount>(
  "AccountMemberWithAccount",
)({
  account: AccountWithUser,
}) {}

export class AccountWithAccountMembers extends Account.extend<AccountWithAccountMembers>(
  "AccountWithAccountMembers",
)({
  accountMembers: Schema.Array(AccountMemberWithUser),
}) {}

export class Customer extends User.extend<Customer>("Customer")({
  account: AccountWithAccountMembers,
}) {}
