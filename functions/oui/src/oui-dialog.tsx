import type { ReactElement } from "react";
import type { VariantProps } from "tailwind-variants";
import React from "react";
import { XIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { twJoin, twMerge } from "tailwind-merge";
import { Button } from "./oui-button";
import { ModalEx, ModalEx1, sheetModalStyles } from "./oui-modal";

export interface DialogProps extends Rac.DialogProps {
  /**
   * If `true`, hides the close button for non-'alertdialog' role.
   * 'alertdialog' role never shows a close button.
   * @default false
   */
  hideCloseButtonForNonAlert?: boolean;
}

/**
 * Derived from shadcn DialogContent.
 */
export function Dialog({
  hideCloseButtonForNonAlert = false,
  className,
  children,
  ...props
}: DialogProps) {
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

/**
 * Derived from shadcn DialogHeader
 */
export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className={twMerge(
      "flex flex-col gap-2 text-center sm:text-left",
      className,
    )}
  />
);

/**
 * Derived from shadcn DialogFooter
 */
export const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className={twMerge(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className,
    )}
  />
);

/**
 * Derived from shadcn DialogDescription
 */
export const DialogDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    {...props}
    className={twMerge("text-muted-foreground text-sm", className)}
  />
);

export interface DialogExProps extends DialogProps {
  triggerElement: string | ReactElement;
  modalClassName?: string;
}

/**
 * A modal dialog.
 * If `triggerElement` is a string, it's rendered as a ghost `Button`.
 * The modal is dismissable via an outside press if `role` is not "alertdialog".
 */
export function DialogEx({
  triggerElement,
  modalClassName,
  ...props
}: DialogExProps) {
  return (
    <Rac.DialogTrigger>
      {typeof triggerElement === "string" ? (
        <Button variant="ghost">{triggerElement}</Button>
      ) : (
        triggerElement
      )}
      <ModalEx
        className={modalClassName}
        isDismissable={props.role !== "alertdialog"}
      >
        <Dialog {...props} />
      </ModalEx>
    </Rac.DialogTrigger>
  );
}

export interface DialogEx1Props
  extends DialogProps,
    Pick<Rac.ModalOverlayProps, "isOpen" | "defaultOpen" | "onOpenChange"> {
  modalClassName?: string;
}

/**
 * A programmatic modal dialog without a trigger element.
 * The modal is dismissable via an outside press if `role` is not "alertdialog".
 */
export function DialogEx1({
  modalClassName,
  isOpen,
  defaultOpen,
  onOpenChange,
  ...props
}: DialogEx1Props) {
  return (
    <ModalEx
      className={modalClassName}
      isDismissable={props.role !== "alertdialog"}
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <Dialog {...props} />
    </ModalEx>
  );
}

export interface DialogEx2Props
  extends Omit<DialogProps, "role">, // Prevent 'alertdialog' role
    Pick<VariantProps<typeof sheetModalStyles>, "side"> {
  triggerElement: string | ReactElement;
  modalClassName?: string;
  overlayClassName?: string;
}

/**
 * A sheet modal that slides in from a side of the screen.
 * The modal is always dismissable via an outside press.
 */
export function DialogEx2({
  triggerElement,
  modalClassName,
  overlayClassName,
  side,
  ...props
}: DialogEx2Props) {
  return (
    <Rac.DialogTrigger>
      {typeof triggerElement === "string" ? (
        <Button variant="ghost">{triggerElement}</Button>
      ) : (
        triggerElement
      )}
      <ModalEx1
        className={modalClassName}
        overlayClassName={overlayClassName}
        side={side}
        isDismissable
      >
        <Dialog {...props} />
      </ModalEx1>
    </Rac.DialogTrigger>
  );
}
