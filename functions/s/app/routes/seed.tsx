import type { User } from "better-auth/types";
import type { AppLoadContext } from "react-router";
import type { Route } from "./+types/seed";
import { redirect, unstable_RouterContextProvider } from "react-router";
import { createAuth } from "~/lib/auth";
import { appLoadContext } from "~/lib/middleware";

async function createSeedContext(cloudflare: AppLoadContext["cloudflare"]) {
  let magicLinkToken: string;
  const auth = await createAuth({
    d1: cloudflare.env.D1,
    sendMagicLink: async ({ token }) => {
      magicLinkToken = token;
    },
    sendInvitationEmail: async () => {},
  });

  const context = async ({ headers }: { headers?: Headers } = {}) => {
    const session = headers
      ? ((await auth.api.getSession({ headers })) ?? undefined)
      : undefined;
    const context = new unstable_RouterContextProvider();
    context.set(appLoadContext, { cloudflare, auth, session });
    return context;
  };

  const sessionCookie = (response: Response) => {
    const setCookieHeader = response.headers.get("Set-Cookie")!;
    const match = setCookieHeader.match(/better-auth\.session_token=([^;]+)/);
    if (!match) throw new Error(`Missing session cookie: ${setCookieHeader}`);
    return `better-auth.session_token=${match[1]}`;
  };

  const createUser = async (email: User["email"]) => {
    const user = {
      email,
      headers: new Headers(),
      context: async () => context({ headers: user.headers }),
      session: async () => await auth.api.getSession({ headers: user.headers }),
    };
    const signInMagicLinkResponse = await auth.api.signInMagicLink({
      asResponse: true,
      headers: {},
      body: { email: user.email },
    });
    if (signInMagicLinkResponse.status !== 200)
      throw new Error("createUser: failed to signInMagicLink", {
        cause: signInMagicLinkResponse,
      });
    const magicLinkVerifyResponse = await auth.api.magicLinkVerify({
      asResponse: true,
      headers: {},
      query: {
        token: magicLinkToken,
        // No callbackURL's so response is not redirect and we can check for status 200
      },
    });
    if (magicLinkVerifyResponse.status !== 200)
      throw new Error("createUser: failed to verify magic link", {
        cause: magicLinkVerifyResponse,
      });
    user.headers.set("Cookie", sessionCookie(magicLinkVerifyResponse));
    return user;
  };

  return {
    auth,
    createUser,
    magicLinkToken: () => magicLinkToken,
  };
}

export async function loader({ context }: Route.ActionArgs) {
  const { cloudflare } = context.get(appLoadContext);
  const db = cloudflare.env.D1;
  const c = await createSeedContext(cloudflare);

  const u = await c.createUser("u@u.com");
  const u1 = await c.createUser("u1@u.com");
  const u2 = await c.createUser("u2@u.com");

  const response = await c.auth.api.createInvitation({
    asResponse: true,
    headers: u1.headers,
    body: {
      email: u.email,
      role: "member",
      organizationId: String(
        (await u1.session())?.session.activeOrganizationId!,
      ),
      resend: true,
    },
  });

  return {
    response: await response.text(),
    d1Result: await db.batch([
      db.prepare(`select * from Invitation`),
      db.prepare(`select * from Organization`),
      db.prepare(`select * from User`),
    ]),
  };
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Loader Data</h1>
      <pre>{JSON.stringify(loaderData, null, 2)}</pre>
    </div>
  );
}
