"use client";

import type { RegistryItem } from "shadcn/schema";
import { lazy, Suspense } from "react";

interface ComponentLoaderProps {
  component: RegistryItem;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export default function ComponentLoader<TProps extends object>({
  component,
  ...props
}: ComponentLoaderProps & TProps) {
  if (!component.name) {
    return null;
  }

  // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
  const Component = lazy(
    () =>
      import(/* @vite-ignore */ `../registry/components/${component.name}.tsx`),
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component {...(props as TProps)} currentPage={1} totalPages={10} />
    </Suspense>
  );
}
