import type { BetterAuthOptions, InferAPI } from "better-auth";
import { betterAuth } from "better-auth";
import { admin, magicLink, organization } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import { d1Adapter } from "~/lib/d1-adapter";

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
type InternalAuth = ReturnType<typeof betterAuth>;
function buildAuth({
  d1,
  sendResetPassword,
  sendVerificationEmail,
  sendMagicLink,
}: CreateAuthOptions): InternalAuth {
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
    rateLimit: {
      enabled: false,
    },

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

    advanced: {
      database: {
        generateId: false,
        useNumberId: true,
      },
    },
    plugins: [
      admin(),
      organization(),
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

export type Auth = ReturnType<typeof buildAuth>;
export function createAuth(options: CreateAuthOptions): Auth {
  return buildAuth(options);
}
