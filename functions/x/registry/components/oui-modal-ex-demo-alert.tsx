import { DialogEx } from "@/registry/components/oui-dialog-ex";
import { Button } from "@/registry/components/ui/oui-button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/registry/components/ui/oui-dialog";
import { Heading } from "@/registry/components/ui/oui-heading";

export default function Component() {
  return (
    <DialogEx
      triggerElement={<Button variant="outline">Alert Modal</Button>}
      role="alertdialog"
    >
      <DialogHeader>
        <Heading variant="alert" slot="title">
          Are you absolutely sure?
        </Heading>
        <DialogDescription>
          This action cannot be undone. This will permanently delete your
          account and remove your data from our servers.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" slot="close" autoFocus>
          Cancel
        </Button>
        <Button slot="close">Continue</Button>
      </DialogFooter>
    </DialogEx>
  );
}
