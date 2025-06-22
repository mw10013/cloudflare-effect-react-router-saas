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
        containerClassName="flex items-center gap-6 rounded-lg border p-4 group-data-[selected]:border-blue-600"
        className="group-data-[selected]:bg-blue-500 dark:group-data-[selected]:bg-blue-600"
        description="Focus is shared across devices, and turns off when you leave the app."
      >
        <div className="font-medium">Share across devices</div>
      </Oui.SwitchEx>
    </div>
  );
}
