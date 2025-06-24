import { DemoContainer } from "~/components/demo-container";
import { PaginationDemo } from "~/components/pagination-demo";
import { OuiPaginationDemo } from "~/components/oui-pagination-demo";

export default function RouteComponent() {
  return (
    <DemoContainer className="flex-row">
      <PaginationDemo />
      <OuiPaginationDemo />
    </DemoContainer>
  );
}
