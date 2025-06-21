import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Derived from shadcn DropdownMenuShortcut.
 */
export const Keyboard = ({
  className,
  ...props
}: React.ComponentProps<typeof Rac.Keyboard>) => (
  <Rac.Keyboard
    className={twMerge(
      // Specify font-sans since <kbd> uses mono font by default.
      "ml-auto font-sans text-xs tracking-widest opacity-60",
      className,
    )}
    {...props}
  />
);
