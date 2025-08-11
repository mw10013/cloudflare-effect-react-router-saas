import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { admin, magicLink, organization } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import { d1Adapter } from "~/lib/d1-adapter";

type FullAuthOptions = BetterAuthOptions & {
  plugins: [
    ReturnType<typeof admin>,
    ReturnType<typeof organization>,
    ReturnType<typeof magicLink>,
  ];
};

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


export function createAuthOptions({
  d1,
  sendResetPassword,
  sendVerificationEmail,
  sendMagicLink,
}: CreateAuthOptions) {
  const options = {
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
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
    },
    advanced: { database: { generateId: false, useNumberId: true } },
    plugins: [
      admin(),
      organization({
        schema: {
          organization: { modelName: "Organization" },
          member: { modelName: "Member" },
          invitation: { modelName: "Invitation" },
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
  } satisfies FullAuthOptions;
  return options;
}

// export const auth = betterAuth(createAuthOptions({ d1: env.D1 }));
export const auth = betterAuth({
  database: d1Adapter(env.D1),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        console.log("sendMagicLink", { to: email, url, token });
      },
    }),
  ],
});
type A = typeof auth;
type AA = A["api"]["signInEmail"];
type AAA = A["api"]["signInMagicLink"];

export function createAuth(options: CreateAuthOptions) {
  const full = createAuthOptions(options);
  return betterAuth(full);
}

type T = ReturnType<typeof createAuth>;
type TT = T["api"]["signInEmail"];
// type TTT = T["api"]["signInMagicLink"];
