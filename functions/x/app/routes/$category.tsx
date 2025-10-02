import type { Route } from "./+types/$category";
import ComponentCard from "@/components/components-card";
import PageGrid from "@/components/page-grid";
import { getCategory } from "@/config/components";
import { getComponentsByNames } from "@/lib/utils";
import ButtonDemo from "@/registry/components/button-demo";
import ButtonDisabledDemo from "@/registry/components/button-demo-disabled";
import { invariant } from "@epic-web/invariant";

export function loader({ params }: Route.LoaderArgs) {
  const category = getCategory(params.category);
  invariant(category, "Category not found");

  const components = getComponentsByNames(
    category.components.map((item) => item.name),
  );

  return { category, components };
}

export default function RouteComponent({
  loaderData: { components },
}: Route.ComponentProps) {
  return (
    <div className="p-6">
      <PageGrid>
        {components.map((component) => (
          <ComponentCard key={component.name} component={component}>
            {component.name}
            {/* <ComponentLoader component={component} />
            <ComponentDetails component={component} /> */}
          </ComponentCard>
        ))}
      </PageGrid>
      <div className="flex gap-2">
        <ButtonDemo />
        <ButtonDisabledDemo />
      </div>
      <pre>{JSON.stringify({ components }, null, 2)}</pre>
    </div>
  );
}
