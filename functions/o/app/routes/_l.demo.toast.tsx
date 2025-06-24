import { DemoContainer } from "~/components/demo-container";
import { OuiToastDemo } from "~/components/oui-toast-demo";
import { SonnerDemo } from "~/components/sonner-demo";

export default function RouteComponent() {
  return (
    <DemoContainer className="flex-row">
      <SonnerDemo />
      <OuiToastDemo />
    </DemoContainer>
  );
}
