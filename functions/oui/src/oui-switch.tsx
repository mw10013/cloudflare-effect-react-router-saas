import React from "react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";
import {
  composeTailwindRenderProps,
  groupFocusVisibleStyles,
} from "./oui-base";
import { baseLabelStyles } from "./oui-label";
import { Text } from "./oui-text";

export function Switch({ className, ...props }: Rac.SwitchProps) {
  return (
    <Rac.Switch
      {...props}
      className={composeTailwindRenderProps(className, [
        baseLabelStyles,
        "group",
      ])}
    />
  );
}

/**
 * Derived from shadcn SwitchPrimitive.Root and SwitchPrimitive.Thumb
 */
export function SwitchIndicator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        groupFocusVisibleStyles,
        "group-data-[selected]:bg-primary bg-input dark:bg-input/80 shadow-xs inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all group-data-[disabled]:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <span className="bg-background dark:bg-foreground dark:group-data-[selected]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform group-data-[selected=false]:translate-x-0 group-data-[selected]:translate-x-[calc(100%-2px)]" />
    </div>
  );
}

export interface SwitchExProps extends Rac.SwitchProps {
  indicatorPosition?: "start" | "end";
  indicatorClassName?: string;
  descriptionClassName?: string;
  description?: React.ReactNode;
  containerClassName?: string;
}

export function SwitchEx({
  indicatorPosition = "start",
  className,
  indicatorClassName,
  descriptionClassName,
  description,
  children,
  containerClassName,
  ...props
}: SwitchExProps) {
  const descriptionId = description ? React.useId() : undefined;
  return (
    // Derived fromshadcn FormDemo div
    <div className={twMerge("flex flex-col gap-0.5", containerClassName)}>
      <Switch
        {...props}
        className={composeTailwindRenderProps(
          className,
          indicatorPosition === "end" ? "justify-between" : "",
        )}
        aria-describedby={descriptionId}
      >
        {(renderProps) => (
          <>
            {indicatorPosition === "start" && (
              <SwitchIndicator className={indicatorClassName} />
            )}
            {typeof children === "function" ? children(renderProps) : children}
            {indicatorPosition === "end" && (
              <SwitchIndicator className={indicatorClassName} />
            )}
          </>
        )}
      </Switch>
      {/* TODO: SwitchEx description spacer when indicatorPosition = end */}
      {description && (
        <Text
          id={descriptionId}
          slot="description"
          className={twMerge(
            props.isDisabled ? "opacity-60" : undefined,
            descriptionClassName,
          )}
        >
          {description}
        </Text>
      )}
    </div>
  );
}
