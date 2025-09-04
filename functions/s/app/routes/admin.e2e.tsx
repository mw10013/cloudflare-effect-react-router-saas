import type { Route } from "./+types/admin.e2e";
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
import { useFetcher } from "react-router";
import * as z from "zod";
import { FormAlert } from "~/components/FormAlert";
import * as Domain from "~/lib/domain";
import { appLoadContext } from "~/lib/middleware";
import * as TechnicalDomain from "~/lib/technical-domain";

export async function loader({ context }: Route.LoaderArgs) {
  const { repository } = context.get(appLoadContext);
  const users = await repository.getUsers();
  return { users };
}

export async function action({
  request,
  context,
}: Route.ActionArgs): Promise<TechnicalDomain.FormActionResult> {
  const schema = z.object({
    intent: z.literal("deleteUser"),
    email: Domain.User.shape.email,
  });
  const parseResult = schema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parseResult.success) {
    const { formErrors, fieldErrors: validationErrors } = z.flattenError(
      parseResult.error,
    );
    return { success: false, details: formErrors, validationErrors };
  }
  const { repository } = context.get(appLoadContext);
  const deletedCount = await repository.deleteUser({
    email: parseResult.data.email,
  });
  return {
    success: false,
    message: `Deleted user ${parseResult.data.email} (deletedCount: ${deletedCount})`,
  };
}

function DeleteUserForm() {
  const fetcher = useFetcher();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete User</CardTitle>
        <CardDescription>
          Enter the email of the user to delete.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Oui.Form
          method="post"
          validationBehavior="aria"
          validationErrors={fetcher.data?.validationErrors}
          onSubmit={TechnicalDomain.onSubmit(fetcher.submit)}
        >
          <FormAlert
            success={fetcher.data?.success}
            message={fetcher.data?.message}
            details={fetcher.data?.details}
          />
          <Oui.TextFieldEx
            name="email"
            type="email"
            label="Email"
            placeholder="user@example.com"
            isRequired
          />
          <Oui.Button
            type="submit"
            name="intent"
            value="deleteUser"
            variant="destructive"
            className="self-end"
          >
            Delete User
          </Oui.Button>
        </Oui.Form>
      </CardContent>
    </Card>
  );
}

export default function RouteComponent({
  loaderData: { users },
}: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <DeleteUserForm />
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
