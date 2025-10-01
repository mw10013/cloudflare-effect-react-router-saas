import { DemoContainer } from "~/components/demo-container";
import { OuiTextAreaDemo } from "~/components/oui-text-area-demo";
import { TextareaDemo } from "~/components/text-area-demo";

export default function RouteComponent() {
  return (
    <DemoContainer className="flex-row">
      <TextareaDemo />
      <OuiTextAreaDemo />
    </DemoContainer>
  );
}
