import type { RegistryItem } from "shadcn/schema";
import { lazy } from "react";
import registry from "../registry.json";

const componentMap = registry.items
  .filter((item) => item.type === "registry:component")
  .reduce<
    Record<string, React.LazyExoticComponent<React.ComponentType<unknown>>>
  >((map, item) => {
    const path = `../${item.files[0].path}`;
    map[item.name] = lazy(() => import(path));
    return map;
  }, {});

export default function ComponentLoader({
  component,
}: {
  component: RegistryItem;
}) {
  if (!component.name) {
    return null;
  }

  const Component = componentMap[component.name];

  if (!Component) {
    return null;
  }

  return <Component />;
}
