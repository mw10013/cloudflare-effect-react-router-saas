import * as Rac from "react-aria-components";
import { twJoin, twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";
import { tw } from "./oui-base";

/**
 * Derived from shadcn Label and FormLabel
 */
export const baseLabelStyles = tw`flex select-none items-center gap-2 text-sm font-medium leading-none`;

/**
 * Label styles for RAC components that structure with a <label> and have render props. Eg. radio, checkbox and switch.
 * Derived from shadcn Label and FormLabel
 */
export const labelStyles = twJoin(
  baseLabelStyles,
  "data-[disabled]:opacity-50",
);

export function Label({ className, ...props }: Rac.LabelProps) {
  return (
    <Rac.Label
      data-slot="label"
      className={twMerge(
        baseLabelStyles,
        "group-data-[invalid]:text-destructive group-data-[disabled]:pointer-events-none group-data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
