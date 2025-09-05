import type { Repository } from "~/lib/repository";
import * as Hono from "hono";
import { createStripeService } from "~/lib/stripe-service";

/*
curl -X POST http://localhost:5173/api/e2e/delete/user/e2e@e2e.com
*/

export function createE2eRoutes({
  repository,
  stripeService,
}: {
  repository: Repository;
  stripeService: ReturnType<typeof createStripeService>;
}) {
  const e2e = new Hono.Hono().basePath("/api/e2e");

  e2e.post("/delete/user/:email", async (c) => {
    const email = c.req.param("email");
    console.log(`E2E: Deleting user ${email}`);
    return c.json({ message: `User ${email} deletion logged` });
  });

  return e2e;
}
