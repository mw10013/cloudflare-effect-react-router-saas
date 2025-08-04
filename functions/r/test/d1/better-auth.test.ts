import { env } from "cloudflare:workers";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { createAuth } from "~/lib/auth";

describe("better-auth sign-up flow", async () => {
  const email = "email@test.com";
  const password = "password";
  const name = "";
  const callbackURL = "/dashboard";
  const headers = new Headers();
  let emailVerificationUrl: string | undefined;
  let mockSendVerificationEmail: ReturnType<typeof vi.fn>;
  let auth: ReturnType<typeof createAuth>;

  beforeAll(() => {
    mockSendVerificationEmail = vi.fn().mockResolvedValue(undefined);
    auth = createAuth({
      d1: env.D1,
      baseURL: "http://localhost:3000",
      secret: "better-auth.secret",
      emailVerification: {
        sendVerificationEmail: mockSendVerificationEmail,
      },
    });
  });

  it("should should sign up", async () => {
    const response = await auth.api.signUpEmail({
      asResponse: true,
      body: {
        email,
        password,
        name,
        callbackURL,
      },
    });
    expect(response.ok).toBe(true);
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
    const response = await auth.api.signUpEmail({
      asResponse: true,
      body: {
        email,
        password,
        name,
        callbackURL,
      },
    });
    expect(response.status).toBe(422);
    expect(((await response.json()) as any)?.code).toBe("USER_ALREADY_EXISTS");
  });

  it("should not sign in with unverified email", async () => {
    const response = await auth.api.signInEmail({
      asResponse: true,
      body: { email, password, callbackURL },
    });
    expect(response.status).toBe(403);
    expect(((await response.json()) as any)?.code).toBe("EMAIL_NOT_VERIFIED");
    expect(mockSendVerificationEmail).toHaveBeenCalledTimes(2);
  });

  it("should not verify email with invalid token", async () => {
    const request = new Request(
      "http://localhost:3000/api/auth/verify-email?token=INVALID_TOKEN&callbackURL=/dashboard",
    );
    const response = await auth.handler(request);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "/dashboard?error=invalid_token",
    );
  });

  it("should verify email", async () => {
    const request = new Request(emailVerificationUrl!);
    const response = await auth.handler(request);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(callbackURL);
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
    const response = await auth.api.signOut({
      headers,
      asResponse: true,
    });
    expect(response.ok).toBe(true);
    expect(response.headers.has("Set-Cookie")).toBe(true);
  });

  it("should not sign in with invalid password", async () => {
    const response = await auth.api.signInEmail({
      asResponse: true,
      body: { email, password: "INVALID_PASSWORD", callbackURL },
    });
    expect(response.status).toBe(401);
    expect(((await response.json()) as any)?.code).toBe(
      "INVALID_EMAIL_OR_PASSWORD",
    );
  });

  it("should sign in with valid password", async () => {
    const response = await auth.api.signInEmail({
      asResponse: true,
      body: { email, password, callbackURL },
    });
    expect(response.ok).toBe(true);
    expect(response.headers.has("Set-Cookie")).toBe(true);
  });
});
