import { ChevronDown, ChevronUp } from "lucide-react";
import * as Rac from "react-aria-components";
import { composeTailwindRenderProps } from "./oui-base";
import { FieldError } from "./oui-field-error";
import { Group } from "./oui-group";
import { Input } from "./oui-input";
import { Label } from "./oui-label";
import { Text } from "./oui-text";

export function NumberField({ className, ...props }: Rac.NumberFieldProps) {
  return (
    <Rac.NumberField
      className={composeTailwindRenderProps(className, "group grid gap-2")}
      {...props}
    />
  );
}

export interface NumberFieldExProps
  extends Omit<Rac.NumberFieldProps, "children"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
  placeholder?: string;
}

/**
 * Derived from https://originui.com/inputs
 */
export function NumberFieldEx({
  label,
  description,
  errorMessage,
  placeholder,
  ...props
}: NumberFieldExProps) {
  return (
    <NumberField {...props}>
      {label && <Label>{label}</Label>}
      <Group>
        <Input
          variant="ghost"
          placeholder={placeholder}
          className="tabular-nums"
        />
        <div className="flex h-[calc(100%+2px)] flex-col">
          <Rac.Button
            slot="increment"
            className="border-input bg-background text-muted-foreground/80 hover:bg-accent hover:text-foreground -me-px flex h-1/2 w-6 flex-1 items-center justify-center border text-sm transition-shadow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronUp size={12} strokeWidth={2} aria-hidden="true" />
          </Rac.Button>
          <Rac.Button
            slot="decrement"
            className="border-input bg-background text-muted-foreground/80 hover:bg-accent hover:text-foreground -me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border text-sm transition-shadow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDown size={12} strokeWidth={2} aria-hidden="true" />
          </Rac.Button>
        </div>
      </Group>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
    </NumberField>
  );
}

/*
https://originui.com/inputs
// Dependencies: pnpm install lucide-react react-aria-components

"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Button, Group, Input, Label, NumberField } from "react-aria-components";

export default function InputDemo() {
  return (
    <NumberField
      defaultValue={99}
      formatOptions={{
        style: "currency",
        currency: "EUR",
        currencySign: "accounting",
      }}
    >
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Number input with chevrons</Label>
        <Group className="relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20">
          <Input className="flex-1 bg-background px-3 py-2 tabular-nums text-foreground focus:outline-none" />
          <div className="flex h-[calc(100%+2px)] flex-col">
            <Button
              slot="increment"
              className="-me-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronUp size={12} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              slot="decrement"
              className="-me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronDown size={12} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>
        </Group>
      </div>
      <p className="mt-2 text-xs text-muted-foreground" role="region" aria-live="polite">
        Built with{" "}
        <a
          className="underline hover:text-foreground"
          href="https://react-spectrum.adobe.com/react-aria/DateField.html"
          target="_blank"
          rel="noopener nofollow"
        >
          React Aria
        </a>
      </p>
    </NumberField>
  );
}
*/
