import * as Oui from "@workspace/oui";

export function OuiTextAreaDemo() {
  return (
    <div className="flex w-full flex-col gap-10">
      <Oui.TextArea placeholder="Type your message here." />
      <Oui.TextArea placeholder="Type your message here." aria-invalid="true" />
      <Oui.TextFieldEx name="textarea-demo-message" label="Label">
        <Oui.TextArea placeholder="Type your message here." rows={6} />
      </Oui.TextFieldEx>
      <Oui.TextFieldEx
        name="textarea-demo-message-2"
        label="With label and description"
        description="Type your message and press enter to send."
      >
        <Oui.TextArea placeholder="Type your message here." rows={6} />
      </Oui.TextFieldEx>
      <Oui.TextFieldEx name="textarea-demo-disabled" label="Disabled" isDisabled>
        <Oui.TextArea placeholder="Type your message here." />
      </Oui.TextFieldEx>
    </div>
  );
}
