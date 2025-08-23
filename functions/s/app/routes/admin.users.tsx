import type { Route } from "./+types/admin.users";
import { invariant } from "@epic-web/invariant";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ request, context }: Route.LoaderArgs) {
  const limit = 5;
  const { auth } = context.get(appLoadContext);
  const result = await auth.api.listUsers({
    query: {
      limit,
      sortBy: "email",
      sortDirection: "asc",
    },
    headers: request.headers,
  });
  invariant("limit" in result, "Expected 'limit' to be in result");
  return result;
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-8 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">Manage users.</p>
      </header>
      <pre>{JSON.stringify(loaderData, null, 2)}</pre>
    </div>
  );
}
