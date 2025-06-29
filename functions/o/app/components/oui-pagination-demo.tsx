import * as Oui from "@workspace/oui";

export function OuiPaginationDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Oui.ListBoxEx1Pagination defaultSelectedKeys={["2"]}>
        <Oui.ListBoxItemEx1Pagination id="prev">
          Previous
        </Oui.ListBoxItemEx1Pagination>
        <Oui.ListBoxItemEx1Pagination id="1">1</Oui.ListBoxItemEx1Pagination>
        <Oui.ListBoxItemEx1Pagination id="2">2</Oui.ListBoxItemEx1Pagination>
        <Oui.ListBoxItemEx1Pagination id="3">3</Oui.ListBoxItemEx1Pagination>
        <Oui.ListBoxItemEx1Pagination id="next">
          Next
        </Oui.ListBoxItemEx1Pagination>
      </Oui.ListBoxEx1Pagination>
    </div>
  );
}
