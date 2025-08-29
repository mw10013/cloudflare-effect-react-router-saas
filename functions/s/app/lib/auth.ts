import type { BetterAuthOptions } from "better-auth";
import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { admin, magicLink, organization } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import { Stripe } from "stripe";
import { d1Adapter } from "~/lib/d1-adapter";

// [BUG]: Stripe plugin does not handle lookupKey and annualDiscountLookupKey in onCheckoutSessionCompleted: https://github.com/better-auth/better-auth/issues/3537
// STRIPE. Duplicate customers are created when using createCustomerOnSignUp: true and and a customer with same email exists in stripe: https://github.com/better-auth/better-auth/issues/3670
// TypeScript Error: "The inferred type of this node exceeds the maximum length the compiler will serialize" when using admin and organization plugins together. : https://github.com/better-auth/better-auth/issues/3067#issuecomment-2988246817

interface CreateAuthOptions {
  d1: D1Database;
  stripeClient: Stripe;
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
  basicPriceId: string;
  proPriceId: string;
}

function createBetterAuthOptions({
  d1,
  stripeClient,
  sendResetPassword,
  sendVerificationEmail,
  afterEmailVerification,
  sendMagicLink,
  sendInvitationEmail,
  databaseHookUserCreateAfter,
  databaseHookSessionCreateBefore,
  basicPriceId,
  proPriceId,
}: CreateAuthOptions) {
  console.log("createBetterAuthOptions", { basicPriceId, proPriceId });
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
      afterEmailVerification,
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
            if (env.ENVIRONMENT === "local") {
              await env.KV.put(`local:magicLink`, data.url, {
                expirationTtl: 60,
              });
            }
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
      stripe({
        stripeClient,
        stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
        createCustomerOnSignUp: false,
        subscription: {
          enabled: true,
          requireEmailVerification: true,
          plans: [
            {
              name: "basic",
              lookupKey: "basic",
              priceId: basicPriceId,
            },
            {
              name: "pro",
              lookupKey: "pro",
              priceId: proPriceId,
            },
          ],
          authorizeReference: async ({ user, referenceId, action }) => {
            console.log(
              `stripe plugin: authorizeReference: user ${user.id} is attempting to ${action} subscription for referenceId ${referenceId}`,
            );
            return true;
          },
          onSubscriptionComplete: async ({ subscription, plan }) => {
            console.log(
              `stripe plugin: onSubscriptionComplete: subscription ${subscription.id} completed for plan ${plan.name}`,
            );
          },
          onSubscriptionUpdate: async ({ subscription }) => {
            console.log(
              `stripe plugin: onSubscriptionUpdate: subscription ${subscription.id} updated`,
            );
          },
          onSubscriptionCancel: async ({ subscription }) => {
            console.log(
              `stripe plugin: onSubscriptionCancel: subscription ${subscription.id} canceled`,
            );
          },
          onSubscriptionDeleted: async ({ subscription }) => {
            console.log(
              `stripe plugin: onSubscriptionDeleted: subscription ${subscription.id} deleted`,
            );
          },
        },
        schema: {
          subscription: {
            modelName: "Subscription",
          },
        },
        onCustomerCreate: async ({ stripeCustomer, user }) => {
          console.log(
            `stripe plugin: onCustomerCreate: customer ${stripeCustomer.id} created for user ${user.email}`,
          );
        },
        onEvent: async (event: Stripe.Event) => {
          console.log(
            `stripe plugin: onEvent: stripe event received: ${event.type}`,
          );
        },
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
