import type { Repository } from "~/lib/repository";
import type { StripeService } from "~/lib/stripe-service";
import * as Hono from "hono";

/*
curl -X POST http://localhost:5173/api/e2e/delete/user/e2e@e2e.com
*/

export function createE2eRoutes({
  repository,
  stripeService,
}: {
  repository: Repository;
  stripeService: StripeService;
}) {
  const e2e = new Hono.Hono().basePath("/api/e2e");

  e2e.post("/delete/user/:email", async (c) => {
    const email = c.req.param("email");
    console.log(`E2E: Deleting user ${email}`);

    const user = await repository.getUser({ email });
    if (!user) {
      return c.json({
        success: true,
        message: `User ${email} already deleted.`,
      });
    }
    if (user.role === "admin") {
      return c.json({
        success: false,
        message: `Cannot delete admin user ${email}.`,
      });
    }
    const deletedCount = await repository.deleteUser(user);
    return c.json({
      success: true,
      message: `Deleted user ${email} (deletedCount: ${deletedCount}).`,
    });
  });

  return e2e;
}
