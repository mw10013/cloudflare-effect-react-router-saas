import type { Repository } from "~/lib/repository";
import type { StripeService } from "~/lib/stripe-service";
import * as Hono from "hono";

/*
curl -X POST http://localhost:5173/api/e2e/delete/user/e2e@e2e.com | jq
curl -X POST http://localhost:5173/api/e2e/delete/user/e2e@e2e.com -w "\nStatus: %{http_code}\n"
curl -X POST http://localhost:5173/api/e2e/delete/user/a@a.com -w "\nStatus: %{http_code}\n"
*/

export function createE2eRoutes({
  repository,
  stripeService: { stripe },
}: {
  repository: Repository;
  stripeService: StripeService;
}) {
  const e2e = new Hono.Hono().basePath("/api/e2e");

  e2e.post("/delete/user/:email", async (c) => {
    const email = c.req.param("email");
    const user = await repository.getUser({ email });
    if (!user) {
      return c.json({
        success: true,
        message: `User ${email} already deleted.`,
      });
    }
    if (user.role === "admin") {
      return c.json(
        {
          success: false,
          message: `Cannot delete admin user ${email}.`,
        },
        403,
      );
    }
    const customers = await stripe.customers.list({
      email,
      expand: ["data.subscriptions"],
    });
    for (const customer of customers.data) {
      await stripe.customers.del(customer.id);
    }
    const deletedCount = await repository.deleteUser(user);
    return c.json({
      success: true,
      message: `Deleted user ${email} (deletedCount: ${deletedCount}).`,
      customers: customers.data,
    });
  });
  return e2e;
}
