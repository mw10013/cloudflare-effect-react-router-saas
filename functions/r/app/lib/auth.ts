import { betterAuth, type BetterAuthOptions } from "better-auth";
import { d1Adapter } from "~/lib/d1-adapter";

export function createAuth<T extends Partial<BetterAuthOptions>>(
  { emailAndPassword, emailVerification, ...options }: T = {} as T
) {
  return betterAuth({
    // database: database ?? sqliteAdapter(db),
    // database: database ?? new Database("./sqlite.db"),
    user: {
      modelName: "User",
    },
    session: {
      modelName: "Session",
    },
    account: {
      modelName: "Account",
    },
    verification: {
      modelName: "Verification",
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      // sendResetPassword: async ({ user, url, token }, request) => {
      //   console.log("Stub: sendResetPassword", { to: user.email, url, token });
      // },
      // onPasswordReset: async ({ user }, request) => {
      //   console.log(`Stub: Password for user ${user.email} has been reset.`);
      // },
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

    advanced: {
      // cookies: {},
      // disableCSRFCheck: true,
      database: {
        generateId: false,
        useNumberId: true,
      },
    },
    ...options,
  });
}

export const auth = createAuth();
