import { ChevronDown } from "lucide-react";
import * as Rac from "react-aria-components";
import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "@/registry/components/ui/oui-base";
import { Heading } from "@/registry/components/ui/oui-heading";

/**
 * Derived from shadcn AccordionItem
 */
export function Disclosure({ className, ...props }: Rac.DisclosureProps) {
  return (
    <Rac.Disclosure
      className={composeTailwindRenderProps(
        className,
        "group border-b last:border-b-0",
      )}
      {...props}
    />
  );
}

/**
 * Derived from shadcn AccordionTrigger
 */
export function DisclosureButton({
  className,
  children,
  ...props
}: Rac.ButtonProps) {
  return (
    <Rac.Button
      slot="trigger"
      className={composeTailwindRenderProps(className, [
        focusVisibleStyles,
        disabledStyles,
        "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all data-[hovered]:underline",
      ])}
      {...props}
    >
      {(renderProps) => (
        <>
          {typeof children === "function" ? children(renderProps) : children}
          <ChevronDown className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 group-data-[expanded]:rotate-180" />
        </>
      )}
    </Rac.Button>
  );
}

/**
 * Derived from shadcn AccordionContent.
 *
 * `Rac.DisclosurePanel` adds a `hidden` attribute when collapsed, preventing
 * exit animations.
 */
export function DisclosurePanel({
  className,
  children,
  ...props
}: Rac.DisclosurePanelProps) {
  return (
    <Rac.DisclosurePanel
      className={composeTailwindRenderProps(
        className,
        "grid text-sm transition-[grid-template-rows] duration-200 ease-out [grid-template-rows:0fr] group-data-[expanded]:[grid-template-rows:1fr]",
      )}
      {...props}
    >
      <div className="overflow-hidden">
        <div className="pb-4 pt-0">{children}</div>
      </div>
    </Rac.DisclosurePanel>
  );
}

export interface DisclosureExProps
  extends Omit<Rac.DisclosureProps, "children"> {
  title?: string;
  children?: Rac.DisclosurePanelProps["children"];
}

export function DisclosureEx({ title, children, ...props }: DisclosureExProps) {
  return (
    <Disclosure {...props}>
      <Heading variant="disclosure">
        <DisclosureButton>{title}</DisclosureButton>
      </Heading>
      <DisclosurePanel>{children}</DisclosurePanel>
    </Disclosure>
  );
}
