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
import { redirect } from "react-router";
import * as z from "zod";
import { FormErrorAlert } from "~/components/FormAlert";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  return { token };
}

export async function action({ request, context }: Route.ActionArgs) {
  const schema = z.object({
    password: z.string().min(8),
    token: z.string().min(1),
  });
  const parseResult = schema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parseResult.success) {
    const { formErrors, fieldErrors: validationErrors } = z.flattenError(
      parseResult.error,
    );
    return { formErrors, validationErrors };
  }
  const { auth } = context.get(appLoadContext);
  const response = await auth.api.resetPassword({
    body: {
      token: parseResult.data.token,
      newPassword: parseResult.data.password,
    },
    asResponse: true,
  });
  if (!response.ok) throw response;
  return redirect("/", { headers: response.headers });
}

export default function RouteComponent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <Rac.Form
      method="post"
      validationBehavior="aria"
      validationErrors={actionData?.validationErrors}
      className="flex min-h-screen items-center justify-center"
    >
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormErrorAlert formErrors={actionData?.formErrors} />
          <input type="hidden" name="token" value={loaderData.token} />
          <Oui.TextFieldEx
            name="password"
            type="password"
            label="New password"
            placeholder="••••••••"
            isRequired
          />
        </CardContent>
        <CardFooter>
          <Oui.Button type="submit" className="w-full">
            Reset password
          </Oui.Button>
        </CardFooter>
      </Card>
    </Rac.Form>
  );
}
