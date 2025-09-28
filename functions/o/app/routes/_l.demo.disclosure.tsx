import { AccordionDemo } from "~/components/accordion-demo";
import { DemoContainer } from "~/components/demo-container";
import { OuiDisclosureDemo } from "~/components/oui-disclosure-demo";

export default function RouteComponent() {
  return (
    <DemoContainer className="flex-row">
      <AccordionDemo />
      <OuiDisclosureDemo />
    </DemoContainer>
  );
}
