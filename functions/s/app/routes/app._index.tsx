import type { Route } from "./+types/app._index";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { auth } = context.get(appLoadContext);
  const session = await auth.api.getSession({ headers: request.headers });
  return {
    sessionUser: session?.user,
  };
}

export default function RouteComponent(props: Route.ComponentProps) {
  const { loaderData } = props;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">App</h1>
      <pre>{JSON.stringify(loaderData, null, 2)}</pre>
    </div>
  );
}
