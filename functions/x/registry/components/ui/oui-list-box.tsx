import { Check } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";
import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "@/registry/components/ui/oui-base";
import { buttonVariants } from "@/registry/components/ui/oui-button";

/** Styles derived from shadcn SelectItem.
 * https://github.com/adobe/react-spectrum/issues/7601
 */
export function ListBoxItem<T extends object>({
  className,
  children,
  ...props
}: Rac.ListBoxItemProps<T>) {
  return (
    <Rac.ListBoxItem
      {...props}
      textValue={
        props.textValue ?? (typeof children === "string" ? children : undefined)
      }
      className={composeTailwindRenderProps(className, [
        focusVisibleStyles,
        disabledStyles,
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
        "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "data-[focused]:bg-accent data-[focused]:text-accent-foreground",
        "data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
      ])}
    >
      {Rac.composeRenderProps(
        children,
        (
          children,
          renderProps,
        ) => (
          <>
            {renderProps.isSelected && (
              <span className="absolute right-2 flex size-3.5 items-center justify-center">
                <Check className="size-4" />
              </span>
            )}
            {children}
          </>
        ),
      )}
    </Rac.ListBoxItem>
  );
}

export function ListBoxEx1Pagination<T extends object>({
  className,
  "aria-label": ariaLabel = "Pagination",
  ...props
}: Rac.ListBoxProps<T>) {
  return (
    <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
      <Rac.ListBox
        aria-label={ariaLabel}
        orientation="horizontal"
        selectionMode="single"
        className={composeTailwindRenderProps(
          className,
          "flex flex-row items-center gap-1",
        )}
        {...props}
      />
    </nav>
  );
}

/**
 * Pagination item styled as a button. Selected items use outline variant, others use ghost.
 */
export function ListBoxItemEx1Pagination<T extends object>({
  className,
  children,
  ...props
}: Rac.ListBoxItemProps<T>) {
  return (
    <Rac.ListBoxItem
      {...props}
      textValue={
        props.textValue ??
        (typeof children === "string"
          ? children
          : typeof children === "number"
            ? String(children)
            : undefined)
      }
      className={Rac.composeRenderProps(className, (className, renderProps) =>
        twMerge(
          "cursor-pointer",
          buttonVariants({
            ...renderProps,
            variant: renderProps.isSelected ? "outline" : "ghost",
            className,
          }),
        ),
      )}
    >
      {children}
    </Rac.ListBoxItem>
  );
}
