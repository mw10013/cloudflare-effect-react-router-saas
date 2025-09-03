import type { Route } from "./+types/admin.e2e";
import * as Oui from "@workspace/oui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import * as Rac from "react-aria-components";
import { useFetcher } from "react-router";
import * as z from "zod";
import { FormErrorAlert } from "~/components/FormAlert";
import * as Domain from "~/lib/domain";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ context }: Route.LoaderArgs) {
  const { repository } = context.get(appLoadContext);
  const users = await repository.getUsers();
  return { users };
}

export async function action({ request, context }: Route.ActionArgs) {
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
    return { formErrors, validationErrors };
  }
  const { repository } = context.get(appLoadContext);
  const deletedCount = await repository.deleteUser({
    email: parseResult.data.email,
  });
  return { success: true, intent: parseResult.data.intent, deletedCount } as const;
}

function DeleteUserForm() {
  const fetcher = useFetcher();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetcher.submit(e.currentTarget, { method: "post" });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete User</CardTitle>
        <CardDescription>
          Enter the email of the user to delete.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Rac.Form
          method="post"
          validationBehavior="aria"
          validationErrors={fetcher.data?.validationErrors}
          onSubmit={onSubmit}
          className="flex flex-col gap-6"
        >
          <FormErrorAlert formErrors={fetcher.data?.formErrors} />
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
        </Rac.Form>
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
