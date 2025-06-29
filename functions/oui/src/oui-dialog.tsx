import type { ReactElement, ReactNode } from "react";
import type { VariantProps } from "tailwind-variants";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { XIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { twJoin, twMerge } from "tailwind-merge";
import { Button } from "./oui-button";
import { Heading } from "./oui-heading";
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
export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={twMerge(
        "flex flex-col gap-2 text-center sm:text-left",
        className,
      )}
    />
  );
}

/**
 * Derived from shadcn DialogFooter
 */
export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={twMerge(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
    />
  );
}

/**
 * Derived from shadcn DialogDescription
 */
export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={twMerge("text-muted-foreground text-sm", className)}
    />
  );
}

export interface DialogExProps
  extends DialogProps,
    Partial<
      Pick<Rac.ModalOverlayProps, "isOpen" | "defaultOpen" | "onOpenChange">
    > {
  triggerElement?: string | ReactElement;
  modalClassName?: string;
}

/**
 * A modal dialog that can be opened via a trigger element or programmatically.
 *
 * If `triggerElement` is provided, it will be rendered and will open the dialog
 * when pressed.
 *
 * If `triggerElement` is omitted, the dialog must be controlled programmatically.
 *
 * In both cases, the open state can be uncontrolled (using `defaultOpen`) or
 * controlled (using `isOpen` and `onOpenChange`).
 */
export function DialogEx({
  triggerElement,
  modalClassName,
  isOpen,
  defaultOpen,
  onOpenChange,
  ...props
}: DialogExProps) {
  const modal = (
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
  if (triggerElement) {
    return (
      <Rac.DialogTrigger
        isOpen={isOpen}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        {typeof triggerElement === "string" ? (
          <Button variant="ghost">{triggerElement}</Button>
        ) : (
          triggerElement
        )}
        {modal}
      </Rac.DialogTrigger>
    );
  }
  return modal;
}

export interface DialogEx1AlertProps
  extends Rac.DialogProps,
    Pick<Rac.ModalOverlayProps, "isOpen" | "onOpenChange" | "defaultOpen"> {
  type?: "confirm" | "acknowledge";
  title: React.ReactNode;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  modalClassName?: string;
}

/**
 * A modal confirmation or acknowledgement dialog with a title, message, and
 * customizable action buttons. It is not dismissable by an outside press.
 *
 * - `type="confirm"` (default): Renders "Confirm" and "Cancel" buttons.
 * - `type="acknowledge"`: Renders a single "Acknowledge" button.
 */
export function DialogEx1Alert({
  type = "confirm",
  title,
  children,
  confirmLabel = type === "confirm" ? "Continue" : "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  modalClassName,
  isOpen,
  onOpenChange,
  defaultOpen,
  ...props
}: DialogEx1AlertProps) {
  return (
    <ModalEx
      className={modalClassName}
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
    >
      <Dialog role="alertdialog" {...props}>
        <DialogHeader>
          <Heading variant="alert" slot="title">
            {title}
          </Heading>
          <DialogDescription>{children}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {type === "confirm" && (
            <Button variant="outline" slot="close" autoFocus onPress={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button
            slot="close"
            onPress={onConfirm}
            autoFocus={type === "acknowledge"}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </Dialog>
    </ModalEx>
  );
}

export interface DialogEx2SheetProps
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
export function DialogEx2Sheet({
  triggerElement,
  modalClassName,
  overlayClassName,
  side,
  ...props
}: DialogEx2SheetProps) {
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

type DialogEx1AlertOptions = Omit<
  DialogEx1AlertProps,
  "isOpen" | "onOpenChange" | "defaultOpen" | "onConfirm" | "onCancel"
>;

interface DialogEx1AlertContextType {
  show: (options: DialogEx1AlertOptions) => Promise<boolean>;
}

const DialogEx1AlertContext = createContext<
  DialogEx1AlertContextType | undefined
>(undefined);

export function useDialogEx1Alert() {
  const context = useContext(DialogEx1AlertContext);
  if (!context) {
    throw new Error(
      "useDialogEx1Alert must be used within a DialogEx1AlertProvider",
    );
  }
  return context;
}

export function DialogEx1AlertProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<DialogEx1AlertOptions | null>(null);
  const promiseRef = useRef<{ resolve: (value: boolean) => void } | null>(null);

  const show = useCallback((newOptions: DialogEx1AlertOptions) => {
    setOptions(newOptions);
    return new Promise<boolean>((resolve) => {
      promiseRef.current = { resolve };
    });
  }, []);

  const handleClose = (confirmed: boolean) => {
    if (promiseRef.current) {
      promiseRef.current.resolve(confirmed);
    }
    setOptions(null);
    promiseRef.current = null;
  };

  return (
    <DialogEx1AlertContext.Provider value={{ show }}>
      {children}
      {options && (
        <DialogEx1Alert
          {...options}
          isOpen
          onOpenChange={(isOpen) => !isOpen && handleClose(false)}
          onConfirm={() => handleClose(true)}
          onCancel={() => handleClose(false)}
        />
      )}
    </DialogEx1AlertContext.Provider>
  );
}
