import type { Route } from "./+types/_index";
import { appLoadContext } from "~/lib/middleware";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "r" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return {
    message: context.get(appLoadContext).cloudflare.env.VALUE_FROM_CLOUDFLARE,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <main className="p-8">{loaderData.message}</main>;
}
