import * as Oui from "@workspace/oui";
import * as Rac from "react-aria-components";
import { twJoin } from "tailwind-merge";

export function OuiPaginationDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Oui.ListBoxEx1>
        <Oui.ListBoxItemEx1 variant="ghost">Previous</Oui.ListBoxItemEx1>
        <Oui.ListBoxItemEx1 variant="outline">1</Oui.ListBoxItemEx1>
        <Oui.ListBoxItemEx1 variant="outline" size="icon" aria-current="page">
          2
        </Oui.ListBoxItemEx1>
        <Oui.ListBoxItemEx1 variant="outline" size="icon">
          3
        </Oui.ListBoxItemEx1>
        <Oui.ListBoxItemEx1 variant="ghost">Next</Oui.ListBoxItemEx1>
      </Oui.ListBoxEx1>
      <Rac.ListBox
        aria-label="test-listbox"
        orientation="horizontal"
        selectionMode="single"
        className="flex flex-row gap-2"
      >
        <Rac.ListBoxItem
          className={twJoin(
            Oui.baseStyles,
            "rounded-md px-2.5 py-2 data-[hovered]:bg-red-500",
          )}
        >
          Alpha
        </Rac.ListBoxItem>
        <Rac.ListBoxItem className="data-[focus-visible]:border-ring data-[focus-visible]:ring-ring/50 rounded-md px-2.5 py-2 outline-none data-[hovered]:bg-red-500 data-[focus-visible]:ring-[3px]">
          Beta
        </Rac.ListBoxItem>
        {/* <Oui.ListBoxItemEx1 variant="outline">Alpha</Oui.ListBoxItemEx1>
        <Oui.ListBoxItemEx1 variant="outline">Beta</Oui.ListBoxItemEx1> */}
      </Rac.ListBox>
    </div>
  );
}
