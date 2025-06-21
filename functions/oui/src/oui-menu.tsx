import React from "react";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { tv } from "tailwind-variants";
import { composeTailwindRenderProps } from "./oui-base";
import { Button } from "./oui-button";
import { Popover } from "./oui-popover";

/**
 * Derived from shadcn DropdownMenuContent
 */
export function Menu<T extends object>({
  className,
  ...props
}: Rac.MenuProps<T>) {
  return (
    <Rac.Menu
      className={composeTailwindRenderProps(
        className,
        "w-full min-w-[8rem] overflow-y-auto overflow-x-hidden p-1",
      )}
      {...props}
    />
  );
}

/**
 * Derived from shadcn DropdownMenuItem
 */
export const menuItemStyles = tv({
  base: [
    "relative flex cursor-default select-none items-center gap-x-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
    '[&_svg:not([class*="text-"])]:text-muted-foreground [&_svg:not([class*="size-"])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    "data-[focused]:bg-accent data-[focused]:text-accent-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ],
  variants: {
    variant: {
      default: "",
      destructive: [
        "text-destructive [&_svg]:text-destructive",
        "data-[focused]:bg-destructive/10 data-[focused]:text-destructive dark:data-[focused]:bg-destructive/20",
      ],
    },
    selectionMode: {
      none: "",
      single: "pl-8",
      multiple: "pl-8",
    },
  },
  defaultVariants: {
    variant: "default",
    selectionMode: "none",
  },
});

export interface MenuItemProps<T extends object> extends Rac.MenuItemProps<T> {
  variant?: "default" | "destructive";
}

/**
 * Derived from shadcn DropdownMenuCheckboxItem and DropdownMenuRadioGroup
 */
export function MenuItem<T extends object>({
  className,
  variant,
  children,
  ...props
}: MenuItemProps<T>) {
  return (
    <Rac.MenuItem
      {...props}
      className={Rac.composeRenderProps(className, (className, renderProps) =>
        menuItemStyles({
          ...renderProps,
          variant,
          className,
        }),
      )}
    >
      {({ isSelected, selectionMode, hasSubmenu, ...renderProps }) => {
        const isCheckboxItem = isSelected && selectionMode === "multiple";
        const isRadioItem = isSelected && selectionMode === "single";

        return (
          <>
            {isCheckboxItem && (
              <span className="absolute left-2 flex size-3.5 items-center justify-center">
                <CheckIcon className="size-4" />
              </span>
            )}
            {isRadioItem && (
              <span className="absolute left-2 flex size-3.5 items-center justify-center">
                <CircleIcon className="size-2 fill-current" />
              </span>
            )}
            {typeof children === "function"
              ? children({
                  isSelected,
                  selectionMode,
                  hasSubmenu,
                  ...renderProps,
                })
              : children}
            {hasSubmenu && <ChevronRightIcon className="ml-auto size-4" />}
          </>
        );
      }}
    </Rac.MenuItem>
  );
}

interface MenuExProps<T> extends Rac.MenuProps<T> {
  triggerElement: string | React.ReactElement;
}

/**
 * If `triggerElement` is a string, it's rendered as a ghost `Button`.
 */
export function MenuEx<T extends object>({
  triggerElement,
  children,
  ...rest
}: MenuExProps<T>) {
  return (
    <Rac.MenuTrigger>
      {typeof triggerElement === "string" ? (
        <Button variant="ghost">{triggerElement}</Button>
      ) : (
        triggerElement
      )}
      <Popover>
        <Menu {...rest}>{children}</Menu>
      </Popover>
    </Rac.MenuTrigger>
  );
}
