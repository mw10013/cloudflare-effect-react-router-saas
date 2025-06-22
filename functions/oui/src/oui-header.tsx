import type { VariantProps } from "tailwind-variants";
import * as Rac from "react-aria-components";
import { tv } from "tailwind-variants";

export const headerStyles = tv({
  base: "px-2 py-1.5",
  variants: {
    variant: {
      menu: "text-sm font-medium", // Derived from shadcn DropdownMenuLabel
      select: "text-muted-foreground text-xs", // Derived from shadcn SelectLabel
    },
    inset: {
      true: "pl-8",
    },
  },
  defaultVariants: {
    variant: "menu",
    inset: false,
  },
});

export interface HeaderProps
  extends React.ComponentProps<typeof Rac.Header>,
    VariantProps<typeof headerStyles> {}

export const Header = ({ variant, inset, className, ...rest }: HeaderProps) => (
  <Rac.Header
    className={headerStyles({ variant, inset, className })}
    {...rest}
  />
);
