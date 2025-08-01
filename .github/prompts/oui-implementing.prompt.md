---
mode: "agent"
description: "Implement Oui with Shadcn design system for Tailwind v4"
---

# Implementing Oui

- Oui is React Aria Components (RAC) with Shadcn design system (Tailwind v4 version).
- The primary goal is to provide a set of components from RAC, and apply the visual characteristics of the Shadcn design system to them, while fully leveraging RAC's inherent capabilities.
- In the monorepo, oui is located in functions/oui.

## Styling

- [RAC Styling Documentation](mdc:https:/react-spectrum.adobe.com/react-aria/styling.html)
- All styling must adhere to the principles and tokens defined in the Shadcn design system.
- Leverage RAC's data attributes (e.g., `data-focused`, `data-selected`, `data-disabled`, `data-entering`, `data-exiting`, `data-placement`) for stateful and contextual styling, as per RAC conventions.
- Be mindful of inline styles applied by React Aria Components themselves (e.g., `Popover` managing `z-index` and positioning). Oui styles should complement these, avoiding redundancy or conflict where RAC handles fundamental CSS properties directly.
- When translating Shadcn styling that utilizes CSS pseudo-classes (e.g., `hover:`, `focus:`), these must be mapped to the equivalent React Aria Components data attributes (e.g., `data-[hovered]`, `data-[focused]`)
- Prefer inline styling using 'composeTailwindRenderProps`.

### Examples of how to structure styling

```tsx
import * as Rac from "react-aria-components";
import { tv } from "tailwind-variants";
import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "./oui-base";

export function Menu<T extends object>({
  className,
  ...props
}: Rac.MenuProps<T>) {
  // composeTailwindRenderProps used here since Rac.Menu has renderProps
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

export function Table({
  className,
  containerClassName,
  children,
  ...props
}: TableProps) {
  // twMerge is used for the <div> since a div does not have renderProps.
  // Rac.Table has renderProps so composeTailwindRenderProps is used.
  return (
    <div
      className={twMerge("relative w-full overflow-x-auto", containerClassName)}
    >
      <Rac.Table
        className={composeTailwindRenderProps(
          className,
          "w-full caption-bottom text-sm",
        )}
        {...props}
      >
        {children}
      </Rac.Table>
    </div>
  );
}

export function Row<T extends object>({
  className,
  ...props
}: Rac.RowProps<T>) {
  // composeTailwindRenderProps used here since Rac.Row has renderProps.
  // data-[hovered]:bg-muted/50 and data-[disabled]:opacity-50 are both included in the tw string and not broken out into
  // separate array items since the number of utilities in the tw string is small.
  return (
    <Rac.Row
      className={composeTailwindRenderProps(
        className,
        "data-[hovered]:bg-muted/50 data-[selected]:bg-muted border-b transition-colors data-[disabled]:opacity-50",
      )}
      {...props}
    />
  );
}

export function Dialog({
  hideCloseButtonForNonAlert = false,
  className,
  children,
  ...props
}: DialogProps) {
  // Rac.Dialog does not have renderProps so twMerge is used instead of composeTailwindRenderProps
  // Rac.Button does have renderProps, but we don't reference them directly since we prefer to inline conditional states eg. data-[hovered]:bg-accent
  // twJoin is used since we don't need to merge.
  // Since there are many conditional states, we group them in separate arguments to twJoin.
  return (
    <Rac.Dialog
      className={twMerge("grid gap-4 outline-none", className)}
      {...props}
    >
      {(renderProps) => (
        <>
          {typeof children === "function" ? children(renderProps) : children}
          {!hideCloseButtonForNonAlert && props.role !== "alertdialog" && (
            <Rac.Button
              slot="close"
              className={twJoin(
                "absolute right-4 top-4 rounded-sm p-1 opacity-70 transition-opacity",
                "data-[hovered]:bg-accent data-[hovered]:text-muted-foreground data-[hovered]:opacity-100",
                "data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-background data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2",
                "data-[disabled]:pointer-events-none",
              )}
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </Rac.Button>
          )}
        </>
      )}
    </Rac.Dialog>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    // A div does not have renderProps so twMerge is used.
    <div
      {...props}
      className={twMerge(
        "flex flex-col gap-2 text-center sm:text-left",
        className,
      )}
    />
  );
}

export function ListBoxItem<T extends object>({
  className,
  children,
  ...props
}: Rac.ListBoxItemProps<T>) {
  // Rac.ListBoxItem has renderProps so use composeTailwindRenderProps.
  // Use array for the styles since it needs focuseVisibleStyles and disabledStyles.
  // Since there are so many utility classes, the conditional status are broken out into separate array items eg. data-[focused]:*
  return (
    <Rac.ListBoxItem
      {...props}
      textValue={
        props.textValue || (typeof children === "string" ? children : undefined)
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
          renderProps: Parameters<
            Extract<
              React.ComponentProps<typeof Rac.ListBoxItem>["children"],
              (...args: any) => any
            >
          >[0],
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

// Use tailwind-variants (tv) when a component has actual variants. In this case, we have trigger and placement variants.
// Conditional states eg. data-[entering] are not variants.
export const popoverStyles = tv({
  base: [
    "bg-popover text-popover-foreground relative min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border shadow-md outline-none",
    "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95",
    "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
  ],
  variants: {
    trigger: {
      DialogTrigger: "min-w-72 p-4",
      MenuTrigger: "",
      SubmenuTrigger: "shadow-lg",
      Select: "min-w-[var(--trigger-width)] p-1", // Derived from shadcn SelectPrimitive.Viewport
      ComboBox: "min-w-[var(--trigger-width)] p-1", // Derived from shadcn SelectPrimitive.Viewport
    },
    placement: {
      top: "data-[placement=top]:slide-in-from-bottom-2",
      bottom: "data-[placement=bottom]:slide-in-from-top-2",
      left: "data-[placement=left]:slide-in-from-right-2",
      right: "data-[placement=right]:slide-in-from-left-2",
    },
  },
});

type PopoverStylesTriggerKey = keyof typeof popoverStyles.variants.trigger;
function isPopoverStylesTriggerKey(
  value: unknown,
): value is PopoverStylesTriggerKey {
  return (
    typeof value === "string" &&
    Object.keys(popoverStyles.variants.trigger).includes(value)
  );
}

type PopoverStylesPlacementKey = keyof typeof popoverStyles.variants.placement;
function isPopoverStylesPlacementKey(
  value: unknown,
): value is PopoverStylesPlacementKey {
  return (
    typeof value === "string" &&
    Object.keys(popoverStyles.variants.placement).includes(value)
  );
}

export function Popover({ className, offset = 4, ...props }: Rac.PopoverProps) {
  return (
    <Rac.Popover
      offset={offset}
      className={Rac.composeRenderProps(
        className,
        (className, { trigger, placement, ...renderProps }) =>
          popoverStyles({
            ...renderProps,
            trigger: isPopoverStylesTriggerKey(trigger) ? trigger : undefined,
            placement: isPopoverStylesPlacementKey(placement)
              ? placement
              : undefined,
            className,
          }),
      )}
      {...props}
    />
  );
}
```

## Component Structure & API

- **Leverage RAC's Native Structure and Context System.**
  - `oui` components **must not** attempt a 1-to-1 mapping of Shadcn/Radix component APIs or internal structures.
  - The composition and API of `oui` components should primarily follow the patterns and primitives provided by React Aria Components.
  - `oui` components, as thin wrappers, should directly utilize the contextual information (e.g., `selectionMode`, `triggerType`) and state (e.g., `isSelected`, `isFocused`) that RAC primitives make available through their render props or internal context.
    - When using `Rac.composeRenderProps` or similar patterns, it is acceptable to shadow `className` (i.e., `(className, renderProps) => menuStyles({ ...renderProps, className })`).
    - Prefer simple and concise variable names (e.g., `renderProps` over `renderPropsFromRac`) where context makes the meaning clear.
  - Avoid creating `oui-specific` context or prop-drilling mechanisms if RAC already provides the necessary data for a component to adapt its behavior or styling.
  - For example, components like RAC `Checkbox` or `RadioGroup` inherently manage their labels, which differs from Shadcn's separate `Label` component. `oui` should follow the RAC approach.
- **Component Granularity and Composition:**
  - `oui` components will primarily serve as styled, thin wrappers around individual React Aria Components primitives.
  - These wrappers can intelligently adapt their presentation (e.g., conditionally rendering an icon, applying specific styles like an inset) based on the props and contextual information received from their underlying RAC primitive.
  - Complex UI patterns (e.g., a full DropdownMenu) will be composed by the consumer using these `oui` primitives, rather than `oui` providing large, monolithic compound components.
- **Reusable Wrapper Components (`Ex` Suffix):**
  - `oui` may provide components with an `Ex` suffix (e.g., `MenuEx`) to serve as reusable wrappers, extensions, or examples for common UI patterns.
  - These `Ex` components compose multiple `oui` primitives and/or React Aria Components, drawing inspiration from RAC's "Reusable wrappers" concept (e.g., #fetch https://react-spectrum.adobe.com/react-aria/Menu.html#reusable-wrappers).
  - They offer convenience for common use cases. If multiple such extensions exist for a base component, they follow a sequential naming convention (e.g., `ComponentNameEx`, `ComponentNameEx1`).
  - While providing a higher level of abstraction, `Ex` components should still primarily leverage RAC's native structure and context.
- **Customization and Advanced Features:**
  - Any advanced customization, composition, or extension of components should follow React Aria Components' patterns and best practices, including the use of its rich render props and context system.
  - `oui` components should facilitate this by transparently passing through RAC props and exposing RAC's inherent flexibility.
  - Avoid introducing Radix-specific patterns or abstractions if a RAC-idiomatic way exists.
  - Reference: [RAC Advanced Customization](https://react-spectrum.adobe.com/react-aria/advanced.html)
