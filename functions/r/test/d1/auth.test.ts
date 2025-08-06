import { BetterAuthOptions } from "better-auth/types";
import { env } from "cloudflare:workers";
import { unstable_RouterContextProvider } from "react-router";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createAuth } from "~/lib/auth";
import { appLoadContext } from "~/lib/middleware";
import { action as signInAction } from "~/routes/signin";
import { action as signOutAction } from "~/routes/signout";
import { action as signUpAction } from "~/routes/signup";
import { resetDb } from "../test-utils";

async function createTestContext<T extends Partial<BetterAuthOptions>>({
  betterAuthOptions,
}: {
  betterAuthOptions?: T;
} = {}) {
  await resetDb();

  const mockSendVerificationEmail = vi.fn().mockResolvedValue(undefined);
  const auth = createAuth({
    d1: env.D1,
    baseURL: "http://localhost:3000",
    secret: "better-auth.secret",
    emailVerification: {
      sendVerificationEmail: mockSendVerificationEmail,
      ...betterAuthOptions,
    },
  });
  const context = new unstable_RouterContextProvider();
  context.set(appLoadContext, { auth });

  return { auth, context, mockSendVerificationEmail };
}

describe("auth sign up flow", () => {
  const email = "email@test.com";
  const password = "password";
  const headers = new Headers();
  let emailVerificationUrl: string | undefined;
  let c: Awaited<ReturnType<typeof createTestContext>>;

  beforeAll(async () => {
    c = await createTestContext();
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

  // describe("auth forgot password flow", () => {
  //   const email = "forgot@test.com";
  //   const password = "password";
  //   let mockSendResetPassword: ReturnType<typeof vi.fn>;
  //   let auth: ReturnType<typeof createAuth>;
  //   let context: unstable_RouterContextProvider;

  //   beforeAll(async () => {
  //     // TODO: resetDb() if needed
  //     mockSendResetPassword = vi.fn().mockResolvedValue(undefined);
  //     auth = createAuth({
  //       d1: env.D1,
  //       baseURL: "http://localhost:3000",
  //       secret: "better-auth.secret",
  //       emailAndPassword: {
  //         enabled: true,
  //         sendResetPassword: mockSendResetPassword,
  //       },
  //     });
  //     context = new unstable_RouterContextProvider();
  //     context.set(appLoadContext, { auth });

  //     // TODO: Create user with emailVerified: true
  //     // You must create a user with emailVerified: true for forgot password flow.
  //     // Should this be done via direct DB/adapter, or is there a preferred API method?
  //     // If you want direct DB, use ctx.adapter.create({ model: "user", data: { email, emailVerified: true, ... } })
  //     // and also create an account record for the password.
  //   });

  //   afterEach(() => {
  //     vi.restoreAllMocks();
  //   });

  //   // TODO: Add tests for forgot password flow
  // });
});
