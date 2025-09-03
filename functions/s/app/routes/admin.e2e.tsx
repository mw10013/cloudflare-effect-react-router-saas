import type { Route } from "./+types/admin.e2e";
import * as Oui from "@workspace/oui";
import * as Rac from "react-aria-components";
import * as z from "zod";
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
  // await repository.deleteUser(parseResult.data.email);
  return { deleted: true };
}

export default function RouteComponent({
  loaderData: { users },
  actionData,
}: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Rac.Form
        method="post"
        validationBehavior="aria"
        validationErrors={actionData?.validationErrors}
      >
        <Oui.TextFieldEx
          name="email"
          type="email"
          label="Email"
          placeholder="user@example.com"
          isRequired
        />
        <Oui.Button type="submit" name="intent" value="deleteUser">
          Delete User
        </Oui.Button>
      </Rac.Form>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
