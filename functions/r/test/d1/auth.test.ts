import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { action } from "~/routes/signup";
import { resetDb } from "../test-utils";

describe("auth sign-up flow", () => {
  beforeAll(async () => {
    await resetDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should sign up successfully", async () => {
    const mockSignUpEmail = vi.fn().mockResolvedValue({
      ok: true,
      headers: { location: "/" },
    });
    const auth = { api: { signUpEmail: mockSignUpEmail } };
    const context = {
      get: vi.fn().mockReturnValue({ auth }),
    };
    const request = {
      formData: vi.fn().mockResolvedValue({
        get: (key: string) =>
          ({ email: "test@example.com", password: "password123" })[key],
      }),
    };
    const result = await action({ request, context });
    expect(result).toBeDefined();
  });

  it("should redirect to /signin if user already exists (422)", async () => {
    const mockSignUpEmail = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      headers: {},
    });
    const auth = { api: { signUpEmail: mockSignUpEmail } };
    const context = {
      get: vi.fn().mockReturnValue({ auth }),
    };
    const request = {
      formData: vi.fn().mockResolvedValue({
        get: (key: string) =>
          ({ email: "existing@example.com", password: "password123" })[key],
      }),
    };
    const result = await action({ request, context });
    expect(result?.status).toBe(302);
    expect(result?.headers?.get?.("location")).toBe("/signin");
  });

  it("should throw error for invalid form data", async () => {
    const context = { get: vi.fn() };
    const request = {
      formData: vi.fn().mockResolvedValue({
        get: (key: string) => ({ email: 123, password: null })[key],
      }),
    };
    await expect(action({ request, context })).rejects.toThrow(
      "Invalid form data",
    );
  });
});
