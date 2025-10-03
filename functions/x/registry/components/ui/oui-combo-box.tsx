import { ChevronsUpDown } from "lucide-react";
import * as Rac from "react-aria-components";
import { Button } from "./oui-button";
import { FieldError } from "./oui-field-error";
import { Group } from "./oui-group";
import { Input } from "./oui-input";
import { Label } from "./oui-label";
import { Popover } from "./oui-popover";
import { Text } from "./oui-text";

export interface ComboBoxExProps<T extends object>
  extends Omit<Rac.ComboBoxProps<T>, "children"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
  placeholder?: string;
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function ComboBoxEx<T extends object>({
  label,
  description,
  errorMessage,
  placeholder,
  items,
  children,
  ...props
}: ComboBoxExProps<T>) {
  return (
    <Rac.ComboBox {...props}>
      {label && <Label>{label}</Label>}
      <Group>
        <Input variant="ghost" placeholder={placeholder} />
        <Button variant="ghost" size="icon">
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </Group>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover>
        <Rac.ListBox items={items}>{children}</Rac.ListBox>
      </Popover>
    </Rac.ComboBox>
  );
}
