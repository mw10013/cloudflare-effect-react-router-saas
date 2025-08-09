import type { Route } from "./+types/magic-link";
import { redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return { error };
  return redirect("/");
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  if (!loaderData?.error) return null;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Magic Link Error</h1>
      <p className="mt-4">{loaderData.error}</p>
      <p className="mt-4">
        Try{" "}
        <a href="/login" className="underline">
          signing in
        </a>{" "}
        again.
      </p>
    </div>
  );
}
