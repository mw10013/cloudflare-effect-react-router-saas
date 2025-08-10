import type { BetterAuthOptions, InferAPI } from "better-auth";
import { betterAuth } from "better-auth";
import { admin, magicLink, organization } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import { d1Adapter } from "~/lib/d1-adapter";

/**
 * We define FullAuthOptions and use InferAPI so that TypeScript always knows the full set of endpoints on auth.api,
 * no matter how or where the auth object is created. This is crucial because we instantiate auth dynamically
 * (with different configs) in both production and test environments, but we want consistent, complete type safety
 * for all plugin endpoints everywhere.
 *
 * Limitations:
 * - The plugins array in FullAuthOptions must be kept in sync manually with the plugins array in createAuth.
 * - If plugin options differ between environments (e.g., production vs. test), this approach cannot guarantee type safety for all possible plugin configurations.
 * - TypeScript type inference from runtime plugin arrays is limited when plugin options are dynamic, and may result in non-portable or overly broad types.
 */
type FullAuthOptions = BetterAuthOptions & {
  plugins: [
    ReturnType<typeof admin>,
    ReturnType<typeof organization>,
    ReturnType<typeof magicLink>,
  ];
};

export type AuthAPI = InferAPI<FullAuthOptions>;

export type Auth = Omit<
  ReturnType<typeof betterAuth<FullAuthOptions>>,
  "api"
> & { api: AuthAPI };

interface CreateAuthOptions {
  d1: D1Database;
  sendResetPassword?: NonNullable<
    BetterAuthOptions["emailAndPassword"]
  >["sendResetPassword"];
  sendVerificationEmail?: NonNullable<
    BetterAuthOptions["emailVerification"]
  >["sendVerificationEmail"];
  sendMagicLink?: Parameters<typeof magicLink>[0]["sendMagicLink"];
}
export function createAuth({
  d1,
  sendResetPassword,
  sendVerificationEmail,
  sendMagicLink,
}: CreateAuthOptions) {
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: d1Adapter(d1),
    user: {
      modelName: "User",
    },
    session: {
      modelName: "Session",
      storeSessionInDatabase: true,
    },
    account: {
      modelName: "Account",
      fields: {
        accountId: "betterAuthAccountId",
      },
      accountLinking: {
        enabled: true,
      },
    },
    verification: {
      modelName: "Verification",
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword:
        sendResetPassword ??
        (async ({ user, url, token }) => {
          console.log("sendResetPassword", {
            to: user.email,
            url,
            token,
          });
        }),
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail:
        sendVerificationEmail ??
        (async ({ user, url, token }) => {
          console.log("sendVerificationEmail", {
            to: user.email,
            url,
            token,
          });
        }),
    },
    advanced: {
      database: {
        generateId: false,
        useNumberId: true,
      },
    },
    plugins: [
      admin(),
      organization({
        schema: {
          organization: {
            modelName: "Organization",
          },
          member: {
            modelName: "Member",
          },
          invitation: {
            modelName: "Invitation",
          },
        },
      }),
      magicLink({
        storeToken: "hashed",
        sendMagicLink:
          sendMagicLink ??
          (async ({ email, token, url }) => {
            console.log("sendMagicLink", { to: email, url, token });
          }),
      }),
    ],
  });
}
