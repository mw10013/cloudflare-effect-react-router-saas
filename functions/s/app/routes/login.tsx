import type { Route } from "./+types/login";
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

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  if (typeof email !== "string") {
    throw new Error("Invalid form data");
  }
  const { auth } = context.get(appLoadContext);
  const response = await auth.api.signInMagicLink({
    asResponse: true,
    headers: request.headers,
    body: { email, callbackURL: "/magic-link" },
  });
  if (!response.ok) throw response;
  return { magicLinkSent: response.ok };
}

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  if (actionData?.magicLinkSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              If an account exists for that email, a magic sign-in link has been
              sent.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in / Sign up</CardTitle>
          <CardDescription>
            Enter your email to receive a magic sign-in link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Rac.Form method="post" className="flex flex-col gap-6">
            <Oui.TextFieldEx
              name="email"
              type="email"
              label="Email"
              placeholder="m@example.com"
              isRequired
            />
            <Oui.Button type="submit" className="w-full">
              Send magic link
            </Oui.Button>
          </Rac.Form>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
}
