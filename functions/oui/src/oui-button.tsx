import type { VariantProps } from "tailwind-variants";
import * as Rac from "react-aria-components";
import { tv } from "tailwind-variants";
import { disabledStyles, focusVisibleStyles } from "./oui-base";

/**
 * Derived from shadcn Button
 */
export const buttonStyles = tv({
  base: [
    focusVisibleStyles,
    disabledStyles,
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    "data-[disabled]:cursor-not-allowed", // Explicit cursor-pointer for Rac.Link structured with span.
    // Rac.Button does not support aria-invalid or have data-invalid. Below is commented for reference.
    // "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ],
  variants: {
    variant: {
      default:
        "bg-primary text-primary-foreground shadow-xs data-[hovered]:bg-primary/90",
      destructive: [
        "bg-destructive shadow-xs dark:bg-destructive/60 text-white",
        "data-[hovered]:bg-destructive/90",
        "data-[focus-visible]:ring-destructive/20 dark:data-[focus-visible]:ring-destructive/40",
      ],
      outline: [
        "bg-background shadow-xs dark:bg-input/30 dark:border-input border",
        "data-[hovered]:bg-accent data-[hovered]:text-accent-foreground dark:data-[hovered]:bg-input/50",
        "",
      ],
      secondary:
        "bg-secondary text-secondary-foreground shadow-xs data-[hovered]:bg-secondary/80",
      ghost:
        "data-[hovered]:bg-accent data-[hovered]:text-accent-foreground dark:data-[hovered]:bg-accent/50",
      link: "text-primary underline-offset-4 data-[hovered]:underline",
    },
    size: {
      default: "h-9 px-4 py-2 has-[>svg]:px-3",
      sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
      lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
      icon: "size-9",
    },
    // Workaround for TypeScript's excess property check with weak types when spreading renderProps.
    isPressed: {
      true: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type T = Parameters<
  Extract<
    React.ComponentProps<typeof Rac.Button>["className"],
    (...args: any) => any
  >
>[0];

export const buttonClassName =
  (props: VariantProps<typeof buttonStyles>) =>
  (
    renderProps: Partial<
      Parameters<
        Extract<
          React.ComponentProps<typeof Rac.Button>["className"],
          (...args: any) => any
        >
      >[0]
    >,
  ) =>
    buttonStyles({ ...renderProps, ...props });

export interface ButtonProps
  extends Rac.ButtonProps,
    VariantProps<typeof buttonStyles> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <Rac.Button
      data-slot="button"
      className={Rac.composeRenderProps(className, (className, renderProps) =>
        buttonStyles({
          ...renderProps,
          variant,
          size,
          className,
        }),
      )}
      {...props}
    />
  );
}
