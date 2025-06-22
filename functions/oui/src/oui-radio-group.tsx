import type React from "react";
import { CircleIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";
import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "./oui-base";
import { FieldError } from "./oui-field-error";
import { baseLabelStyles, Label } from "./oui-label";
import { Text } from "./oui-text";

/**
 * Derived from shadcn RadioGroup
 */
export function RadioGroup({ className, ...props }: Rac.RadioGroupProps) {
  return (
    <Rac.RadioGroup
      data-slot="radio-group"
      className={composeTailwindRenderProps(className, "grid gap-3")}
      {...props}
    />
  );
}

export interface RadioProps extends Rac.RadioProps {
  radioGroupItemClassName?: string;
}

/**
 * Derived from shadcn FormDemo FormItem and RadioGroupItem
 * Radix has RadioGroupPrimitive.Item which is separate from label while RAC structures with a label.
 */
export const Radio = ({
  className,
  children,
  radioGroupItemClassName,
  ...props
}: RadioProps) => {
  return (
    <Rac.Radio
      className={composeTailwindRenderProps(className, [
        baseLabelStyles,
        "group items-start gap-3",
      ])}
      {...props}
    >
      {(renderProps) => (
        <>
          <div
            data-slot="radio-group-item"
            className={twMerge(
              [
                focusVisibleStyles,
                disabledStyles,
                "border-input text-primary dark:bg-input/30 shadow-xs relative aspect-square size-4 shrink-0 rounded-full border outline-none transition-[color,box-shadow]",
                "group-data-[invalid]:ring-destructive/20 group-data-[invalid]:dark:ring-destructive/40 group-data-[invalid]:border-destructive",
              ],
              radioGroupItemClassName,
            )}
          >
            {renderProps.isSelected && (
              <CircleIcon
                data-slot="radio-group-indicator"
                className="fill-primary absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2"
              />
            )}
          </div>
          {typeof children === "function" ? children(renderProps) : children}
        </>
      )}
    </Rac.Radio>
  );
};

export interface RadioGroupExProps extends Rac.RadioGroupProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
}

export function RadioGroupEx({
  label,
  description,
  errorMessage,
  children,
  ...props
}: RadioGroupExProps) {
  return (
    <RadioGroup {...props}>
      {(renderProps) => (
        <>
          {label && <Label className="">{label}</Label>}
          {description && <Text slot="description">{description}</Text>}
          {typeof children === "function" ? children(renderProps) : children}
          <FieldError>{errorMessage}</FieldError>
        </>
      )}
    </RadioGroup>
  );
}
