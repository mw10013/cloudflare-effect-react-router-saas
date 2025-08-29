import type { User } from "better-auth/types";
import type { AppLoadContext } from "react-router";
import type { Stripe as StripeType } from "stripe";
import type { Route } from "./+types/seed";
import { invariant } from "@epic-web/invariant";
import { unstable_RouterContextProvider } from "react-router";
import { createAuth } from "~/lib/auth";
import { appLoadContext } from "~/lib/middleware";

async function createSeedContext({
  cloudflare,
  stripe,
}: {
  cloudflare: AppLoadContext["cloudflare"];
  stripe: AppLoadContext["stripe"];
}) {
  const ensurePrice = async (
    lookup_key: string,
    unit_amount: number,
  ): Promise<StripeType.Price> => {
    const list = await stripe.stripe.prices.list({
      lookup_keys: [lookup_key],
      limit: 1,
    });
    if (list.data[0]) {
      return list.data[0];
    } else {
      const name = lookup_key.charAt(0).toUpperCase() + lookup_key.slice(1);
      const product = await stripe.stripe.products.create({
        name,
        description: `${name} subscription plan`,
      });
      return await stripe.stripe.prices.create({
        product: product.id,
        unit_amount,
        currency: "usd",
        recurring: {
          interval: "month",
          trial_period_days: 7,
        },
        lookup_key,
      });
    }
  };

  const magicLinkTokens = new Map<string, string>();
    const [basicPrice, proPrice] = await stripe.getPrices()
  const auth = await createAuth({
    d1: cloudflare.env.D1,
    stripeClient: stripe.stripe,
    sendMagicLink: async ({ email, token }) => {
      magicLinkTokens.set(email, token);
    },
    sendInvitationEmail: async () => {},
    basicPriceId: basicPrice.id,
    proPriceId: proPrice.id,
  });

  const context = async ({ headers }: { headers?: Headers } = {}) => {
    const session = headers
      ? ((await auth.api.getSession({ headers })) ?? undefined)
      : undefined;
    const context = new unstable_RouterContextProvider();
    context.set(appLoadContext, { cloudflare, auth, stripe, session });
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
    ensurePrice,
    auth,
    createUser,
  };
}

export async function loader({ context }: Route.ActionArgs) {
  const { cloudflare, stripe } = context.get(appLoadContext) as AppLoadContext;
  const c = await createSeedContext({ cloudflare, stripe });

  const [basicPrice, proPrice] = await Promise.all([
    c.ensurePrice("basic", 5000), // $50 in cents
    c.ensurePrice("pro", 10000),
  ]);

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

// resend: true is creating a duplicate invite instead of reusing the existing one: https://github.com/better-auth/better-auth/issues/3507
// const invitationExists =
//   (await db
//     .prepare(
//       "select 1 from Invitation where email = ? and organizationId = ? limit 1",
//     )
//     .bind(invitee.email, Number(organizationId))
//     .first()) !== null;
// if (invitationExists) continue;

// await c.auth.api.createInvitation({
//   headers: inviter.headers,
//   body: {
//     email: invitee.email,
//     role: "member",
//     organizationId,
//     resend: true,
//   },
// });
