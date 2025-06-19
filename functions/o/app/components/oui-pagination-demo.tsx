import * as Oui from "@workspace/oui";
import * as Rac from "react-aria-components";
import { twJoin } from "tailwind-merge";

export function OuiPaginationDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Oui.ListBoxEx1 defaultSelectedKeys={["2"]}>
        <Oui.ListBoxItemEx1 id="prev">Previous</Oui.ListBoxItemEx1>
        <Oui.ListBoxItemEx1 id="1">1</Oui.ListBoxItemEx1>
        <Oui.ListBoxItemEx1 id="2" aria-current="page">
          2
        </Oui.ListBoxItemEx1>
        <Oui.ListBoxItemEx1 id="3">3</Oui.ListBoxItemEx1>
        <Oui.ListBoxItemEx1 id="next">Next</Oui.ListBoxItemEx1>
      </Oui.ListBoxEx1>
    </div>
  );
}
