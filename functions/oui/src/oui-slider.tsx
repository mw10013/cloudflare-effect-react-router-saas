import React from "react";
import * as Rac from "react-aria-components";
import { tv } from "tailwind-variants";
import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "./oui-base";
import { Label } from "./oui-label";

// TODO: Slider: vertical, multiple
export function Slider({ className, ...props }: Rac.SliderProps) {
  return (
    <Rac.Slider
      {...props}
      className={composeTailwindRenderProps(
        className,
        "flex w-full flex-col gap-2",
      )}
    ></Rac.Slider>
  );
}

export function SliderOutput({ className, ...props }: Rac.SliderOutputProps) {
  return (
    <Rac.SliderOutput
      {...props}
      className={composeTailwindRenderProps(
        className,
        "text-sm font-medium tabular-nums",
      )}
    ></Rac.SliderOutput>
  );
}

export interface SliderTrackProps
  extends Omit<Rac.SliderTrackProps, "children">,
    Rac.SliderTrackProps {
  children?: React.ReactNode;
}

export function SliderTrack({
  className,
  children,
  ...props
}: SliderTrackProps) {
  return (
    <Rac.SliderTrack
      className={composeTailwindRenderProps(className, [disabledStyles, "h-4"])}
      {...props}
    >
      {({ state }) => (
        <>
          <div className="bg-primary/20 absolute top-[50%] h-1.5 w-full translate-y-[-50%] rounded-full" />
          <div
            className="bg-primary absolute top-[50%] h-1.5 translate-y-[-50%] rounded-full"
            style={{
              width: state.getThumbPercent(0) * 100 + "%",
            }}
          />
          {children}
        </>
      )}
    </Rac.SliderTrack>
  );
}

export function SliderThumb({ className, ...props }: Rac.SliderThumbProps) {
  return (
    <Rac.SliderThumb
      {...props}
      className={composeTailwindRenderProps(className, [
        focusVisibleStyles,
        disabledStyles,
        "border-primary/50 bg-background top-[50%] size-4 rounded-full border shadow transition-colors",
      ])}
    ></Rac.SliderThumb>
  );
}

export interface SliderExProps extends Rac.SliderProps {
  label?: React.ReactNode;
}

export function SliderEx({ label, ...props }: SliderExProps) {
  return (
    <Slider {...props}>
      <div className="flex items-center justify-between gap-2">
        {label && typeof label === "string" ? <Label>{label}</Label> : label}
        <SliderOutput />
      </div>
      <SliderTrack>
        <SliderThumb />
      </SliderTrack>
    </Slider>
  );
}
