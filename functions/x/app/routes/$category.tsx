import type { Route } from "./+types/$category";
import ComponentLoader from "@/components/component-loader-server";
import ComponentCard from "@/components/components-card";
import PageGrid from "@/components/page-grid";
import { getCategory } from "@/config/components";
import { getComponentsByNames } from "@/lib/utils";
import { invariant } from "@epic-web/invariant";

export function loader({ params }: Route.LoaderArgs) {
  const category = getCategory(params.category);
  invariant(category, `Category not found: ${params.category}`);
  const components = getComponentsByNames(
    category.components.map((item) => item.name),
  );
  return { components };
}

export default function RouteComponent({
  loaderData: { components },
}: Route.ComponentProps) {
  return (
    <div className="p-6">
      <PageGrid>
        {components.map((component) => (
          <ComponentCard key={component.name} component={component}>
            <ComponentLoader component={component} />
          </ComponentCard>
        ))}
      </PageGrid>
      {/* <pre>{JSON.stringify({ components }, null, 2)}</pre> */}
    </div>
  );
}
