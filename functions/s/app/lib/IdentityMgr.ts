import { Config, Effect, Schema } from "effect";
import { Account, AccountMember, User } from "./Domain";
import * as Q from "./Queue";
import { Repository } from "./Repository";

/*
#fetch https://effect.website/docs/data-types/data/
#fetch https://effect.website/docs/schema/classes/
#fetch https://effect.website/docs/schema/basic-usage/#structs
*/

export const IdentityMgrLimits = Object.freeze({
  maxAccountMembers: 5,
});

export class InviteError extends Schema.TaggedError<InviteError>()(
  "InviteError",
  {
    message: Schema.String,
  },
) {}

export class IdentityMgr extends Effect.Service<IdentityMgr>()("IdentityMgr", {
  accessors: true,
  dependencies: [Repository.Default],
  effect: Effect.gen(function* () {
    const repository = yield* Repository;
    return {
      provisionUser: ({ email }: Pick<User, "email">) =>
        repository.upsertUser({ email }),
      getUsers: () => repository.getUsers(),

      getCustomers: () => repository.getCustomers(),

      getAccountForUser: ({ userId }: Pick<User, "userId">) =>
        repository.getAccountForUser({ userId }),
      getAccountForMember: ({
        accountId,
        userId,
      }: Pick<Account, "accountId"> & Pick<User, "userId">) =>
        repository.getAccountForMember({ accountId, userId }),
      getAccountMemberForAccount: ({
        accountId,
        userId,
      }: Pick<AccountMember, "accountId" | "userId">) =>
        repository.getAccountMemberForAccount({
          accountId,
          userId,
          status: "active",
        }),

      setAccountStripeCustomerId: ({
        userId,
        stripeCustomerId,
      }: Pick<Account, "userId" | "stripeCustomerId">) =>
        repository.updateAccountStripeCustomerId({ userId, stripeCustomerId }),
      setAccountStripeSubscription: ({
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
        repository.updateAccountStripeSubscription({
          stripeCustomerId,
          stripeSubscriptionId,
          stripeProductId,
          planName,
          subscriptionStatus,
        }),

      getAccounts: ({ userId }: Pick<User, "userId">) =>
        repository
          .getAccountMembersForUser({ userId, status: "active" })
          .pipe(
            Effect.map((members) => members.map((member) => member.account)),
          ),
      getInvitations: ({ userId }: Pick<AccountMember, "userId">) =>
        repository.getAccountMembersForUser({ userId, status: "pending" }),
      acceptInvitation: ({
        accountMemberId,
        userId,
      }: Pick<AccountMember, "accountMemberId" | "userId">) =>
        repository.updateAccountMemberStatus({
          accountMemberId,
          userId,
          status: "active",
        }),
      declineInvitation: ({
        accountMemberId,
        userId,
      }: Pick<AccountMember, "accountMemberId" | "userId">) =>
        repository.deleteAccountMemberPending({ accountMemberId, userId }),
      revokeAccountMembership: ({
        accountMemberId,
        accountId,
      }: Pick<AccountMember, "accountMemberId" | "accountId">) =>
        repository.deleteAccountMember({ accountMemberId, accountId }),
      leaveAccountMembership: ({
        accountMemberId,
        userId,
      }: Pick<AccountMember, "accountMemberId" | "userId">) =>
        repository.deleteAccountMemberActive({
          accountMemberId,
          userId,
        }),

      getAccountMembers: ({ accountId }: Pick<Account, "accountId">) =>
        repository.getAccountMembers({ accountId }),

      invite: ({
        emails,
        accountId,
        accountEmail,
      }: Pick<Account, "accountId"> & {
        readonly emails: ReadonlySet<User["email"]>;
        readonly accountEmail: User["email"];
      }) =>
        Effect.gen(function* () {
          yield* Effect.log("AccountManager: invite", { emails });
          const accountMemberCount = yield* repository.getAccountMemberCount({
            accountId,
          });
          if (
            accountMemberCount + emails.size >
            IdentityMgrLimits.maxAccountMembers
          ) {
            return yield* Effect.fail(
              new InviteError({
                message: `Account member count exceeds the maximum limit of ${IdentityMgrLimits.maxAccountMembers}.`,
              }),
            );
          }
          const invalidInviteEmails =
            yield* repository.identifyInvalidInviteEmails({
              emails,
              accountId,
            });
          if (
            invalidInviteEmails.staffers.length > 0 ||
            invalidInviteEmails.pending.length > 0 ||
            invalidInviteEmails.active.length > 0
          ) {
            const details: string[] = [];
            if (invalidInviteEmails.staffers.length > 0) {
              details.push(
                `Invalid: [${invalidInviteEmails.staffers.join(", ")}]`,
              );
            }
            if (invalidInviteEmails.pending.length > 0) {
              details.push(
                `Already invited: [${invalidInviteEmails.pending.join(", ")}]`,
              );
            }
            if (invalidInviteEmails.active.length > 0) {
              details.push(
                `Already member: [${invalidInviteEmails.active.join(", ")}]`,
              );
            }
            return yield* Effect.fail(
              new InviteError({
                message: `Invalid invite emails: ${details.join(", ")}`,
              }),
            );
          }
          yield* repository.createAccountMembers({ emails, accountId });
          const from = yield* Config.nonEmptyString("COMPANY_EMAIL");
          const payloads = [...emails].map((email) => ({
            type: "email" as const,
            to: email,
            from,
            subject: "Invite",
            html: `Hey ${email},<br><br>You are invited to the account of ${accountEmail}<br><br>Thanks, Team.`,
            text: `Hey ${email},<br><br>You are invited to the account of ${accountEmail}<br><br>Thanks, Team.`,
          }));
          yield* Q.Producer.sendBatch(payloads);
        }),
    };
  }),
}) {}
