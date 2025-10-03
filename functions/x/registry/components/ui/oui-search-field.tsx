import * as Rac from "react-aria-components";
import { composeTailwindRenderProps } from "@/registry/components/ui/oui-base";
import { FieldError } from "@/registry/components/ui/oui-field-error";
import { Input } from "@/registry/components/ui/oui-input";
import { Label } from "@/registry/components/ui/oui-label";
import { Text } from "@/registry/components/ui/oui-text";

/**
 * Derived styles from shadcn FormItem
 */
export function SearchField({ className, ...props }: Rac.SearchFieldProps) {
  return (
    <Rac.SearchField
      className={composeTailwindRenderProps(className, "group grid gap-2")}
      {...props}
    />
  );
}

export interface SearchFieldExProps extends Rac.SearchFieldProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
  placeholder?: string;
}

export function SearchFieldEx({
  label,
  description,
  errorMessage,
  placeholder,
  ...rest
}: SearchFieldExProps) {
  return (
    <SearchField {...rest}>
      {label && <Label>{label}</Label>}
      <Input
        placeholder={placeholder}
        className="[&::-webkit-search-cancel-button]:hidden"
      />
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
    </SearchField>
  );
}
