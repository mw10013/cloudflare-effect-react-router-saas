import { DemoContainer } from "~/components/demo-container";
import { OuiSwitchDemo } from "~/components/oui-switch-demo";
import { SwitchDemo } from "~/components/switch-demo";

export default function RouteComponent() {
  return (
    <DemoContainer className="flex-row">
      <SwitchDemo />
      <OuiSwitchDemo />
    </DemoContainer>
  );
}
