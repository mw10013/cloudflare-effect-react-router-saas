import { env } from "cloudflare:workers";
import { unstable_RouterContextProvider } from "react-router";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createAuth } from "~/lib/auth";
import { appLoadContext } from "~/lib/middleware";
import { action as signUpAction } from "~/routes/signup";
import { resetDb } from "../test-utils";

describe("auth sign-up flow", () => {
  const email = "email@test.com";
  const password = "password";
  const name = "";
  const callbackURL = "/dashboard";
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

  //   it("should not sign in with unverified email", async () => {
  //   const response = await auth.api.signInEmail({
  //     asResponse: true,
  //     body: { email, password, callbackURL },
  //   });
  //   expect(response.status).toBe(403);
  //   expect(((await response.json()) as any)?.code).toBe("EMAIL_NOT_VERIFIED");
  //   expect(mockSendVerificationEmail).toHaveBeenCalledTimes(2);
  // });
});
