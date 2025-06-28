import { useState } from "react";
import * as Oui from "@workspace/oui";

export function OuiAlertDialogDemo() {
  return (
    <Oui.DialogEx
      triggerElement={<Oui.Button variant="outline">Show Dialog</Oui.Button>}
      role="alertdialog"
    >
      <Oui.DialogHeader>
        <Oui.Heading variant="alert" slot="title">
          Are you absolutely sure?
        </Oui.Heading>
        <Oui.DialogDescription>
          This action cannot be undone. This will permanently delete your
          account and remove your data from our servers.
        </Oui.DialogDescription>
      </Oui.DialogHeader>
      <Oui.DialogFooter>
        <Oui.Button variant="outline" slot="close" autoFocus>
          Cancel
        </Oui.Button>
        <Oui.Button slot="close">Continue</Oui.Button>
      </Oui.DialogFooter>
    </Oui.DialogEx>
  );
}

export function OuiAlertDialogDemo1() {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Oui.Button variant="outline" onPress={() => setOpen(true)}>
        Show Dialog
      </Oui.Button>
      <Oui.DialogEx3
        isOpen={isOpen}
        onOpenChange={setOpen}
        title="Are you absolutely sure?"
      >
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Oui.DialogEx3>
    </>
  );
}
