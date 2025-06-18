import { D1, SchemaEx } from "@workspace/shared";
import { Effect, pipe, Schema } from "effect";
import {
  Account,
  AccountMember,
  AccountMemberWithAccount,
  AccountMemberWithUser,
  AccountWithUser,
  Customer,
  User,
} from "./Domain";

/**
 * Repository provides data access methods for the application's domain entities.
 *
 * Naming Conventions:
 * - `get*`: SELECT operations that retrieve entities
 * - `update*`: UPDATE operations that modify existing entities
 * - `upsert*`: INSERT OR UPDATE operations for creating or updating entities
 * - `create*`: INSERT operations for creating new entities
 * - `delete*`/`softDelete*`: DELETE operations (either physical or logical)
 *
 * @example
 * ```ts
 * import { Repository } from './Repository'
 *
 * // Within an Effect context
 * const program = Effect.gen(function*() {
 *   const repo = yield* Repository
 *   const customers = yield* repo.getCustomers()
 *   // ...
 * })
 * ```
 */
export class Repository extends Effect.Service<Repository>()("Repository", {
  accessors: true,
  // dependencies: [D1.D1.Default],
  dependencies: [D1.D1Session.Default],
  effect: Effect.gen(function* () {
    // const d1 = yield* D1.D1;
    const d1 = yield* D1.D1Session;

    const upsertUserStatements = ({ email }: Pick<User, "email">) => [
      d1
        .prepare(
          `
insert into User (email, userType) values (?, 'customer') 
on conflict (email) do update set 
  deletedAt = case when userType = 'staffer' then deletedAt else null end
returning *`,
        )
        .bind(email),
      d1
        .prepare(
          `
insert into Account (userId) 
select userId from User where email = ?1 and userType = 'customer'
on conflict (userId) do nothing`,
        )
        .bind(email),
      // https://www.sqlite.org/lang_insert.html
      // To avoid a parsing ambiguity, the SELECT statement should always contain a WHERE clause, even if that clause is simply "WHERE true", if the upsert-clause is present.
      d1
        .prepare(
          `
with c as (select u.userId, a.accountId
  from User u inner join Account a on a.userId = u.userId
  where u.email = ?1 and u.userType = 'customer')
insert into AccountMember (userId, accountId, status, role)
select userId, accountId, 'active', 'admin' from c where true
on conflict (userId, accountId) do nothing`,
        )
        .bind(email),
    ];

    return {
      getCustomers: () =>
        pipe(
          d1.prepare(
            `
select json_group_array(json_object(
	'userId', u.userId, 
  'name', u.name, 
  'email', u.email, 
  'userType', u.userType, 
  'note', u.note,
	'createdAt', u.createdAt, 
  'lockedAt', u.lockedAt,
  'deletedAt', u.deletedAt,
	'account', json_object(
		'accountId', a.accountId, 
    'userId', a.userId, 
    'stripeCustomerId', a.stripeCustomerId, 
    'stripeSubscriptionId', a.stripeSubscriptionId, 
    'stripeProductId', a.stripeProductId, 
    'planName', a.planName, 
    'subscriptionStatus', a.subscriptionStatus,
    'createdAt', a.createdAt,
		'accountMembers', (select json_group_array(json_object(
			'accountMemberId', am.accountMemberId, 
      'userId', am.userId, 
      'accountId', am.accountId, 
      'status', am.status, 
      'role', am.role,
			'user', json_object(
        'userId', u1.userId, 
        'name', u1.name, 
        'email', u1.email, 
        'userType', u1.userType, 
        'note', u1.note,
        'createdAt', u1.createdAt, 
        'lockedAt', u1.lockedAt,
        'deletedAt', u1.deletedAt
      )
		)) from AccountMember am inner join User u1 on u1.userId = am.userId where am.accountId = a.accountId)
  )
)) as data from User u inner join Account a on a.userId = u.userId where userType = 'customer' order by u.email
				`,
          ),
          d1.first,
          Effect.flatMap(Effect.fromNullable),
          Effect.flatMap(
            Schema.decodeUnknown(
              SchemaEx.DataFromResult(Schema.Array(Customer)),
            ),
          ),
        ),

      getUsers: () =>
        pipe(
          d1.prepare(
            `
select 
  u.userId, 
  u.name, 
  u.email, 
  u.userType, 
  u.note,
  u.createdAt, 
  u.lockedAt,
  u.deletedAt
from User u 
order by u.email`,
          ),
          d1.run,
          Effect.flatMap((result) =>
            Schema.decodeUnknown(Schema.Array(User))(result.results),
          ),
        ),

      getAccountForUser: ({ userId }: Pick<User, "userId">) =>
        pipe(
          d1.prepare(`select * from Account where userId = ?`).bind(userId),
          d1.first,
          Effect.flatMap(Effect.fromNullable),
          Effect.flatMap(Schema.decodeUnknown(Account)),
        ),

      getAccountForMember: ({
        accountId,
        userId,
      }: Pick<Account, "accountId"> & Pick<User, "userId">) =>
        pipe(
          d1
            .prepare(
              `
select json_object(
	'accountId', a.accountId, 
	'userId', a.userId, 
	'stripeCustomerId', a.stripeCustomerId, 
	'stripeSubscriptionId', a.stripeSubscriptionId, 
	'stripeProductId', a.stripeProductId, 
	'planName', a.planName, 
	'subscriptionStatus', a.subscriptionStatus,
	'createdAt', a.createdAt,
	'user', json_object(
		'userId', u.userId, 
		'name', u.name, 
		'email', u.email, 
		'userType', u.userType, 
    'note', u.note,
		'createdAt', u.createdAt, 
    'lockedAt', u.lockedAt,
		'deletedAt', u.deletedAt
	)
) as data 
from Account a 
inner join AccountMember am on a.accountId = am.accountId
inner join User u on u.userId = a.userId
where a.accountId = ?1 and am.userId = ?2 and am.status = 'active'`,
            )
            .bind(accountId, userId),
          d1.first,
          Effect.flatMap(Effect.fromNullable),
          Effect.flatMap(
            Schema.decodeUnknown(SchemaEx.DataFromResult(AccountWithUser)),
          ),
        ),

      updateAccountStripeCustomerId: ({
        userId,
        stripeCustomerId,
      }: Pick<Account, "userId" | "stripeCustomerId">) =>
        pipe(
          d1
            .prepare("update Account set stripeCustomerId = ? where userId = ?")
            .bind(stripeCustomerId, userId),
          d1.run,
        ),

      updateAccountStripeSubscription: ({
        stripeCustomerId,
        stripeSubscriptionId,
        stripeProductId,
        planName,
        subscriptionStatus,
      }: Pick<
        Account,
        | "stripeSubscriptionId"
        | "stripeProductId"
        | "planName"
        | "subscriptionStatus"
      > & {
        stripeCustomerId: NonNullable<Account["stripeCustomerId"]>;
      }) =>
        pipe(
          d1
            .prepare(
              "update Account set stripeSubscriptionId = ?, stripeProductId = ?, planName = ?, subscriptionStatus = ? where stripeCustomerId = ?",
            )
            .bind(
              stripeSubscriptionId,
              stripeProductId,
              planName,
              subscriptionStatus,
              stripeCustomerId,
            ),
          d1.run,
        ),

      upsertUser: ({ email }: Pick<User, "email">) =>
        d1.batch([...upsertUserStatements({ email })]).pipe(
          Effect.flatMap((results) =>
            Effect.fromNullable(results[0].results[0]),
          ),
          Effect.flatMap(Schema.decodeUnknown(User)),
        ),

      /**
       * Soft deletes a user by setting deletedAt to the current timestamp and removing all AccountMember rows for the user.
       * The user record is retained for Stripe and audit requirements; deletedAt is used to exclude users from active queries.
       * All AccountMember relationships are hard deleted, but the Account is untouched.
       * No-op for staffers.
       */
      softDeleteUser: ({ userId }: Pick<User, "userId">) =>
        d1.batch([
          d1
            .prepare(
              `update User set deletedAt = datetime('now') where userId = ? and userType = 'customer'`,
            )
            .bind(userId),
          d1
            .prepare(`delete from AccountMember where userId = ?1`)
            .bind(userId), // ok for staffers: they are never in AccountMember
        ]),

      /**
       * Undeletes a user by clearing deletedAt and re-inserting the AccountMember row for the user's account.
       * This reactivates the user and restores their account membership if missing. Fails if AccountMember already exists.
       * No-op for staffers.
       */
      undeleteUser: ({ userId }: Pick<User, "userId">) =>
        d1.batch([
          d1
            .prepare(`update User set deletedAt = null where userId = ?`)
            .bind(userId), // ok for staffers: update is a no-op
          d1
            .prepare(
              `insert into AccountMember (userId, accountId, status, role)
select u.userId, a.accountId, 'active', 'admin'
from User u inner join Account a on a.userId = u.userId
where u.userId = ?1 and u.userType = 'customer'`,
            )
            .bind(userId),
        ]),

      /**
       * Locks a user by setting lockedAt. Applies regardless of deletedAt; ensures a rehydrated user remains locked if previously locked.
       */
      lockUser: ({ userId }: { userId: User["userId"] }) =>
        pipe(
          d1
            .prepare(
              `update User set lockedAt = datetime('now') where userId = ?`,
            )
            .bind(userId),
          d1.run,
          Effect.asVoid,
        ),

      /**
       * Unlocks a user by clearing lockedAt. Applies regardless of deletedAt; allows unlocking even if user is soft deleted.
       */
      unlockUser: ({ userId }: { userId: User["userId"] }) =>
        pipe(
          d1
            .prepare(`update User set lockedAt = null where userId = ?`)
            .bind(userId),
          d1.run,
          Effect.asVoid,
        ),

      getAccountMemberForAccount: ({
        accountId,
        userId,
        status,
      }: Pick<AccountMember, "accountId" | "userId" | "status">) =>
        pipe(
          d1
            .prepare(
              `
select json_object(
  'accountMemberId', am.accountMemberId,
  'userId', am.userId,
  'accountId', am.accountId,
  'status', am.status,
  'role', am.role,
  'account', json_object(
      'accountId', a.accountId,
      'userId', a.userId,
      'stripeCustomerId', a.stripeCustomerId,
      'stripeSubscriptionId', a.stripeSubscriptionId,
      'stripeProductId', a.stripeProductId,
      'planName', a.planName,
      'subscriptionStatus', a.subscriptionStatus,
      'createdAt', a.createdAt,
      'user', json_object(
          'userId', u.userId,
          'name', u.name,
          'email', u.email,
          'userType', u.userType,
          'note', u.note,
          'createdAt', u.createdAt,
          'lockedAt', u.lockedAt,
          'deletedAt', u.deletedAt
      )
    )
) as data
from AccountMember am
inner join Account a on am.accountId = a.accountId
inner join User u on u.userId = a.userId
where am.accountId = ?1 and am.userId = ?2 and am.status = ?3`,
            )
            .bind(accountId, userId, status),
          d1.first,
          Effect.flatMap(Effect.fromNullable),
          Effect.flatMap(
            Schema.decodeUnknown(
              SchemaEx.DataFromResult(AccountMemberWithAccount),
            ),
          ),
        ),

      getAccountMembersForUser: ({
        userId,
        status,
      }: Pick<AccountMember, "userId" | "status">) =>
        pipe(
          d1
            .prepare(
              `
select json_group_array(json_object(
	'accountMemberId', am.accountMemberId, 
  'userId', am.userId, 
  'accountId', am.accountId, 
  'status', am.status, 
  'role', am.role,
	'account', json_object(
		'accountId', a.accountId, 
    'userId', a.userId, 
    'stripeCustomerId', a.stripeCustomerId, 
    'stripeSubscriptionId', a.stripeSubscriptionId, 
    'stripeProductId', a.stripeProductId, 
    'planName', a.planName, 
    'subscriptionStatus', a.subscriptionStatus,
    'createdAt', a.createdAt,
		'user', json_object(
			'userId', u.userId, 
      'name', u.name, 
      'email', u.email, 
      'userType', u.userType, 
      'note', u.note,
      'createdAt', u.createdAt, 
      'lockedAt', u.lockedAt,
      'deletedAt', u.deletedAt
		)
  )
)) as data from AccountMember am
inner join Account a on a.accountId = am.accountId
inner join User u on u.userId = a.userId 
where am.userId = ? and am.status = ?`,
            )
            .bind(userId, status),
          d1.first,
          Effect.flatMap(Effect.fromNullable),
          Effect.flatMap(
            Schema.decodeUnknown(
              SchemaEx.DataFromResult(Schema.Array(AccountMemberWithAccount)),
            ),
          ),
        ),

      getAccountMembers: ({ accountId }: Pick<Account, "accountId">) =>
        pipe(
          d1
            .prepare(
              `
select json_group_array(json_object(
	'accountMemberId', am.accountMemberId, 
  'userId', am.userId, 
  'accountId', am.accountId, 
  'status', am.status, 
  'role', am.role,
	'user', json_object(
    'userId', u.userId, 
    'name', u.name, 
    'email', u.email, 
    'userType', u.userType, 
    'note', u.note,
    'createdAt', u.createdAt, 
    'lockedAt', u.lockedAt,
    'deletedAt', u.deletedAt 
  )
)) as data from AccountMember am inner join User u on u.userId = am.userId where am.accountId = ?`,
            )
            .bind(accountId),
          d1.first,
          Effect.flatMap(Effect.fromNullable),
          Effect.flatMap(
            Schema.decodeUnknown(
              SchemaEx.DataFromResult(Schema.Array(AccountMemberWithUser)),
            ),
          ),
        ),

      getAccountMemberCount: ({ accountId }: Pick<Account, "accountId">) =>
        pipe(
          d1
            .prepare(
              `select count(*) as accountMemberCount from AccountMember where accountId = ?`,
            )
            .bind(accountId),
          d1.first<{ accountMemberCount: number }>,
          Effect.flatMap(Effect.fromNullable),
          Effect.map((result) => result.accountMemberCount),
        ),

      createAccountMembers: ({
        emails,
        accountId,
      }: Pick<Account, "accountId"> & {
        readonly emails: ReadonlySet<User["email"]>;
      }) =>
        Effect.gen(function* () {
          yield* Effect.log("Repository: createAccountMembers", {
            emails,
            accountId,
          });
          const createAccountMemberStatements = ({
            email,
            accountId,
          }: Pick<User, "email"> & Pick<Account, "accountId">) => [
            ...upsertUserStatements({ email }),
            d1
              .prepare(
                `
insert into AccountMember (userId, accountId, status, role) 
values ((select userId from User where email = ?), ?, 'pending', 'member') returning *							
							`,
              )
              .bind(email, accountId),
          ];
          return yield* d1.batch(
            [...emails].flatMap((email) =>
              createAccountMemberStatements({ email, accountId }),
            ),
          );
        }),

      /** Updates the status of an account member, guarded by userId. */
      updateAccountMemberStatus: ({
        accountMemberId,
        userId,
        status,
      }: Pick<AccountMember, "accountMemberId" | "userId" | "status">) =>
        pipe(
          d1
            .prepare(
              `
update AccountMember set status = ?1
where accountMemberId = ?2 and userId = ?3`,
            )
            .bind(status, accountMemberId, userId),
          d1.run,
        ),

      /**
       * Deletes an account member.
       * This operation will not delete the account owner.
       */
      deleteAccountMember: ({
        accountMemberId,
        accountId,
      }: Pick<AccountMember, "accountMemberId" | "accountId">) =>
        pipe(
          d1
            .prepare(
              `
with t as (
	select am.accountMemberId
	from AccountMember am inner join Account a on a.accountId = am.accountId
	where am.accountMemberId = ?1 and am.accountId = ?2 and a.userId <> am.userId
)
delete from AccountMember
where accountMemberId in (select accountMemberId from t)`,
            )
            .bind(accountMemberId, accountId),
          d1.run,
        ),

      deleteAccountMemberPending: ({
        accountMemberId,
        userId,
      }: Pick<AccountMember, "accountMemberId" | "userId">) =>
        pipe(
          d1
            .prepare(
              `delete from AccountMember where accountMemberId = ?1 and userId = ?2 and status = 'pending'`,
            )
            .bind(accountMemberId, userId),
          d1.run,
        ),

      deleteAccountMemberActive: ({
        accountMemberId,
        userId,
      }: Pick<AccountMember, "accountMemberId" | "userId">) =>
        pipe(
          d1
            .prepare(
              `
with t as (
  select am.accountMemberId 
  from AccountMember am 
  inner join Account a on a.accountId = am.accountId 
  where am.accountMemberId = ?1 and am.userId = ?2 and am.status = 'active' and a.userId <> am.userId
)
delete from AccountMember where accountMemberId in (select accountMemberId from t)`,
            )
            .bind(accountMemberId, userId),
          d1.run,
        ),

      /**
       * Identifies emails that cannot be invited to an account for various reasons.
       * Returns categorized lists of ineligible emails:
       * - staffers: emails that belong to staff members (who cannot be invited)
       * - pending: emails that already have a pending invitation
       * - active: emails that already have active membership
       */
      identifyInvalidInviteEmails: ({
        emails,
        accountId,
      }: Pick<Account, "accountId"> & {
        readonly emails: ReadonlySet<User["email"]>;
      }) =>
        Effect.gen(function* () {
          const DataSchema = Schema.Struct({
            staffers: Schema.Array(Schema.String),
            pending: Schema.Array(Schema.String),
            active: Schema.Array(Schema.String),
          });
          const emailPlaceholders = [...emails].map(() => `(?)`).join(",");
          return yield* pipe(
            d1
              .prepare(
                `
with Email (email) as (values ${emailPlaceholders}),
IneligibleEmail as (
	select 
		e.email,
		case 
			when u.userType = 'staffer' then 'staffer'
			when am.status = 'pending' then 'pending'
			when am.status = 'active' then 'active'
		end as reason
	from Email e
		inner join User u on e.email = u.email
		left join AccountMember am on u.userId = am.userId and am.accountId = ?
	where u.userType = 'staffer' or am.userId is not null
)
select json_object(
	'staffers', (
		select json_group_array(email)
		from IneligibleEmail
		where reason = 'staffer'
	),
	'pending', (
		select json_group_array(email)
		from IneligibleEmail
		where reason = 'pending'
	),
	'active', (
		select json_group_array(email)
		from IneligibleEmail
		where reason = 'active'
	)
) as data`,
              )
              .bind(...emails, accountId),
            d1.first,
            Effect.flatMap(Effect.fromNullable),
            Effect.flatMap(
              Schema.decodeUnknown(SchemaEx.DataFromResult(DataSchema)),
            ),
          );
        }),
    };
  }),
}) {}
