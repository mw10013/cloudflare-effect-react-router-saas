import React from "react";
import { CheckIcon, MinusIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";
import { composeTailwindRenderProps } from "./oui-base";
import { baseLabelStyles, labelStylesTv } from "./oui-label";
import { Text } from "./oui-text";

/**
 * Derived from shadcn CheckboxPrimitive.Root
 */
export const checkboxIndicatorStyles = tv({
  base: "border-input dark:bg-input/30 shadow-xs size-4 shrink-0 rounded-[4px] border outline-none transition-shadow",
  variants: {
    isSelected: {
      true: "bg-primary text-primary-foreground dark:bg-primary border-primary",
    },
    isInvalid: {
      true: "ring-destructive/20 dark:ring-destructive/40 border-destructive",
    },
    isFocusVisible: {
      true: "border-ring ring-ring/50 ring-[3px]",
    },
    isDisabled: {
      true: "cursor-not-allowed opacity-50",
    },
  },
});

export const checkboxIconStyles = "size-3.5";

// Pattern for Reusable Button Wrapper: https://github.com/adobe/react-spectrum/discussions/7511
export interface CheckboxProps extends Omit<Rac.CheckboxProps, "children"> {
  indicatorClassName?: string;
  children?: React.ReactNode;
}

/**
 * Derived from shadcn FormDemo FormItem
 * Radix has CheckboxPrimitive.Root which is separate from label while RAC structures with a label.
 */
export function Checkbox({
  indicatorClassName,
  className,
  children,
  ...props
}: CheckboxProps) {
  return (
    <Rac.Checkbox
      {...props}
      className={composeTailwindRenderProps(className, [
        baseLabelStyles,
        "group items-start gap-3",
      ])}
    >
      {({ isSelected, isIndeterminate, ...renderProps }) => (
        <>
          <span
            data-slot="checkbox-indicator"
            className={checkboxIndicatorStyles({
              isSelected: isSelected || isIndeterminate,
              className: indicatorClassName,
              ...renderProps,
            })}
          >
            {isIndeterminate ? (
              <MinusIcon aria-hidden className={checkboxIconStyles} />
            ) : isSelected ? (
              <CheckIcon aria-hidden className={checkboxIconStyles} />
            ) : null}
          </span>
          {children}
        </>
      )}
    </Rac.Checkbox>
  );
}

export interface CheckboxExProps extends Omit<Rac.CheckboxProps, "children"> {
  children?: React.ReactNode;
  descriptionClassName?: string;
  description: React.ReactNode;
  containerClassName?: string;
  indicatorClassName?: string;
}

// TODO: CheckboxEx: height discrepency with FormDemo
export const CheckboxEx = ({
  children,
  descriptionClassName,
  description,
  containerClassName,
  indicatorClassName,
  ...props
}: CheckboxExProps) => {
  const descriptionId = React.useId();
  return (
    <div className={twMerge("flex flex-col gap-1", containerClassName)}>
      <Checkbox
        {...props}
        aria-describedby={descriptionId}
        indicatorClassName={indicatorClassName}
      >
        {children}
      </Checkbox>
      <div className="items-top flex gap-3">
        <span className="size-4 shrink-0" />
        <Text
          id={descriptionId}
          slot="description"
          className={descriptionClassName}
        >
          {description}
        </Text>
      </div>
    </div>
  );
};
