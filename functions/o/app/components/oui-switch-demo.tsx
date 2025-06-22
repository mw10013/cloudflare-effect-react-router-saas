import * as Oui from "@workspace/oui";

export function OuiSwitchDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Oui.SwitchEx id="switch-demo-airplane-mode">Airplane Mode</Oui.SwitchEx>
      <Oui.SwitchEx
        id="switch-demo-bluetooth"
        defaultSelected
        className="group-data-[selected]:bg-blue-500 dark:group-data-[selected]:bg-blue-600"
      >
        Bluetooth
      </Oui.SwitchEx>
      <Oui.SwitchEx
        id="switch-demo-focus-mode"
        indicatorPosition="end"
        containerClassName="shadow-xs rounded-lg border p-4"
        className="leading-snug"
        description="Focus is shared across devices, and turns off when you leave the app."
      >
        <div className="font-medium">Share across devices</div>
      </Oui.SwitchEx>
      <div className="flex flex-col gap-4">
        <Oui.SwitchEx
          name="marketing_emails"
          descriptionClassName="leading-snug"
          description="Receive emails about new products, features, and more."
          indicatorPosition="end"
          // shadcn FormDemo FormItem: shadow-xs flex flex-row items-start justify-between rounded-lg border p-4
          containerClassName="shadow-xs rounded-lg border p-4"
          className="leading-snug"
        >
          Marketing emails
        </Oui.SwitchEx>
        <Oui.SwitchEx
          name="security_emails"
          descriptionClassName="leading-snug"
          description="Receive emails about your account security."
          indicatorPosition="end"
          // shadcn FormDemo FormItem: shadow-xs flex flex-row items-start justify-between rounded-lg border p-4
          containerClassName="shadow-xs rounded-lg border p-4"
          className="leading-normal"
          isDisabled
        >
          Security emails
        </Oui.SwitchEx>
      </div>
    </div>
  );
}
