import * as Rac from "react-aria-components";
import { tv } from "tailwind-variants";
import { Button } from "./oui-button";
import { Dialog } from "./oui-dialog";

/**
 * Styles for the Popover component, derived from shadcn UI's `DropdownMenuContent` and `SelectContent`.
 * React Aria Components' Popover handles the actual placement and applies essential inline styles (e.g., z-index, positioning).
 * These `popoverStyles` primarily define appearance, animations, and context-specific sizing via the `trigger` variant.
 * The `trigger` variant styles are applied based on the `trigger` render prop from React Aria Components,
 * allowing contextual styling for different trigger types like `MenuTrigger`, `Select`, or `ComboBox`.
 */
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

export interface PopoverExProps extends Omit<Rac.PopoverProps, "children"> {
  triggerElement: string | React.ReactElement;
  dialogClassName?: string;
  children?: Rac.DialogProps["children"];
}

/**
 * A modal dialog.
 * If `triggerElement` is a string, it's rendered as a ghost `Button`.
 * The dialog is dismissable via an outside press if `role` is not "alertdialog".
 */
export function PopoverEx({
  triggerElement,
  dialogClassName,
  children,
  ...props
}: PopoverExProps) {
  return (
    <Rac.DialogTrigger>
      {typeof triggerElement === "string" ? (
        <Button variant="ghost">{triggerElement}</Button>
      ) : (
        triggerElement
      )}
      <Popover {...props}>
        <Dialog className={dialogClassName} hideCloseButtonForNonAlert>
          {children}
        </Dialog>
      </Popover>
    </Rac.DialogTrigger>
  );
}
