import type { Route } from "./+types/app._index";
import { redirect } from "react-router";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ context }: Route.LoaderArgs) {
  const { auth, session } = context.get(appLoadContext);
  if (!session || !session.session.activeOrganizationId)
    throw new Error("Missing session or active organization");
  return redirect(`/app/${session.session.activeOrganizationId}`);
  // return {
  //   fullOrganization: await auth.api.getFullOrganization({ headers: request.headers }),
  //   invitations: await auth.api.listUserInvitations({
  //     headers: request.headers,
  //     query: { email: session?.user.email },
  //   }),
  //   organizations: await auth.api.listOrganizations({
  //     headers: request.headers,
  //   }),
  //   session,
  // };
}

// export default function RouteComponent({ loaderData }: Route.ComponentProps) {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold">App</h1>
//       <pre>{JSON.stringify(loaderData, null, 2)}</pre>
//     </div>
//   );
// }
