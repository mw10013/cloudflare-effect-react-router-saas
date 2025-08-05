import type { Route } from "./+types/signin";
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
import { redirect } from "react-router";
import { appLoadContext } from "~/lib/middleware";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    throw new Error("Invalid form data");
  }
  const { auth } = context.get(appLoadContext);
  const response = await auth.api.signInEmail({
    body: {
      email,
      password,
      callbackURL: "/email-verification", // http://localhost:3000/api/auth/verify-email?token=ey&callbackURL=/email-verification
    },
    asResponse: true,
  });
  // TODO: signin: handle 403: EMAIL_NOT_VERIFIED
  if (!response.ok) return response;
  return redirect("/", { headers: response.headers });
}

export default function RouteComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email and password to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Rac.Form className="flex flex-col gap-6">
            <Oui.TextFieldEx
              name="email"
              type="email"
              label="Email"
              placeholder="m@example.com"
              isRequired
            />
            <Oui.TextFieldEx
              name="password"
              type="password"
              label="Password"
              isRequired
            />
            <Oui.Button type="submit" className="w-full">
              Sign in
            </Oui.Button>
          </Rac.Form>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
}
