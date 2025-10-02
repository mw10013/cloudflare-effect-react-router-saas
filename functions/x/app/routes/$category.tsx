import type { Route } from "./+types/$category";

export function loader({ params }: Route.LoaderArgs) {
  return { category: params.category };
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return <div>Category: {loaderData.category}</div>;
}
