import * as React from "react";
import * as Oui from "@workspace/oui";
import { Label } from "@workspace/ui/components/ui/label";
import { Slider } from "@workspace/ui/components/ui/slider";

export function OuiSliderDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col flex-wrap gap-6 md:flex-row">
      <Oui.SliderEx defaultValue={[50]} maxValue={100} step={1} />
      <Oui.SliderEx defaultValue={[50]} maxValue={100} step={1} isDisabled />
      {/* <Slider defaultValue={[25, 50]} max={100} step={1} />
      <Slider defaultValue={[10, 20]} max={100} step={10} />
      <div className="flex w-full items-center gap-6">
        <Slider defaultValue={[50]} max={100} step={1} orientation="vertical" />
        <Slider defaultValue={[25]} max={100} step={1} orientation="vertical" />
      </div>
      <SliderControlled /> */}
    </div>
  );
}
