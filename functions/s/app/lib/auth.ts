import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { admin, magicLink, organization } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import { d1Adapter } from "~/lib/d1-adapter";

// https://github.com/better-auth/better-auth/issues/3067#issuecomment-2988246817

interface CreateAuthOptions {
  d1: D1Database;
  sendResetPassword?: NonNullable<
    BetterAuthOptions["emailAndPassword"]
  >["sendResetPassword"];
  sendVerificationEmail?: NonNullable<
    BetterAuthOptions["emailVerification"]
  >["sendVerificationEmail"];
  afterEmailVerification?: NonNullable<
    BetterAuthOptions["emailVerification"]
  >["afterEmailVerification"];
  sendMagicLink?: Parameters<typeof magicLink>[0]["sendMagicLink"];
  sendInvitationEmail?: NonNullable<
    Parameters<typeof organization>[0]
  >["sendInvitationEmail"];
  databaseHookUserCreateAfter?: NonNullable<
    NonNullable<
      NonNullable<BetterAuthOptions["databaseHooks"]>["user"]
    >["create"]
  >["after"];
  databaseHookSessionCreateBefore?: NonNullable<
    NonNullable<
      NonNullable<BetterAuthOptions["databaseHooks"]>["session"]
    >["create"]
  >["before"];
}

function createBetterAuthOptions({
  d1,
  sendResetPassword,
  sendVerificationEmail,
  afterEmailVerification,
  sendMagicLink,
  sendInvitationEmail,
  databaseHookUserCreateAfter,
  databaseHookSessionCreateBefore,
}: CreateAuthOptions) {
  return {
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    telemetry: { enabled: false },
    database: d1Adapter(d1),
    user: { modelName: "User" },
    session: { modelName: "Session", storeSessionInDatabase: true },
    account: {
      modelName: "Account",
      fields: { accountId: "betterAuthAccountId" },
      accountLinking: { enabled: true },
    },
    verification: { modelName: "Verification" },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword:
        sendResetPassword ??
        (async ({ user, url, token }) => {
          console.log("sendResetPassword", { to: user.email, url, token });
        }),
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail:
        sendVerificationEmail ??
        (async ({ user, url, token }) => {
          console.log("sendVerificationEmail", { to: user.email, url, token });
        }),
      afterEmailVerification
    },
    advanced: { database: { generateId: false, useNumberId: true } },
    databaseHooks: {
      user: {
        create: {
          after:
            databaseHookUserCreateAfter ??
            (async (user) => {
              console.log("databaseHooks.user.create.after", user);
            }),
        },
      },
      session: {
        create: {
          before:
            databaseHookSessionCreateBefore ??
            (async (session) => {
              console.log("databaseHooks.session.create.before", session);
            }),
        },
      },
    },
    plugins: [
      magicLink({
        storeToken: "hashed",
        sendMagicLink:
          sendMagicLink ??
          (async (data) => {
            console.log("sendMagicLink", data);
          }),
      }),
      admin(),
      organization({
        organizationLimit: 1,
        requireEmailVerificationOnInvitation: true,
        cancelPendingInvitationsOnReInvite: true,
        schema: {
          organization: { modelName: "Organization" },
          member: { modelName: "Member" },
          invitation: { modelName: "Invitation" },
        },
        sendInvitationEmail:
          sendInvitationEmail ??
          (async (data) => {
            console.log("sendInvitationEmail", data);
          }),
      }),
    ],
  } satisfies BetterAuthOptions;
}

export function createAuth(
  options: CreateAuthOptions,
): ReturnType<typeof betterAuth<ReturnType<typeof createBetterAuthOptions>>> {
  const auth = betterAuth(
    createBetterAuthOptions({
      databaseHookUserCreateAfter: async (user) => {
        if (user.role === "user") {
          await auth.api.createOrganization({
            body: {
              name: `${user.email.charAt(0).toUpperCase() + user.email.slice(1)}'s Organization`,
              slug: user.email.replace(/[^a-z0-9]/g, "-").toLowerCase(),
              userId: user.id,
            },
          });
        }
      },
      databaseHookSessionCreateBefore: async (session) => {
        const activeOrganizationId =
          (await options.d1
            .prepare(
              "select organizationId from Member where userId = ? and role = 'owner'",
            )
            .bind(session.userId)
            .first<number>("organizationId")) ?? undefined;
        return {
          data: {
            ...session,
            activeOrganizationId,
          },
        };
      },
      ...options,
    }),
  );
  return auth;
}
