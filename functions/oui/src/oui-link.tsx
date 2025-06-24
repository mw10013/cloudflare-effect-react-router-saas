import type { VariantProps } from "tailwind-variants";
import * as Rac from "react-aria-components";
import { tv } from "tailwind-variants";
import { disabledStyles, focusVisibleStyles } from "./oui-base";
import { buttonStyles } from "./oui-button";

/**
 * Derived from shadcn CardDemo.
 */
export const linkStyles = tv({
  base: [focusVisibleStyles, disabledStyles, "underline-offset-4"],
  variants: {
    underline: {
      none: "no-underline",
      hover: "data-[hovered]:underline",
      always: "underline",
      current: "data-[current]:underline",
      focus: "data-[focused]:underline",
    },
  },
  defaultVariants: {
    underline: "none",
  },
});

interface LinkProps extends Rac.LinkProps, VariantProps<typeof linkStyles> {}

export function Link({ className, underline, ...props }: LinkProps) {
  return (
    <Rac.Link
      {...props}
      className={Rac.composeRenderProps(className, (className, renderProps) =>
        linkStyles({ ...renderProps, underline, className }),
      )}
    />
  );
}

export interface LinkButtonProps
  extends Rac.LinkProps,
    VariantProps<typeof buttonStyles> {}

export function LinkButton({
  className,
  variant,
  size,
  ...props
}: LinkButtonProps) {
  return (
    <Rac.Link
      {...props}
      className={Rac.composeRenderProps(className, (className, renderProps) =>
        buttonStyles({ ...renderProps, variant, size, className }),
      )}
    />
  );
}
