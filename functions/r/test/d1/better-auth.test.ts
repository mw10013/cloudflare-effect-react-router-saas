import { env } from "cloudflare:workers";
import { describe, expect, it, vi } from "vitest";
import { createAuth } from "~/lib/auth";

describe("better-auth sign-up flow", async () => {
  const email = "email@test.com";
  const password = "password";
  const name = "";
  const callbackURL = "/dashboard";
  const headers = new Headers();
  let emailVerificationUrl: string | undefined;
  const mockSendVerificationEmail = vi.fn().mockResolvedValue(undefined);

  const auth = createAuth({
    d1: env.D1,
    baseURL: "http://localhost:3000",
    secret: "better-auth.secret",
    emailVerification: {
      sendVerificationEmail: mockSendVerificationEmail,
    },
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
});
