import type { Route } from "./+types/admin.users";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { auth } = context.get(appLoadContext);
  const result = await auth.api.listUsers({
    query: {},
    headers: request.headers,
  });
  return {
    users: result.users,
    total: result.total,
  };
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex min-h-screen flex-col p-8">
      <h1 className="text-2xl font-bold">Users</h1>
      <pre className="mt-4 w-full max-w-2xl overflow-x-auto rounded bg-gray-100 p-4 text-left">
        {JSON.stringify(loaderData?.users, null, 2)}
      </pre>
    </div>
  );
}
