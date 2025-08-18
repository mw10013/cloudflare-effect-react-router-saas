import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { focusVisibleStyles } from "./oui-base";

/** Derived from shadcn Input. */
export const inputVariants = cva(
  [
    "placeholder:text-muted-foreground dark:bg-input/30 flex h-9 w-full min-w-0 bg-transparent px-3 py-1 text-base outline-none transition-[color,box-shadow] md:text-sm",
    "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "selection:bg-primary selection:text-primary-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: [
          focusVisibleStyles,
          "border-input shadow-xs rounded-md border",
          "data-[invalid]:border-destructive data-[invalid]:ring-destructive/20 dark:data-[invalid]:ring-destructive/40",
        ],
        ghost: "flex-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface InputProps
  extends Rac.InputProps,
    VariantProps<typeof inputVariants> {}

export function Input({ variant, className, ...props }: InputProps) {
  return (
    <Rac.Input
      data-slot="input"
      className={Rac.composeRenderProps(className, (className, renderProps) =>
        twMerge(
          inputVariants({
            variant,
            ...renderProps,
            className,
          }),
        ),
      )}
      {...props}
    />
  );
}
