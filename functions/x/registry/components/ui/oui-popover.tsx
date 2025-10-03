import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { Button } from "./oui-button";
import { Dialog } from "./oui-dialog";

/**
 * Styles for the Popover component, derived from shadcn UI's `DropdownMenuContent` and `SelectContent`.
 * React Aria Components' Popover handles the actual placement and applies essential inline styles (e.g., z-index, positioning).
 * These `popoverStyles` primarily define appearance, animations, and context-specific sizing via the `trigger` variant.
 * The `trigger` variant styles are applied based on the `trigger` render prop from React Aria Components,
 * allowing contextual styling for different trigger types like `MenuTrigger`, `Select`, or `ComboBox`.
 */

const trigger = {
  DialogTrigger: "min-w-72 p-4",
  MenuTrigger: "",
  SubmenuTrigger: "shadow-lg",
  Select: "min-w-[var(--trigger-width)] p-1",
  ComboBox: "min-w-[var(--trigger-width)] p-1",
} as const;

const placement = {
  top: "data-[placement=top]:slide-in-from-bottom-2",
  bottom: "data-[placement=bottom]:slide-in-from-top-2",
  left: "data-[placement=left]:slide-in-from-right-2",
  right: "data-[placement=right]:slide-in-from-left-2",
} as const;

export const popoverVariants = cva(
  [
    "bg-popover text-popover-foreground relative min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border shadow-md outline-none",
    "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95",
    "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
  ],
  {
    variants: { trigger, placement },
  },
);

function isPopoverVariantsTriggerKey(
  value: unknown,
): value is keyof typeof trigger {
  return typeof value === "string" && Object.keys(trigger).includes(value);
}

function isPopoverVariantsPlacementKey(
  value: unknown,
): value is keyof typeof placement {
  return typeof value === "string" && Object.keys(placement).includes(value);
}

export function Popover({ className, offset = 4, ...props }: Rac.PopoverProps) {
  return (
    <Rac.Popover
      offset={offset}
      className={Rac.composeRenderProps(
        className,
        (className, { trigger, placement, ...renderProps }) =>
          twMerge(
            popoverVariants({
              ...renderProps,
              trigger: isPopoverVariantsTriggerKey(trigger)
                ? trigger
                : undefined,
              placement: isPopoverVariantsPlacementKey(placement)
                ? placement
                : undefined,
              className,
            }),
          ),
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
