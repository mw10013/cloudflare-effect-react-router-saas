import * as Rac from "react-aria-components";
import { composeTailwindRenderProps } from "./oui-base";

/**
 * Derived from shadcn Input
 */
export function Group({ className, ...props }: Rac.GroupProps) {
  return (
    <Rac.Group
      className={composeTailwindRenderProps(className, [
        "border-input inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border",
        "data-[focus-visible]:border-ring data-[focus-visible]:ring-ring/50 data-[focus-visible]:ring-[3px]",
        "data-[invalid]:ring-destructive/20 dark:data-[invalid]:ring-destructive/40 data-[invalid]:border-destructive",
      ])}
      {...props}
    />
  );
}
