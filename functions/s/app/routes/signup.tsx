import type { Route } from "./+types/signup";
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
    email: z.email(),
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
  const response = await auth.api.signUpEmail({
    body: {
      email: parseResult.data.email,
      password: parseResult.data.password,
      name: "",
      callbackURL: "/email-verification", // http://localhost:3000/api/auth/verify-email?token=ey&callbackURL=/email-verification
    },
    asResponse: true,
  });

  if (!response.ok) {
    // better-auth returns 422 UNPROCESSABLE_ENTITY with { code: 'USER_ALREADY_EXISTS', ... } when an existing user tries to sign up again
    if (response.status === 422) return redirect("/signin");
    throw response;
  }
  // With email verification enabled, there is no session cookie set on sign up so no need to pass headers here.
  return redirect("/");
}

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign up for an account</CardTitle>
          <CardDescription>
            Enter your email and password to create your account
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
              label="Password"
              isRequired
            />
            <Oui.Button type="submit" className="w-full">
              Sign up
            </Oui.Button>
          </Oui.Form>
        </CardContent>
      </Card>
    </div>
  );
}
