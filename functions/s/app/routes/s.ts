import type { Route } from "./+types/s";
import { redirect } from "react-router";
import { createAuth } from "~/lib/auth";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ request, context }: Route.ActionArgs) {
  const { cloudflare } = context.get(appLoadContext);
  let magicLinkToken: string;
  const auth = createAuth({
    d1: cloudflare.env.D1,
    sendMagicLink: async ({ token }) => {
      magicLinkToken = token;
    },
  });
  // const response = await auth.api.signOut({
  //   headers: request.headers,
  //   asResponse: true,
  // });
  // if (!response.ok) throw response;
  return redirect("/");
}
