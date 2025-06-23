import React from "react";
import { ChevronDown } from "lucide-react";
import * as Rac from "react-aria-components";
import { twJoin } from "tailwind-merge";
import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "./oui-base";
import { Heading } from "./oui-heading";

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
        "flex flex-1 items-start justify-between gap-4 py-4 text-left text-sm font-medium transition-all data-[hovered]:underline",
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
 * Derived from shadcn AccordionContent
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
        "group-data-[expanded]:animate-accordion-down group-data-[expanded=false]:animate-accordion-up overflow-hidden text-sm",
      )}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
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
