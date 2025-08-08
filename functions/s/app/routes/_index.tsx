import type { Route } from "./+types/_index";
import * as Oui from "@workspace/oui";
import * as Rac from "react-aria-components";
import { appLoadContext } from "~/lib/middleware";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "r" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { auth } = context.get(appLoadContext);
  const session = await auth.api.getSession({ headers: request.headers });
  return { user: session?.user ?? null };
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return (
    <main className="p-8">
      {loaderData?.user ? (
        <div className="mb-6 flex justify-center">
          <Rac.Form method="post" action="/signout" className="w-full max-w-xs">
            <Oui.Button type="submit" className="w-full">
              Sign Out
            </Oui.Button>
          </Rac.Form>
        </div>
      ) : (
        <div className="mb-6 flex justify-center gap-4">
          <Oui.Link href="/signup" className={Oui.buttonClassName({})}>
            Sign Up
          </Oui.Link>
          <Oui.Link href="/signin" className={Oui.buttonClassName({})}>
            Sign In
          </Oui.Link>
        </div>
      )}
      <pre>{JSON.stringify(loaderData, null, 2)}</pre>
    </main>
  );
}
