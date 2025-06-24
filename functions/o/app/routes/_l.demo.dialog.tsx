import { AlertDialogDemo } from "~/components/alert-dialog-demo";
import { DemoContainer } from "~/components/demo-container";
import { DialogDemo } from "~/components/dialog-demo";
import { OuiAlertDialogDemo } from "~/components/oui-alert-dialog-demo";
import { OuiDialogDemo } from "~/components/oui-dialog-demo";
import { OuiSheetDemo } from "~/components/oui-sheet-demo";
import { SheetDemo } from "~/components/sheet-demo";

export default function RouteComponent() {
  return (
    <DemoContainer className="grid grid-cols-2">
      <DialogDemo />
      <OuiDialogDemo />
      <AlertDialogDemo />
      <OuiAlertDialogDemo />
      <SheetDemo />
      <OuiSheetDemo />
    </DemoContainer>
  );
}
