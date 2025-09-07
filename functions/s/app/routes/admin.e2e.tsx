import type { Route } from "./+types/admin.e2e";
import { useEffect, useRef } from "react";
import * as Oui from "@workspace/oui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
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
    const { formErrors: details, fieldErrors: validationErrors } =
      z.flattenError(parseResult.error);
    return { success: false, details, validationErrors };
  }
  switch (parseResult.data.intent) {
    case "deleteUser": {
      const { stripeService, repository } = context.get(appLoadContext);
      const d1 = context.get(appLoadContext).cloudflare.env.D1;
      const user = await repository.getUser({ email: parseResult.data.email });
      if (!user) {
        return {
          success: true,
          message: `User ${parseResult.data.email} not found.`,
        };
      }
      if (user.role === "admin") {
        return {
          success: false,
          message: `Cannot delete admin user ${parseResult.data.email}.`,
        };
      }
      const results = await d1.batch([
        d1
          .prepare(
            `
with t as (
  select m.organizationId
  from Member m
  where m.userId = ?1 and m.role = 'owner'
  and not exists (
    select 1 from Member m1
    where m1.organizationId = m.organizationId
    and m1.userId != ?1 and m1.role = 'owner'
  )
)
delete from Organization where organizationId in (select organizationId from t)
`,
          )
          .bind(user.userId),
        d1
          .prepare(
            `delete from User where userId = ? and role <> 'admin' returning *`,
          )
          .bind(user.userId),
      ]);
      const deletedCount = results[1].results.length;
      return {
        success: true,
        message: `Deleted user ${parseResult.data.email} (deletedCount: ${deletedCount}).`,
      };
    }
    //   default:
    //     void (parseResult.data satisfies never);
    //     throw new Error("Unexpected intent");
  }
}

function DeleteUserForm() {
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.data?.success) {
      formRef.current?.reset();
    }
  }, [fetcher.data]);

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
          ref={formRef}
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
