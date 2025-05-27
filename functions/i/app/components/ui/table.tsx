import { IconChevronLgDown, IconHamburger } from "@intentui/icons"
import type {
  CellProps,
  ColumnProps,
  ColumnResizerProps,
  TableHeaderProps as HeaderProps,
  RowProps,
  TableBodyProps,
  TableProps as TablePrimitiveProps,
} from "react-aria-components"
import {
  Button,
  Cell,
  Collection,
  Column,
  ColumnResizer as ColumnResizerPrimitive,
  ResizableTableContainer,
  Row,
  TableBody as TableBodyPrimitive,
  TableHeader as TableHeaderPrimitive,
  Table as TablePrimitive,
  useTableOptions,
} from "react-aria-components"

import { Checkbox } from "~/components/ui/checkbox"
import { composeTailwindRenderProps } from "~/lib/primitive"
import { createContext, use } from "react"
import { twJoin, twMerge } from "tailwind-merge"

interface TableProps extends Omit<TablePrimitiveProps, "className"> {
  allowResize?: boolean
  className?: string
  bleed?: boolean
  ref?: React.Ref<HTMLTableElement>
}

const TableContext = createContext<TableProps>({
  allowResize: false,
})

const useTableContext = () => use(TableContext)

const Root = (props: TableProps) => {
  return (
    <TablePrimitive
      className="w-full min-w-full caption-bottom text-sm outline-hidden [--table-selected-bg:color-mix(in_oklab,var(--color-primary)_5%,white_90%)] dark:[--table-selected-bg:color-mix(in_oklab,var(--color-primary)_25%,black_70%)]"
      {...props}
    />
  )
}

const Table = ({ allowResize, className, bleed, ref, ...props }: TableProps) => {
  return (
    <TableContext.Provider value={{ allowResize, bleed }}>
      <div className="flow-root">
        <div
          className={twMerge(
            "-mx-(--gutter) relative overflow-x-auto whitespace-nowrap has-data-[slot=table-resizable-container]:overflow-auto",
            "[--gutter-y:--spacing(2.5)] [--gutter:--spacing(4)]",
            className,
          )}
        >
          <div
            className={twJoin("inline-block min-w-full align-middle", !bleed && "sm:px-(--gutter)")}
          >
            {allowResize ? (
              <ResizableTableContainer data-slot="table-resizable-container">
                <Root ref={ref} {...props} />
              </ResizableTableContainer>
            ) : (
              <Root {...props} ref={ref} />
            )}
          </div>
        </div>
      </div>
    </TableContext.Provider>
  )
}

const ColumnResizer = ({ className, ...props }: ColumnResizerProps) => (
  <ColumnResizerPrimitive
    {...props}
    className={composeTailwindRenderProps(
      className,
      "absolute top-0 right-0 bottom-0 grid w-px &[data-resizable-direction=left]:cursor-e-resize &[data-resizable-direction=right]:cursor-w-resize touch-none place-content-center px-1 data-[resizable-direction=both]:cursor-ew-resize [&[data-resizing]>div]:bg-primary",
    )}
  >
    <div className="h-full w-px bg-border py-(--gutter-y)" />
  </ColumnResizerPrimitive>
)

const TableBody = <T extends object>(props: TableBodyProps<T>) => (
  <TableBodyPrimitive data-slot="table-body" {...props} />
)

interface TableColumnProps extends ColumnProps {
  className?: string
  isResizable?: boolean
}

const TableColumn = ({ isResizable = false, className, ...props }: TableColumnProps) => {
  const { bleed } = useTableContext()
  return (
    <Column
      data-slot="table-column"
      {...props}
      className={composeTailwindRenderProps(
        className,
        twJoin(
          "text-left font-medium text-muted-fg",
          "relative allows-sorting:cursor-default outline-hidden data-dragging:cursor-grabbing",
          "px-(--gutter) py-(--gutter-y)",
          !bleed
            ? "sm:last:pr-1 sm:first:pl-1"
            : "first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2))",
          isResizable && "overflow-hidden truncate",
        ),
      )}
    >
      {(values) => (
        <div className="flex items-center gap-2 **:data-[slot=icon]:shrink-0">
          <>
            {typeof props.children === "function" ? props.children(values) : props.children}
            {values.allowsSorting && (
              <span
                className={twMerge(
                  "grid size-[1.15rem] flex-none shrink-0 place-content-center rounded bg-secondary text-fg *:data-[slot=icon]:size-3.5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:transition-transform *:data-[slot=icon]:duration-200",
                  values.isHovered ? "bg-secondary-fg/10" : "",
                  className,
                )}
              >
                <IconChevronLgDown
                  className={values.sortDirection === "ascending" ? "rotate-180" : ""}
                />
              </span>
            )}
            {isResizable && <ColumnResizer />}
          </>
        </div>
      )}
    </Column>
  )
}

interface TableHeaderProps<T extends object> extends HeaderProps<T> {
  ref?: React.Ref<HTMLTableSectionElement>
}

const TableHeader = <T extends object>({
  children,
  ref,
  columns,
  className,
  ...props
}: TableHeaderProps<T>) => {
  const { bleed } = useTableContext()
  const { selectionBehavior, selectionMode, allowsDragging } = useTableOptions()
  return (
    <TableHeaderPrimitive
      data-slot="table-header"
      className={composeTailwindRenderProps(className, "border-b")}
      ref={ref}
      {...props}
    >
      {allowsDragging && (
        <Column
          data-slot="table-column"
          className={twMerge(
            "w-0 max-w-8 px-(--gutter)",
            !bleed
              ? "sm:last:pr-1 sm:first:pl-1"
              : "first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2))",
          )}
        />
      )}
      {selectionBehavior === "toggle" && (
        <Column
          data-slot="table-column"
          className={twMerge(
            "w-0 max-w-8 px-(--gutter)",
            !bleed
              ? "sm:last:pr-1 sm:first:pl-1"
              : "first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2))",
          )}
        >
          {selectionMode === "multiple" && <Checkbox slot="selection" />}
        </Column>
      )}
      <Collection items={columns}>{children}</Collection>
    </TableHeaderPrimitive>
  )
}

interface TableRowProps<T extends object> extends RowProps<T> {
  ref?: React.Ref<HTMLTableRowElement>
}

const TableRow = <T extends object>({
  children,
  className,
  columns,
  id,
  ref,
  ...props
}: TableRowProps<T>) => {
  const { selectionBehavior, allowsDragging } = useTableOptions()
  return (
    <Row
      ref={ref}
      data-slot="table-row"
      id={id}
      {...props}
      className={composeTailwindRenderProps(
        className,
        twJoin(
          "group focus-visible:-outline-offset-2 relative cursor-default border-b selected:bg-(--table-selected-bg) text-muted-fg dragging:outline outline-blue-500 ring-primary last:border-b-0 selected:hover:bg-(--table-selected-bg)/70 focus-visible:outline dark:selected:hover:bg-[color-mix(in_oklab,var(--color-primary)_30%,black_70%)]",
          ((props.href && !props.isDisabled) || props.onAction) &&
            "cursor-default hover:bg-secondary/50 hover:text-secondary-fg",
        ),
      )}
    >
      {allowsDragging && (
        <TableCell className="cursor-grab dragging:cursor-grabbing ring-primary">
          <Button
            slot="drag"
            className="grid place-content-center rounded-xs px-[calc(var(--gutter)/2)] outline-hidden focus-visible:ring focus-visible:ring-ring"
          >
            <IconHamburger />
          </Button>
        </TableCell>
      )}
      {selectionBehavior === "toggle" && (
        <TableCell>
          <Checkbox slot="selection" />
        </TableCell>
      )}
      <Collection items={columns}>{children}</Collection>
    </Row>
  )
}

const TableCell = ({ className, ...props }: CellProps) => {
  const { allowResize, bleed } = useTableContext()
  return (
    <Cell
      data-slot="table-cell"
      {...props}
      className={composeTailwindRenderProps(
        className,
        twJoin(
          "group px-(--gutter) py-(--gutter-y) align-middle outline-hidden",
          !bleed
            ? "sm:last:pr-1 sm:first:pl-1"
            : "first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2))",
          allowResize && "overflow-hidden truncate",
        ),
      )}
    />
  )
}

Table.Body = TableBody
Table.Cell = TableCell
Table.Column = TableColumn
Table.Header = TableHeader
Table.Row = TableRow

export type { TableProps, TableColumnProps, TableRowProps }
export { Table }
