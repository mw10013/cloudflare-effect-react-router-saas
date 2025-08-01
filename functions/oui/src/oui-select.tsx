import * as React from "react";
import { ChevronDown } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";
import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "./oui-base";
import { FieldError } from "./oui-field-error";
import { Label } from "./oui-label";
import { Popover } from "./oui-popover";
import { Text } from "./oui-text";

export function Select<T extends object>({
  className,
  ...props
}: Rac.SelectProps<T>) {
  return (
    <Rac.Select
      data-slot="select"
      className={composeTailwindRenderProps(className, "grid gap-2")}
      {...props}
    />
  );
}

export function SelectButton({
  className,
  size = "default",
  children,
  ...props
}: Rac.ButtonProps & {
  size?: "sm" | "default";
}) {
  return (
    <Rac.Button
      data-slot="select-trigger"
      data-size={size}
      className={composeTailwindRenderProps(className, [
        focusVisibleStyles,
        disabledStyles,
        "border-input [&_svg:not([class*='text-'])]:text-muted-foreground dark:bg-input/30 dark:data-[hovered]:bg-input/50 shadow-xs flex w-fit items-center justify-between gap-2 whitespace-nowrap rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] data-[size=default]:h-9 data-[size=sm]:h-8 data-[disabled]:cursor-not-allowed *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      ])}
      {...props}
    >
      {Rac.composeRenderProps(children, (children) => (
        <>
          {children}
          <ChevronDown className="size-4 opacity-50" aria-hidden="true" />
        </>
      ))}
    </Rac.Button>
  );
}

export function SelectValue<T extends object>({
  className,
  ...props
}: Rac.SelectValueProps<T>) {
  return (
    <Rac.SelectValue
      data-slot="select-value"
      className={Rac.composeRenderProps(
        className,
        (className, { isPlaceholder }) =>
          twMerge(isPlaceholder ? "text-muted-foreground" : "", className),
      )}
      {...props}
    />
  );
}

interface SelectExProps<T extends object>
  extends Omit<Rac.SelectProps<T>, "children"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
  buttonClassName?: string;
  /**
   * A render function to customize the display of the selected value or placeholder.
   * Receives `isPlaceholder` and `defaultChildren` (the placeholder string or default rendered item).
   */
  renderSelectValue?: (
    props: Rac.SelectValueRenderProps<T> & {
      defaultChildren: React.ReactNode | undefined;
    },
  ) => React.ReactNode;
}

export function SelectEx<T extends object>({
  label,
  description,
  errorMessage,
  children,
  items,
  buttonClassName,
  renderSelectValue,
  ...props
}: SelectExProps<T>) {
  return (
    <Select {...props}>
      {label && <Label>{label}</Label>}
      <SelectButton className={buttonClassName}>
        <SelectValue>{renderSelectValue}</SelectValue>
      </SelectButton>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover>
        <Rac.ListBox items={items}>{children}</Rac.ListBox>
      </Popover>
    </Select>
  );
}

interface SelectEx1Props<T extends object>
  extends Omit<Rac.SelectProps<T>, "children"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
  children: React.ReactNode;
  buttonClassName?: string;
  /**
   * A render function to customize the display of the selected value or placeholder.
   * Receives `isPlaceholder` and `defaultChildren` (the placeholder string or default rendered item).
   */
  renderSelectValue?: (
    props: Rac.SelectValueRenderProps<T> & {
      defaultChildren: React.ReactNode | undefined;
    },
  ) => React.ReactNode;
}

/**
 * Children are rendered as the contents of Popover and not in a ListBox.
 * Userful for Autocomplete.
 */
export function SelectEx1<T extends object>({
  label,
  description,
  errorMessage,
  children,
  buttonClassName,
  renderSelectValue,
  ...props
}: SelectEx1Props<T>) {
  return (
    <Select {...props}>
      {label && <Label>{label}</Label>}
      <SelectButton className={buttonClassName}>
        <SelectValue>{renderSelectValue}</SelectValue>
      </SelectButton>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover>{children}</Popover>
    </Select>
  );
}
