import type { User } from "better-auth/types";
import type { AppLoadContext } from "react-router";
import type { Route } from "./+types/seed";
import { invariant } from "@epic-web/invariant";
import { unstable_RouterContextProvider } from "react-router";
import { createAuth } from "~/lib/auth";
import { appLoadContext } from "~/lib/middleware";
import { createRepository } from "~/lib/repository";

async function createSeedContext({
  cloudflare,
  stripeService,
}: {
  cloudflare: AppLoadContext["cloudflare"];
  stripeService: AppLoadContext["stripeService"];
}) {
  const magicLinkTokens = new Map<string, string>();
  const auth = await createAuth({
    d1: cloudflare.env.D1,
    stripeService,
    ses: {
      async sendEmail() {},
    },
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
    context.set(appLoadContext, {
      cloudflare,
      repository: createRepository(),
      auth,
      stripeService: stripeService,
      session,
    });
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
  const { cloudflare, stripeService: stripe } = context.get(
    appLoadContext,
  ) as AppLoadContext;
  const c = await createSeedContext({ cloudflare, stripeService: stripe });

  await stripe.ensureBillingPortalConfiguration();

  const [u, v, w, x, y, z] = await Promise.all(
    ["u@u.com", "v@v.com", "w@w.com", "x@x.com", "y@y.com", "z@z.com"].map(
      (email) => c.createUser(email),
    ),
  );

  for (const [owner, users] of [
    [
      u,
      [
        { user: v, role: "member", add: true },
        { user: w, role: "member", add: true },
        { user: x, role: "member", add: false },
        { user: y, role: "member", add: false },
        { user: z, role: "member", add: false },
      ],
    ],
    [
      v,
      [
        { user: u, role: "member", add: true },
        { user: w, role: "member", add: true },
        { user: x, role: "member", add: false },
        { user: y, role: "member", add: false },
        { user: z, role: "member", add: false },
      ],
    ],
    [
      w,
      [
        { user: u, role: "member", add: true },
        { user: v, role: "member", add: true },
        { user: x, role: "member", add: false },
        { user: y, role: "member", add: false },
        { user: z, role: "member", add: false },
      ],
    ],
    [
      x,
      [
        { user: u, role: "member", add: true },
        { user: v, role: "member", add: true },
        { user: w, role: "member", add: false },
        { user: y, role: "member", add: false },
        { user: z, role: "member", add: false },
      ],
    ],
    [
      y,
      [
        { user: u, role: "member", add: false },
        { user: v, role: "member", add: false },
        { user: w, role: "member", add: false },
        { user: x, role: "member", add: false },
        { user: z, role: "member", add: false },
      ],
    ],
    [
      z,
      [
        { user: u, role: "member", add: false },
        { user: v, role: "member", add: false },
        { user: w, role: "member", add: false },
        { user: x, role: "member", add: false },
        { user: z, role: "member", add: false },
      ],
    ],
  ] as const) {
    const session = await owner.session();
    invariant(session, "Missing session");
    const organizationId = session.session.activeOrganizationId;
    invariant(organizationId, "Missing active organization");
    const fullOrganization = await c.auth.api.getFullOrganization({
      headers: owner.headers,
      query: { organizationId },
    });
    invariant(fullOrganization, "Missing full organization");

    for (const { user, role, add } of users) {
      if (fullOrganization.members.some((m) => m.user.email === user.email))
        continue;
      if (
        fullOrganization.invitations.some(
          (i) =>
            i.email === user.email &&
            ["pending", "accepted", "rejected"].includes(i.status),
        )
      )
        continue;
      if (add) {
        const session = await user.session();
        invariant(session, "Missing session");
        await c.auth.api.addMember({
          headers: owner.headers,
          body: {
            userId: session.user.id,
            role,
            organizationId,
          },
        });
      } else {
        await c.auth.api.createInvitation({
          headers: owner.headers,
          body: {
            email: user.email,
            role,
            organizationId,
            resend: true,
          },
        });
      }
    }
  }

  const db = cloudflare.env.D1;
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
