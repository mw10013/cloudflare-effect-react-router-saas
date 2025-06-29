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
        Show Confirm
      </Oui.Button>
      <Oui.DialogEx1Alert
        isOpen={isOpen}
        onOpenChange={setOpen}
        title="Are you absolutely sure?"
      >
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Oui.DialogEx1Alert>
    </>
  );
}

export function OuiAlertDialogDemo2() {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Oui.Button variant="outline" onPress={() => setOpen(true)}>
        Show Acknowledgement
      </Oui.Button>
      <Oui.DialogEx1Alert
        isOpen={isOpen}
        onOpenChange={setOpen}
        type="acknowledge"
        title="Session Expired"
      >
        Your session has expired. Please log in again to continue.
      </Oui.DialogEx1Alert>
    </>
  );
}

export function OuiAlertDialogDemo3() {
  const alertDialog = Oui.useDialogEx1Alert();

  const handleConfirm = async () => {
    const confirmed = await alertDialog.show({
      title: "Are you sure?",
      children: "This action cannot be undone.",
      confirmLabel: "Delete",
    });

    if (confirmed) {
      // eslint-disable-next-line no-console
      console.log("Confirmed!");
    } else {
      // eslint-disable-next-line no-console
      console.log("Cancelled!");
    }
  };

  return (
    <Oui.Button variant="outline" onPress={handleConfirm}>
      Show Programmatic Confirm
    </Oui.Button>
  );
}
