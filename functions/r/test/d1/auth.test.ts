import { sign } from "node:crypto";
import { env } from "cloudflare:workers";
import { unstable_RouterContextProvider } from "react-router";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createAuth } from "~/lib/auth";
import { appLoadContext } from "~/lib/middleware";
import { action as signInAction } from "~/routes/signin";
import { action as signOutAction } from "~/routes/signout";
import { action as signUpAction } from "~/routes/signup";
import { resetDb } from "../test-utils";

describe("auth sign-up flow", () => {
  const email = "email@test.com";
  const password = "password";
  const headers = new Headers();
  let emailVerificationUrl: string | undefined;
  let mockSendVerificationEmail: ReturnType<typeof vi.fn>;
  let auth: ReturnType<typeof createAuth>;
  let context: unstable_RouterContextProvider;

  beforeAll(async () => {
    await resetDb();
    mockSendVerificationEmail = vi.fn().mockResolvedValue(undefined);
    auth = createAuth({
      d1: env.D1,
      baseURL: "http://localhost:3000",
      secret: "better-auth.secret",
      emailVerification: {
        sendVerificationEmail: mockSendVerificationEmail,
      },
    });
    context = new unstable_RouterContextProvider();
    context.set(appLoadContext, { auth });
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

    const response = await signUpAction({ request, context, params: {} });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/");
    expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(mockSendVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({ email }),
      }),
      undefined,
    );
    emailVerificationUrl = mockSendVerificationEmail.mock.calls
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

    const response = await signUpAction({ request, context, params: {} });

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
      signInAction({ request, context, params: {} }),
    ).rejects.toThrow(
      expect.objectContaining({
        status: 403,
      }),
    );

    expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(mockSendVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({ email }),
      }),
      undefined,
    );
    emailVerificationUrl = mockSendVerificationEmail.mock.calls
      .at(0)
      ?.at(0)?.url;
    expect(emailVerificationUrl).toBeDefined();
  });

  it("should verify email", async () => {
    const request = new Request(emailVerificationUrl!);

    const response = await auth.handler(request);

    expect(response.status).toBe(302);
    expect(response.headers.has("Set-Cookie")).toBe(true);

    const setCookieHeader = response.headers.get("Set-Cookie")!;
    const match = setCookieHeader.match(/better-auth\.session_token=([^;]+)/);
    const sessionCookie = match ? `better-auth.session_token=${match[1]}` : "";
    expect(sessionCookie).not.toBe("");
    headers.set("Cookie", sessionCookie);
  });

  it("should have valid session", async () => {
    const session = await auth.api.getSession({ headers });

    expect(session).not.toBeNull();
    expect(session!.user?.email).toBe(email);
  });

  it("should sign out", async () => {
    const request = new Request("http://localhost/signout", {
      method: "POST",
      headers,
    });

    const response = await signOutAction({ request, context, params: {} });

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
      signInAction({ request, context, params: {} }),
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

    const response = await signInAction({ request, context, params: {} });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/");
    expect(response.headers.has("Set-Cookie")).toBe(true);
  });
});
