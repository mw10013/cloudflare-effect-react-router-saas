import React from "react";
import { CheckIcon, MinusIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";
import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "./oui-base";
import { baseLabelStyles } from "./oui-label";
import { Text } from "./oui-text";

export interface CheckboxProps extends Rac.CheckboxProps {
  indicatorClassName?: string;
}

/**
 * Derived from shadcn FormDemo FormItem and CheckboxPrimitive.Root
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
      {(renderProps) => (
        <>
          <span
            data-slot="checkbox-indicator"
            className={twMerge(
              [
                focusVisibleStyles,
                disabledStyles,
                "data-[disabled]:cursor-not-allowed",
                "border-input dark:bg-input/30 shadow-xs size-4 shrink-0 rounded-[4px] border outline-none transition-shadow",
                "data-[selected]:bg-primary data-[selected]:text-primary-foreground dark:data-[selected]:bg-primary data-[selected]:border-primary",
                "data-[interminate]:bg-primary data-[interminate]:text-primary-foreground dark:data-[interminate]:bg-primary data-[interminate]:border-primary",
                "data-[invalid]:ring-destructive/20 data-[invalid]:dark:ring-destructive/40 data-[invalid]:border-destructive",
              ],
              indicatorClassName,
            )}
          >
            {renderProps.isIndeterminate ? (
              <MinusIcon aria-hidden className="size-3.5" />
            ) : renderProps.isSelected ? (
              <CheckIcon aria-hidden className="size-3.5" />
            ) : null}
          </span>
          {typeof children === "function" ? children(renderProps) : children}
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
export function CheckboxEx({
  children,
  descriptionClassName,
  description,
  containerClassName,
  indicatorClassName,
  ...props
}: CheckboxExProps) {
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
}
