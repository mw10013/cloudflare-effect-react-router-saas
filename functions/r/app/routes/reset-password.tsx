import type { Route } from "./+types/reset-password";
import * as Oui from "@workspace/oui";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import * as Rac from "react-aria-components";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  return { token };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const password = formData.get("password");
  const token = formData.get("token");
  if (typeof password !== "string" || typeof token !== "string") {
    throw new Error("Invalid form data");
  }
  const { auth } = context.get(appLoadContext);
  const response = await auth.api.resetPassword({
    body: { token, newPassword: password },
    asResponse: true,
  });
  if (!response.ok) throw response;
  // If autoSignIn is true, set cookie headers and redirect to dashboard
  const location = "/dashboard";
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      ...(response.headers.get("set-cookie")
        ? { "set-cookie": response.headers.get("set-cookie")! }
        : {}),
    },
  });
}

export default function RouteComponent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Rac.Form method="post" className="flex flex-col gap-6">
            <input type="hidden" name="token" value={loaderData.token} />
            <Oui.TextFieldEx
              name="password"
              type="password"
              label="New password"
              placeholder="••••••••"
              isRequired
            />
            <Oui.Button type="submit" className="w-full">
              Reset password
            </Oui.Button>
          </Rac.Form>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
}
