import type { User } from "better-auth/types";
import type { AppLoadContext } from "react-router";
import type { Route } from "./+types/seed";
import { invariant } from "@epic-web/invariant";
import { magicLink } from "better-auth/plugins";
import { redirect, unstable_RouterContextProvider } from "react-router";
import { createAuth } from "~/lib/auth";
import { appLoadContext } from "~/lib/middleware";

async function createSeedContext(cloudflare: AppLoadContext["cloudflare"]) {
  const magicLinkTokens = new Map<string, string>();
  const auth = await createAuth({
    d1: cloudflare.env.D1,
    sendMagicLink: async ({ email, token }) => {
      magicLinkTokens.set(email, token);
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

  const sessionCookie = (headers: Headers) => {
    const setCookieHeader = headers.get("Set-Cookie")!;
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
    const token = magicLinkTokens.get(user.email);
    invariant(token, "Missing magic link token");
    console.log("createUser", { email, token });
    const magicLinkVerifyResponse = await auth.api.magicLinkVerify({
      asResponse: true,
      headers: {},
      query: {
        token,
        // No callbackURL's so response is not redirect and we can check for status 200
      },
    });
    if (magicLinkVerifyResponse.status !== 200)
      throw new Error("createUser: failed to verify magic link", {
        cause: magicLinkVerifyResponse,
      });
    user.headers.set("Cookie", sessionCookie(magicLinkVerifyResponse.headers));
    return user;
  };

  return {
    auth,
    createUser,
  };
}

export async function loader({ context }: Route.ActionArgs) {
  const { cloudflare } = context.get(appLoadContext);
  const db = cloudflare.env.D1;
  const c = await createSeedContext(cloudflare);

  const [u, u1, u2, u3, u4, u5] = await Promise.all(
    ["u@u.com", "u1@u.com", "u2@u.com", "u3@u.com", "u4@u.com", "u5@u.com"].map(
      (email) => c.createUser(email),
    ),
  );

  /*

      "results": [
        {
          "id": 1,
          "email": "u@u.com",
          "inviterId": 3,
          "organizationId": 2,
          "role": "member",
          "status": "canceled",
          "expiresAt": "2025-08-17T14:11:59.399Z"
        },
       */

  const [
    { results: invitations },
    { results: organizations },
    { results: users },
  ] = (await db.batch([
    db.prepare(`select * from Invitation`),
    db.prepare(`select * from Organization`),
    db.prepare(`select * from User`),
  ])) as [
    {
      results: { inviterId: number; organizationId: number; status: string }[];
    },
    any,
    any,
  ];

  // resend: true is creating a duplicate invite instead of reusing the existing one: https://github.com/better-auth/better-auth/issues/3507
  for (const [inviter, invitee] of [
    [u, u1],
    [u, u2],
    [u1, u],
    [u1, u2],
    [u2, u],
  ]) {
    const session = await inviter.session();
    if (session === null) throw new Error("Missing session for inviter");
    const organizationId = session.session.activeOrganizationId;
    if (typeof organizationId !== "string")
      throw new Error("Invalid organizationId");
    const invitationExists =
      (await db
        .prepare(
          "select 1 from Invitation where email = ? and organizationId = ? limit 1",
        )
        .bind(invitee.email, Number(organizationId))
        .first()) !== null;
    if (invitationExists) continue;

    await c.auth.api.createInvitation({
      headers: inviter.headers,
      body: {
        email: invitee.email,
        role: "member",
        organizationId,
        resend: true,
      },
    });
  }

  return {
    invitationCount: invitations.length,
    invitations,
    organizations,
    users,
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
