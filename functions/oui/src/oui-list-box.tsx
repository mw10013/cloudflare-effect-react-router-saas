import type { ButtonProps } from "./oui-button";
import { Check } from "lucide-react";
import * as Rac from "react-aria-components";
import { baseStyles, composeTailwindRenderProps } from "./oui-base";
import { buttonStyles } from "./oui-button";

/** Styles derived from shadcn SelectItem.
 * https://github.com/adobe/react-spectrum/issues/7601
 */
export const ListBoxItem = <T extends object>({
  className,
  children,
  ...props
}: Rac.ListBoxItemProps<T>) => (
  <Rac.ListBoxItem
    {...props}
    textValue={
      props.textValue || (typeof children === "string" ? children : undefined)
    }
    className={composeTailwindRenderProps(className, [
      baseStyles,
      "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
      "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      "data-[focused]:bg-accent data-[focused]:text-accent-foreground",
      "data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
    ])}
  >
    {Rac.composeRenderProps(
      children,
      (
        children,
        renderProps: Parameters<
          Extract<
            React.ComponentProps<typeof Rac.ListBoxItem>["children"],
            (...args: any) => any
          >
        >[0],
      ) => (
        <>
          {renderProps.isSelected && (
            <span className="absolute right-2 flex size-3.5 items-center justify-center">
              <Check className="size-4" />
            </span>
          )}
          {children}
        </>
      ),
    )}
  </Rac.ListBoxItem>
);

/** Styles derived from shadcn CommandItem, adapted for a multi-line layout. */
// export const listBoxItemExStyles = tv({
//   extend: baseStyles,
//   base: "outline-hidden [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default select-none flex-col items-start gap-2 rounded-sm px-4 py-2 text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
//   variants: {
//     isSelected: {
//       true: "bg-accent text-accent-foreground",
//     },
//     isFocused: {
//       true: "bg-accent text-accent-foreground",
//     },
//     isHovered: {
//       true: "bg-accent text-accent-foreground",
//     },
//   },
// });

// export interface ListBoxItemExProps
//   extends Omit<Rac.ListBoxItemProps, "children"> {
//   label: string;
//   description: string;
// }

// export const ListBoxItemEx = <T extends object>({
//   textValue,
//   className,
//   label,
//   description,
//   ...props
// }: ListBoxItemExProps) => (
//   <Rac.ListBoxItem
//     {...props}
//     textValue={textValue || label}
//     className={Rac.composeRenderProps(className, (className, renderProps) =>
//       listBoxItemExStyles({ ...renderProps, className }),
//     )}
//   >
//     <Text slot="label">{label}</Text>
//     <Text slot="description">{description}</Text>
//   </Rac.ListBoxItem>
// );

/**
 * Horizontal ListBox styled for pagination controls (e.g., page numbers, next/prev).
 * Example:
 *  <ListBoxEx1 defaultSelectedKeys={["2"]}>
 *    <ListBoxItemEx1 id="prev">Previous</ListBoxItemEx1>
 *    <ListBoxItemEx1 id="1">1</ListBoxItemEx1>
 *    <ListBoxItemEx1 id="2">2</ListBoxItemEx1>
 *    <ListBoxItemEx1 id="3">3</ListBoxItemEx1>
 *    <ListBoxItemEx1 id="next">Next</ListBoxItemEx1>
 *  </ListBoxEx1>
 */
export const ListBoxEx1 = <T extends object>({
  className,
  ...props
}: Rac.ListBoxProps<T>) => (
  <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
    <Rac.ListBox
      orientation="horizontal"
      selectionMode="single"
      className={composeTailwindRenderProps(
        className,
        "flex flex-row items-center gap-1",
      )}
      {...props}
    />
  </nav>
);

/**
 * Pagination item styled as a button. Selected items use outline variant, others use ghost.
 */
export const ListBoxItemEx1 = <T extends object>({
  className,
  ...props
}: Rac.ListBoxItemProps<T>) => (
  <Rac.ListBoxItem
    className={Rac.composeRenderProps(className, (className, renderProps) =>
      buttonStyles({
        ...renderProps,
        variant: renderProps.isSelected ? "outline" : "ghost",
        className,
      }),
    )}
    {...props}
  />
);
