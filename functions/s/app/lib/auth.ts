import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import { d1Adapter } from "~/lib/d1-adapter";

interface CreateAuthOptions
  extends Partial<Omit<BetterAuthOptions, "database">> {
  d1: D1Database;
}

export function createAuth({
  d1,
  emailAndPassword,
  emailVerification,
  ...options
}: CreateAuthOptions): ReturnType<typeof betterAuth> {
  return betterAuth({
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
      sendResetPassword: async ({ user, url, token }, request) => {
        console.log("Stub: sendResetPassword", { to: user.email, url, token });
      },
      onPasswordReset: async ({ user }, request) => {
        console.log(`Stub: Password for user ${user.email} has been reset.`);
      },
      ...emailAndPassword,
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url, token }, request) => {
        console.log("sendVerificationEmail", {
          to: user.email,
          url,
          token,
        });
      },
      ...emailVerification,
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
      // cookies: {},
      // disableCSRFCheck: true,
      database: {
        generateId: false,
        useNumberId: true,
      },
    },
    ...options,
    plugins: [admin(), organization()],
  });
}

// export const auth = createAuth();
