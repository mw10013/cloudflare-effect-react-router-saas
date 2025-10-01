import { DemoContainer } from "~/components/demo-container";
import { OuiSliderDemo } from "~/components/oui-slider-demo";
import { SliderDemo } from "~/components/slider-demo";

export default function RouteComponent() {
  return (
    <DemoContainer className="flex-row">
      <SliderDemo />
      <OuiSliderDemo />
    </DemoContainer>
  );
}
