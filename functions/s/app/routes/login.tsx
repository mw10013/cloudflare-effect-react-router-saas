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
import * as z from "zod";
import { FormErrorAlert } from "~/components/FormAlert";
import { appLoadContext } from "~/lib/middleware";

export async function action({ request, context }: Route.ActionArgs) {
  const schema = z.object({
    email: z.email(),
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
  const {
    auth,
    cloudflare: { env },
  } = context.get(appLoadContext);
  await auth.api.signInMagicLink({
    headers: request.headers,
    body: { email: parseResult.data.email, callbackURL: "/magic-link" },
  });
  const magicLink =
    env.ENVIRONMENT === "local"
      ? await env.KV.get(`local:magicLink`)
      : undefined;
  console.log("magicLink", magicLink);

  return { magicLinkSent: true, magicLink };
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
          {actionData.magicLink && (
            <CardContent>
              <CardDescription>
                Your magic link is ready:
                <Oui.Link
                  href={actionData.magicLink}
                  className="block mt-2 break-all font-medium text-primary hover:opacity-90"
                >
                  {actionData.magicLink}
                </Oui.Link>
              </CardDescription>
            </CardContent>
          )}
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
          <Rac.Form
            method="post"
            validationBehavior="aria"
            validationErrors={actionData?.validationErrors}
            className="flex flex-col gap-6"
          >
            <FormErrorAlert formErrors={actionData?.formErrors} />
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
