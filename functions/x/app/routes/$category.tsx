import { getComponentsByNames } from "@/lib/utils";
import type { Route } from "./+types/$category";
import { getCategory } from "@/config/components";
import ButtonDemo from "@/registry/components/button-demo";
import ButtonDisabledDemo from "@/registry/components/button-disabled-demo";
import { invariant } from "@epic-web/invariant";

export function loader({ params }: Route.LoaderArgs) {
  const category = getCategory(params.category);
  invariant(category, "Category not found");

  const components = getComponentsByNames(
    category.components.map((item) => item.name),
  );

  return { category, components };
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return (
    <div className="p-6">
      <ButtonDemo />
      <ButtonDisabledDemo />
      <pre>{JSON.stringify(loaderData.category, null, 2)}</pre>
    </div>
  );
}
