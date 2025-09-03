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
        </Card>
        {actionData.magicLink && (
          <div className="mt-4">
            {/* <a> used to bypass react router routing and hit the api endpoint directly */}
            <a href={actionData.magicLink} className="block">
              {actionData.magicLink}
            </a>
          </div>
        )}
      </div>
    );
  }
  return (
    <Rac.Form
      method="post"
      validationBehavior="aria"
      validationErrors={actionData?.validationErrors}
      className="flex min-h-screen flex-col items-center justify-center"
    >
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in / Sign up</CardTitle>
          <CardDescription>
            Enter your email to receive a magic sign-in link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormErrorAlert formErrors={actionData?.formErrors} />
          <Oui.TextFieldEx
            name="email"
            type="email"
            label="Email"
            placeholder="m@example.com"
            isRequired
          />
        </CardContent>
        <CardFooter>
          <Oui.Button type="submit" className="w-full">
            Send magic link
          </Oui.Button>
        </CardFooter>
      </Card>
    </Rac.Form>
  );
}
