import type { Route } from "./+types/admin.users";
import { invariant } from "@epic-web/invariant";
import * as Oui from "@workspace/oui";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ request, context }: Route.LoaderArgs) {
  const limit = 5;
  const { auth } = context.get(appLoadContext);
  const result = await auth.api.listUsers({
    query: {
      limit,
      sortBy: "email",
      sortDirection: "asc",
    },
    headers: request.headers,
  });
  invariant("limit" in result, "Expected 'limit' to be in result");
  return result;
}

/*
loaderData:

"users": [
    {
      "name": "Admin",
      "email": "a@a.com",
      "emailVerified": true,
      "image": null,
      "createdAt": "2025-08-22T19:07:35.000Z",
      "updatedAt": "2025-08-22T19:07:35.000Z",
      "role": "admin",
      "banned": false,
      "banReason": null,
      "banExpires": null,
      "id": "1"
    },
    {
      "name": "",
      "email": "u1@u.com",
      "emailVerified": true,
      "image": null,
      "createdAt": "2025-08-22T15:16:21.542Z",
      "updatedAt": "2025-08-22T15:16:21.542Z",
      "role": "user",
      "banned": false,
      "banReason": null,
      "banExpires": null,
      "id": "3"
    },
  ],
  "total": 2,
  "limit": 5
*/

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-8 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">
          Manage your users and roles.
        </p>
      </header>

      <Oui.Table aria-label="Users">
        <Oui.TableHeader>
          <Oui.Column isRowHeader className="w-8">
            Id
          </Oui.Column>
          <Oui.Column>Email</Oui.Column>
          <Oui.Column>Role</Oui.Column>
          <Oui.Column>Verified</Oui.Column>
          <Oui.Column>Banned</Oui.Column>
          <Oui.Column>Ban Reason</Oui.Column>
          <Oui.Column>Created</Oui.Column>
        </Oui.TableHeader>
        <Oui.TableBody items={loaderData.users}>
          {(user) => (
            <Oui.Row id={user.id}>
              <Oui.Cell>{user.id}</Oui.Cell>
              <Oui.Cell>{user.email}</Oui.Cell>
              <Oui.Cell>{user.role}</Oui.Cell>
              <Oui.Cell>{String(user.emailVerified)}</Oui.Cell>
              <Oui.Cell>{String(user.banned)}</Oui.Cell>
              <Oui.Cell>{user.banReason ?? ""}</Oui.Cell>
              <Oui.Cell>{user.createdAt.toLocaleString()}</Oui.Cell>
            </Oui.Row>
          )}
        </Oui.TableBody>
      </Oui.Table>
    </div>
  );
}
