import { BetterAuthOptions, User } from "better-auth/types";
import { env } from "cloudflare:workers";
import { unstable_RouterContextProvider } from "react-router";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createAuth } from "~/lib/auth";
import { appLoadContext } from "~/lib/middleware";
import { action as forgotPasswordAction } from "~/routes/forgot-password";
import { action as signInAction } from "~/routes/signin";
import { action as signOutAction } from "~/routes/signout";
import { action as signUpAction } from "~/routes/signup";
import { resetDb } from "../test-utils";

async function createTestContext<
  T extends Partial<BetterAuthOptions>,
>(config?: {
  betterAuthOptions?: T;
  skipTestUserCreation?: boolean;
  testUser?: Omit<Partial<User>, "image">;
}) {
  await resetDb();

  const mockSendVerificationEmail = vi.fn().mockResolvedValue(undefined);
  const mockSendResetPassword = vi.fn().mockResolvedValue(undefined);
  const auth = createAuth({
    d1: env.D1,
    baseURL: "http://localhost:3000",
    secret: "better-auth.secret",
    emailAndPassword: {
      enabled: true,
      sendResetPassword: mockSendResetPassword,
      ...config?.betterAuthOptions?.emailAndPassword,
    },
    emailVerification: {
      sendVerificationEmail: mockSendVerificationEmail,
      ...config?.betterAuthOptions?.emailVerification,
    },
  });
  const context = new unstable_RouterContextProvider();
  context.set(appLoadContext, { auth });

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
    console.log({ emailVerificationToken });
    mockSendVerificationEmail.mockReset();

    await auth.api.verifyEmail({
      query: { token: emailVerificationToken },
    });
  }
  return {
    auth,
    context,
    mockSendVerificationEmail,
    mockSendResetPassword,
    testUser,
  };
}

describe.skip("auth sign up flow", () => {
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

  it("should sign up", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    const request = new Request("http://localhost/signup", {
      method: "POST",
      body: form,
    });

    const response = await signUpAction({
      request,
      context: c.context,
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

  it("should not sign up when user already exists", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    const request = new Request("http://localhost/signup", {
      method: "POST",
      body: form,
    });

    const response = await signUpAction({
      request,
      context: c.context,
      params: {},
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/signin");
  });

  it("should not sign in with unverified email", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    const request = new Request("http://localhost/signup", {
      method: "POST",
      body: form,
    });

    await expect(
      signInAction({ request, context: c.context, params: {} }),
    ).rejects.toThrow(
      expect.objectContaining({
        status: 403,
      }),
    );

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

  it("should verify email", async () => {
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

  it("should have valid session", async () => {
    const session = await c.auth.api.getSession({ headers });

    expect(session).not.toBeNull();
    expect(session!.user?.email).toBe(email);
  });

  it("should sign out", async () => {
    const request = new Request("http://localhost/signout", {
      method: "POST",
      headers,
    });

    const response = await signOutAction({
      request,
      context: c.context,
      params: {},
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/");
    expect(response.headers.has("Set-Cookie")).toBe(true);
  });

  it("should not sign in with invalid password", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", "INVALID_PASSWORD");
    const request = new Request("http://localhost/signin", {
      method: "POST",
      body: form,
    });

    await expect(
      signInAction({ request, context: c.context, params: {} }),
    ).rejects.toThrow(
      expect.objectContaining({
        status: 401,
      }),
    );
  });

  it("should sign in with valid password", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    const request = new Request("http://localhost/signin", {
      method: "POST",
      body: form,
    });

    const response = await signInAction({
      request,
      context: c.context,
      params: {},
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/");
    expect(response.headers.has("Set-Cookie")).toBe(true);
  });
});

describe("auth forgot password flow", () => {
  let c: Awaited<ReturnType<typeof createTestContext>>;

  beforeAll(async () => {
    c = await createTestContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should send reset password email", async () => {
    const form = new FormData();
    form.append("email", c.testUser.email);
    const request = new Request("http://localhost/forgot-password", {
      method: "POST",
      body: form,
    });

    await forgotPasswordAction({ request, context: c.context, params: {} });

    expect(c.mockSendResetPassword).toHaveBeenCalledTimes(1);
    expect(c.mockSendResetPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({
          email: c.testUser.email,
        }),
      }),
      undefined,
    );
  });
});
