import type { createStripeService } from "~/lib/stripe-service";
import type { BetterAuthOptions } from "better-auth";
import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { admin, magicLink, organization } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import { d1Adapter } from "~/lib/d1-adapter";

// [BUG]: Stripe plugin does not handle lookupKey and annualDiscountLookupKey in onCheckoutSessionCompleted: https://github.com/better-auth/better-auth/issues/3537
// STRIPE. Duplicate customers are created when using createCustomerOnSignUp: true and and a customer with same email exists in stripe: https://github.com/better-auth/better-auth/issues/3670
// TypeScript Error: "The inferred type of this node exceeds the maximum length the compiler will serialize" when using admin and organization plugins together. : https://github.com/better-auth/better-auth/issues/3067#issuecomment-2988246817

interface CreateAuthOptions {
  d1: D1Database;
  stripeService: ReturnType<typeof createStripeService>;
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
  stripeService,
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
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (
          ctx.path === "/subscription/upgrade" ||
          ctx.path === "/subscription/billing-portal" ||
          ctx.path === "/subscription/cancel-subscription"
        ) {
          console.log(`better-auth: hooks: before: ${ctx.path}`);
          await stripeService.ensureBillingPortalConfiguration();
        }
      }),
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
        stripeClient: stripeService.stripe,
        stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
        createCustomerOnSignUp: false,
        subscription: {
          enabled: true,
          requireEmailVerification: true,
          // [BUG]: Stripe plugin does not handle lookupKey and annualDiscountLookupKey in onCheckoutSessionCompleted: https://github.com/better-auth/better-auth/issues/3537
          // Workaround: populate `priceId`.
          plans: async () => {
            // console.log(`stripe plugin: plans`);
            const [basicPrice, proPrice] = await stripeService.getPrices();
            return [
              {
                name: "basic",
                priceId: basicPrice.id,
                lookupKey: "basic",
                freeTrial: {
                  days: 2,
                  onTrialStart: async (subscription) => {
                    console.log(
                      `stripe plugin: onTrialStart: basic plan trial started for subscription ${subscription.id}`,
                    );
                  },
                  onTrialEnd: async ({ subscription }, ctx) => {
                    console.log(
                      `stripe plugin: onTrialEnd: basic plan trial ended for subscription ${subscription.id}`,
                    );
                  },
                  onTrialExpired: async (subscription) => {
                    console.log(
                      `stripe plugin: onTrialExpired: basic plan trial expired for subscription ${subscription.id}`,
                    );
                  },
                },
              },
              {
                name: "pro",
                priceId: proPrice.id,
                lookupKey: "pro",
                freeTrial: {
                  days: 2,
                  onTrialStart: async (subscription) => {
                    console.log(
                      `stripe plugin: onTrialStart: pro plan trial started for subscription ${subscription.id}`,
                    );
                  },
                  onTrialEnd: async ({ subscription }, ctx) => {
                    console.log(
                      `stripe plugin: onTrialEnd: pro plan trial ended for subscription ${subscription.id}`,
                    );
                  },
                  onTrialExpired: async (subscription) => {
                    console.log(
                      `stripe plugin: onTrialExpired: pro plan trial expired for subscription ${subscription.id}`,
                    );
                  },
                },
              },
            ];
          },
          authorizeReference: async ({ user, referenceId, action }) => {
            const result = Boolean(
              await d1
                .prepare(
                  "select 1 from Member where userId = ? and organizationId = ? and role = 'owner'",
                )
                .bind(Number(user.id), Number(referenceId))
                .first(),
            );
            console.log(
              `stripe plugin: authorizeReference: user ${user.id} is attempting to ${action} subscription for referenceId ${referenceId}, authorized: ${result}`,
            );
            return result;
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
        async onEvent(event) {
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
