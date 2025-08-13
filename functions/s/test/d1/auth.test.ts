import { User } from "better-auth/types";
import { env } from "cloudflare:workers";
import { unstable_RouterContextProvider } from "react-router";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createAuth } from "~/lib/auth";
import { appLoadContext } from "~/lib/middleware";
import {
  action as acceptInvitationAction,
  loader as acceptInvitationLoader,
} from "~/routes/accept-invitation.$invitationId";
import { action as forgotPasswordAction } from "~/routes/forgot-password";
import { action as loginAction } from "~/routes/login";
import { action as resetPasswordAction } from "~/routes/reset-password";
import { action as signInAction } from "~/routes/signin";
import { action as signOutAction } from "~/routes/signout";
import { action as signUpAction } from "~/routes/signup";
import { resetDb } from "../test-utils";

async function createTestContext(config?: {
  skipTestUserCreation?: boolean;
  testUser?: Omit<Partial<User>, "image">;
}) {
  await resetDb();

  const mockSendResetPassword = vi.fn().mockResolvedValue(undefined);
  const mockSendVerificationEmail = vi.fn().mockResolvedValue(undefined);
  const mockAfterEmailVerification = vi.fn().mockResolvedValue(undefined);
  const mockSendMagicLink = vi.fn().mockResolvedValue(undefined);
  const mockSendInvitationEmail = vi.fn().mockResolvedValue(undefined);
  const auth = createAuth({
    d1: env.D1,
    sendResetPassword: mockSendResetPassword,
    sendVerificationEmail: mockSendVerificationEmail,
    afterEmailVerification: mockAfterEmailVerification,
    sendMagicLink: mockSendMagicLink,
    sendInvitationEmail: mockSendInvitationEmail,
  });
  const context = async ({ headers }: { headers?: Headers } = {}) => {
    const session = headers
      ? ((await auth.api.getSession({ headers })) ?? undefined)
      : undefined;
    const context = new unstable_RouterContextProvider();
    context.set(appLoadContext, { auth, session });
    return context;
  };

  const testUser = {
    email: "test@test.com",
    password: "test123456",
    name: "test user",
    ...config?.testUser,
  };

  if (!config?.skipTestUserCreation) {
    await auth.api.signUpEmail({
      body: testUser,
    });
    await auth.api.sendVerificationEmail({
      body: { email: testUser.email },
    });
    const emailVerificationToken =
      mockSendVerificationEmail.mock.calls[0][0].token;
    mockSendVerificationEmail.mockReset();

    await auth.api.verifyEmail({
      query: { token: emailVerificationToken },
    });
  }

  const bootstrapAdmin = {
    email: "a@a.com", // MUST align with admin bootstrap.
    password: "asdf1234",
  };
  return {
    db: env.D1,
    auth,
    context,
    mockSendVerificationEmail,
    mockSendResetPassword,
    mockSendMagicLink,
    mockSendInvitationEmail,
    testUser,
    bootstrapAdmin,
  };
}

describe.only("auth login flow", () => {
  const email = "email@test.com";
  const headers = new Headers();
  const inviteeEmail = "invitee@test.com";
  let magicLinkUrl: string | undefined;
  let invitationId: string | undefined;
  let c: Awaited<ReturnType<typeof createTestContext>>;

  beforeAll(async () => {
    c = await createTestContext({ skipTestUserCreation: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs in", async () => {
    const form = new FormData();
    form.append("email", email);
    const request = new Request("http://localhost/login", {
      method: "POST",
      body: form,
    });

    const result = await loginAction({
      request,
      context: await c.context(),
      params: {},
    });

    expect(result).toBeDefined();
    expect(c.mockSendMagicLink).toHaveBeenCalledTimes(1);
    magicLinkUrl = c.mockSendMagicLink.mock.calls[0][0].url;
  });

  it("signs in with magic link", async () => {
    expect(magicLinkUrl).toBeDefined();
    const request = new Request(magicLinkUrl!);

    const response = await c.auth.handler(request);

    expect(response.status).toBe(302);
    expect(response.headers.has("Set-Cookie")).toBe(true);

    const setCookieHeader = response.headers.get("Set-Cookie")!;
    const match = setCookieHeader.match(/better-auth\.session_token=([^;]+)/);
    const sessionCookie = match ? `better-auth.session_token=${match[1]}` : "";
    expect(sessionCookie).not.toBe("");
    headers.set("Cookie", sessionCookie);
  });

  it("has valid session", async () => {
    const session = await c.auth.api.getSession({ headers });

    expect(session).not.toBeNull();
    expect(session?.user?.email).toBe(email);
    expect(session?.session.activeOrganizationId).toBeDefined();
  });

  /*
 mockSendInvitationEmail: {
  id: '1',
  role: 'member',
  email: 'invitee@test.com',
  organization: {
    name: "Email@test.com's Organization",
    slug: 'email-test-com',
    logo: null,
    createdAt: 2025-08-13T17:59:20.917Z,
    metadata: null,
    id: '1'
  },
  inviter: {
    organizationId: '1',
    userId: '2',
    role: 'owner',
    createdAt: 2025-08-13T17:59:20.917Z,
    id: '1',
    user: {
      name: '',
      email: 'email@test.com',
      emailVerified: true,
      image: null,
      createdAt: 2025-08-13T17:59:20.914Z,
      updatedAt: 2025-08-13T17:59:20.914Z,
      role: 'user',
      banned: false,
      banReason: null,
      banExpires: null,
      id: '2'
    }
  },
  invitation: {
    organizationId: '1',
    email: 'invitee@test.com',
    role: 'member',
    status: 'pending',
    expiresAt: 2025-08-15T17:59:20.925Z,
    inviterId: '2',
    id: '1'
  }
}
*/

  it("creates invitation", async () => {
    const session = await c.auth.api.getSession({ headers });
    expect(session).not.toBeNull();
    expect(session?.session.activeOrganizationId).toBeDefined();

    const response = await c.auth.api.createInvitation({
      body: {
        email: inviteeEmail,
        role: "member",
        organizationId: String(session!.session.activeOrganizationId!),
        resend: true,
      },
      asResponse: true,
      headers,
    });

    // console.log("mockSendInvitationEmail:", c.mockSendInvitationEmail.mock.calls[0][0]);
    expect(c.mockSendInvitationEmail).toHaveBeenCalledTimes(1);
    invitationId = c.mockSendInvitationEmail.mock.calls[0][0].invitation.id;
    expect(invitationId).toBeDefined();
    expect(response.status).toBe(200);
  });

  it("detects unauthenticated user trying to accept invitation", async () => {
    const result = await acceptInvitationLoader({
      context: await c.context(),
      params: { invitationId },
    });

    expect(result.needsAuth).toBe(true);
  });

  it("logs in with invitee email", async () => {
    const form = new FormData();
    form.append("email", inviteeEmail);
    const request = new Request("http://localhost/login", {
      method: "POST",
      body: form,
    });

    const result = await loginAction({ request, context: await c.context() });

    expect(result).toBeDefined();
    expect(c.mockSendMagicLink).toHaveBeenCalledTimes(1);
    magicLinkUrl = c.mockSendMagicLink.mock.calls[0][0].url;
  });

  it("signs invitee in with magic link", async () => {
    expect(magicLinkUrl).toBeDefined();
    const request = new Request(magicLinkUrl!);

    const response = await c.auth.handler(request);

    expect(response.status).toBe(302);
    expect(response.headers.has("Set-Cookie")).toBe(true);

    const setCookieHeader = response.headers.get("Set-Cookie")!;
    const match = setCookieHeader.match(/better-auth\.session_token=([^;]+)/);
    const sessionCookie = match ? `better-auth.session_token=${match[1]}` : "";
    expect(sessionCookie).not.toBe("");
    headers.set("Cookie", sessionCookie);
  });

  it("detects authenticated user trying to accept invitation", async () => {
    const result = await acceptInvitationLoader({
      context: await c.context({ headers }),
      params: { invitationId },
    });

    expect(result.needsAuth).toBe(false);
  });

  it("accepts invitation", async () => {
    const form = new FormData();
    form.append("intent", "accept");
    const request = new Request("http://localhost/accept-invitation", {
      method: "POST",
      body: form,
      headers,
    });

    const response = await acceptInvitationAction({
      request,
      context: await c.context({ headers }),
      params: { invitationId },
    });

    expect(response).toBeInstanceOf(Response);
    if (response instanceof Response) {
      expect(response.status).toBe(302);
    }
  });
});

describe("auth sign up flow", () => {
  const email = "email@test.com";
  const password = "password";
  const headers = new Headers();
  let emailVerificationUrl: string | undefined;
  let c: Awaited<ReturnType<typeof createTestContext>>;

  beforeAll(async () => {
    c = await createTestContext({ skipTestUserCreation: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("signs up", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    const request = new Request("http://localhost/signup", {
      method: "POST",
      body: form,
    });

    const response = await signUpAction({
      request,
      context: await c.context(),
      params: {},
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/");
    expect(c.mockSendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(c.mockSendVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({ email }),
      }),
      undefined,
    );
    emailVerificationUrl = c.mockSendVerificationEmail.mock.calls
      .at(0)
      ?.at(0)?.url;
    expect(emailVerificationUrl).toBeDefined();
  });

  it("does not sign up when user already exists", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    const request = new Request("http://localhost/signup", {
      method: "POST",
      body: form,
    });

    const response = await signUpAction({
      request,
      context: await c.context(),
      params: {},
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/signin");
  });

  it("does not sign in with unverified email", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    const request = new Request("http://localhost/signup", {
      method: "POST",
      body: form,
    });

    const response = await signInAction({
      request,
      context: await c.context(),
      params: {},
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/email-verification");
    expect(c.mockSendVerificationEmail).toHaveBeenCalledTimes(1);
    emailVerificationUrl = c.mockSendVerificationEmail.mock.calls[0][0].url;
    expect(emailVerificationUrl).toBeDefined();
  });

  it("verifies email", async () => {
    expect(emailVerificationUrl).toBeDefined();
    const request = new Request(emailVerificationUrl!);

    const response = await c.auth.handler(request);

    expect(response.status).toBe(302);
    expect(response.headers.has("Set-Cookie")).toBe(true);

    const setCookieHeader = response.headers.get("Set-Cookie")!;
    const match = setCookieHeader.match(/better-auth\.session_token=([^;]+)/);
    const sessionCookie = match ? `better-auth.session_token=${match[1]}` : "";
    expect(sessionCookie).not.toBe("");
    headers.set("Cookie", sessionCookie);
  });

  it("has valid session", async () => {
    const session = await c.auth.api.getSession({ headers });

    expect(session).not.toBeNull();
    expect(session!.user?.email).toBe(email);
  });

  it("signs out", async () => {
    const request = new Request("http://localhost/signout", {
      method: "POST",
      headers,
    });

    const response = await signOutAction({
      request,
      context: await c.context(),
      params: {},
    });

    expect(response.status).toBe(302);
    expect(response.headers.has("Set-Cookie")).toBe(true);
  });

  it("does not sign in with invalid password", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", "INVALID_PASSWORD");
    const request = new Request("http://localhost/signin", {
      method: "POST",
      body: form,
    });

    await expect(
      signInAction({ request, context: await c.context(), params: {} }),
    ).rejects.toThrow(
      expect.objectContaining({
        status: 401,
      }),
    );
  });

  it("signs in with valid password", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    const request = new Request("http://localhost/signin", {
      method: "POST",
      body: form,
    });

    const response = await signInAction({
      request,
      context: await c.context(),
      params: {},
    });

    expect(response.status).toBe(302);
    expect(response.headers.has("Set-Cookie")).toBe(true);
  });
});

describe("auth forgot password flow", () => {
  const newPassword = "newpass123456";
  let resetPasswordUrl: string | undefined;
  let resetToken: string | undefined;
  let c: Awaited<ReturnType<typeof createTestContext>>;

  beforeAll(async () => {
    c = await createTestContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends reset password email", async () => {
    const form = new FormData();
    form.append("email", c.testUser.email);
    const request = new Request("http://localhost/forgot-password", {
      method: "POST",
      body: form,
    });

    await forgotPasswordAction({
      request,
      context: await c.context(),
      params: {},
    });

    expect(c.mockSendResetPassword).toHaveBeenCalledTimes(1);
    resetPasswordUrl = c.mockSendResetPassword.mock.calls[0][0].url;
    expect(resetPasswordUrl).toBeDefined();
    resetToken = c.mockSendResetPassword.mock.calls[0][0].token;
    expect(resetToken).toBeDefined();
  });

  it("allows reset password", async () => {
    expect(resetPasswordUrl).toBeDefined();
    const request = new Request(resetPasswordUrl!);

    const response = await c.auth.handler(request);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")?.includes("/reset-password")).toBe(
      true,
    );
  });

  it("resets password", async () => {
    const form = new FormData();
    form.append("password", newPassword);
    expect(resetToken).toBeDefined();
    form.append("token", resetToken!);
    const request = new Request("http://localhost/reset-password", {
      method: "POST",
      body: form,
    });

    const response = await resetPasswordAction({
      request,
      context: await c.context(),
      params: {},
    });

    expect(response.status).toBe(302);
  });

  it("signs in with new password", async () => {
    const form = new FormData();
    form.append("email", c.testUser.email);
    form.append("password", newPassword);
    const request = new Request("http://localhost/signin", {
      method: "POST",
      body: form,
    });

    const response = await signInAction({
      request,
      context: await c.context(),
      params: {},
    });

    expect(response.status).toBe(302);
  });
});

describe("admin bootstrap", () => {
  let c: Awaited<ReturnType<typeof createTestContext>>;
  let magicLinkUrl: string | undefined;

  beforeAll(async () => {
    c = await createTestContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not log with empty password", async () => {
    const form = new FormData();
    form.append("email", c.bootstrapAdmin.email);
    form.append("password", "");
    const request = new Request("http://localhost/signin", {
      method: "POST",
      body: form,
    });

    await expect(
      signInAction({ request, context: await c.context(), params: {} }),
    ).rejects.toThrow();
  });

  it("logs in with email", async () => {
    const form = new FormData();
    form.append("email", c.bootstrapAdmin.email);
    const request = new Request("http://localhost/login", {
      method: "POST",
      body: form,
    });

    await loginAction({
      request,
      context: await c.context(),
      params: {},
    });
    expect(c.mockSendMagicLink).toHaveBeenCalledTimes(1);
    magicLinkUrl = c.mockSendMagicLink.mock.calls[0][0].url;
  });

  it("signs in with magic link", async () => {
    expect(magicLinkUrl).toBeDefined();
    const request = new Request(magicLinkUrl!);

    const response = await c.auth.handler(request);

    expect(response.status).toBe(302);
    expect(response.headers.has("Set-Cookie")).toBe(true);
  });
});
