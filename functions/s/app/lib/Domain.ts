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

export const User = Schema.Struct({
  userId: UserId,
  name: Schema.NullOr(Schema.String),
  email: Email,
  userType: UserType,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
  deletedAt: Schema.NullOr(Schema.DateFromString),
});
export type User = Schema.Schema.Type<typeof User>;

export const UserSubject = User.pick("userId", "email", "userType");

export const SessionUser = User.pick("userId", "email", "userType");
export type SessionUser = Schema.Schema.Type<typeof SessionUser>;

export const SessionData = Schema.Struct({
  sessionUser: Schema.optional(SessionUser),
});
export type SessionData = Schema.Schema.Type<typeof SessionData>;

export const Account = Schema.Struct({
  accountId: AccountId,
  userId: UserId,
  stripeCustomerId: Schema.NullOr(Schema.String),
  stripeSubscriptionId: Schema.NullOr(Schema.String),
  stripeProductId: Schema.NullOr(Schema.String),
  planName: Schema.NullOr(Schema.String),
  subscriptionStatus: Schema.NullOr(Schema.String),
});
export type Account = Schema.Schema.Type<typeof Account>;

export const AccountWithUser = Schema.Struct({
  ...Account.fields,
  user: User,
});
export type AccountWithUser = Schema.Schema.Type<typeof AccountWithUser>;

export const AccountMemberStatus = Schema.Literal("pending", "active"); // Must align with AccountMemberStatus table
export type AccountMemberStatus = Schema.Schema.Type<
  typeof AccountMemberStatus
>;

export const AccountMemberRole = Schema.Literal("admin", "member"); // Must align with AccountMemberRole table
export type AccountMemberRole = Schema.Schema.Type<typeof AccountMemberRole>;

export const AccountMember = Schema.Struct({
  accountMemberId: AccountMemberId,
  userId: UserId,
  accountId: AccountId,
  status: AccountMemberStatus,
  role: AccountMemberRole,
});
export type AccountMember = Schema.Schema.Type<typeof AccountMember>;

export const AccountMemberWithUser = Schema.Struct({
  ...AccountMember.fields,
  user: User,
});
export type AccountMemberWithUser = Schema.Schema.Type<
  typeof AccountMemberWithUser
>;

export const AccountMemberWithAccount = Schema.Struct({
  ...AccountMember.fields,
  account: AccountWithUser,
});
export type AccountMemberWithAccount = Schema.Schema.Type<
  typeof AccountMemberWithAccount
>;

export const AccountWithAccountMembers = Schema.Struct({
  ...Account.fields,
  accountMembers: Schema.Array(AccountMemberWithUser),
});
export type AccountWithAccountMembers = Schema.Schema.Type<
  typeof AccountWithAccountMembers
>;

export const Customer = Schema.Struct({
  ...User.fields,
  account: AccountWithAccountMembers,
});
export type Customer = Schema.Schema.Type<typeof Customer>;
