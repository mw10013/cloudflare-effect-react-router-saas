import type { Route } from "./+types/email-verification";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return { error };
  const { auth } = context.get(appLoadContext);
  const session = await auth.api.getSession({ headers: request.headers });
  if (session && session.user.emailVerified === true) {
    return { verified: true };
  }
  return { verified: false };
}

export default function RouteComponent(props: Route.ComponentProps) {
  const { loaderData } = props;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Email Verification</h1>
      {loaderData?.error ? (
        <>
          <p className="mt-4">{loaderData.error}</p>
          <p className="mt-4">
            Try{" "}
            <a href="/signin" className="underline">
              signing in
            </a>{" "}
            to kick off email verification.
          </p>
        </>
      ) : loaderData?.verified ? (
        <p className="mt-4">
          Your email has been verified. You may now continue.
        </p>
      ) : (
        <p className="mt-4">Please check your email to verify your account.</p>
      )}
    </div>
  );
}
