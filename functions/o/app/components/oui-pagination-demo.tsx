import * as Oui from "@workspace/oui";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/ui/pagination";

export function OuiPaginationDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Oui.ListBoxEx1>
        <Oui.ListBoxItem className={Oui.buttonClassName({ variant: "ghost" })}>
          Previous
        </Oui.ListBoxItem>
        <Oui.ListBoxItem
          className={Oui.buttonClassName({ variant: "outline" })}
        >
          1
        </Oui.ListBoxItem>
        <Oui.ListBoxItem
          className={Oui.buttonClassName({ variant: "outline", size: "icon" })}
          aria-current="page"
        >
          2
        </Oui.ListBoxItem>
        <Oui.ListBoxItem
          className={Oui.buttonClassName({ variant: "outline", size: "icon" })}
        >
          3
        </Oui.ListBoxItem>
        <Oui.ListBoxItem className={Oui.buttonClassName({ variant: "ghost" })}>
          Next
        </Oui.ListBoxItem>
      </Oui.ListBoxEx1>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
