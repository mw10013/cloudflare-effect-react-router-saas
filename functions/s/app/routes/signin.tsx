import type { Route } from "./+types/signin";
import * as Oui from "@workspace/oui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import { redirect } from "react-router";
import * as z from "zod";
import { FormErrorAlert } from "~/components/FormAlert";
import { appLoadContext } from "~/lib/middleware";

export async function action({ request, context }: Route.ActionArgs) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const parseResult = schema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parseResult.success) {
    const { formErrors, fieldErrors: validationErrors } = z.flattenError(
      parseResult.error,
    );
    return {
      formErrors,
      validationErrors,
    };
  }
  const { auth } = context.get(appLoadContext);
  const response = await auth.api.signInEmail({
    body: {
      email: parseResult.data.email,
      password: parseResult.data.password,
      callbackURL: "/email-verification", // http://localhost:3000/api/auth/verify-email?token=ey&callbackURL=/email-verification
    },
    asResponse: true,
  });
  // TODO: signin: handle 401: UNAUTHORIZED
  if (!response.ok) {
    if (response.status === 403) return redirect("/email-verification");
    throw response;
  }
  return redirect("/", { headers: response.headers });
}

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email and password to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Oui.Form
            method="post"
            validationBehavior="aria"
            validationErrors={actionData?.validationErrors}
          >
            <FormErrorAlert formErrors={actionData?.formErrors} />
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
              isRequired
              label={
                <div className="flex items-center">
                  <Oui.Label>Password</Oui.Label>
                  <Oui.Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm"
                    underline="hover"
                  >
                    Forgot your password?
                  </Oui.Link>
                </div>
              }
            />
            <Oui.Button type="submit" className="w-full">
              Sign in
            </Oui.Button>
          </Oui.Form>
        </CardContent>
      </Card>
    </div>
  );
}
