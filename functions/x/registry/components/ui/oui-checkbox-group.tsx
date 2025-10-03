import * as Rac from "react-aria-components";
import { composeTailwindRenderProps } from "@/registry/components/ui/oui-base";
import { FieldError } from "@/registry/components/ui/oui-field-error";
import { Label } from "@/registry/components/ui/oui-label";
import { Text } from "@/registry/components/ui/oui-text";

export interface CheckboxGroupExProps extends Rac.CheckboxGroupProps {
  labelClassName?: string;
  label?: React.ReactNode;
  descriptionClassName?: string;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
}

/**
 * Derived from shadcn FormDemo FormItem and div
 */
export function CheckboxGroupEx({
  labelClassName,
  label,
  descriptionClassName,
  description,
  errorMessage,
  className,
  children,
  ...props
}: CheckboxGroupExProps) {
  return (
    <Rac.CheckboxGroup
      {...props}
      className={composeTailwindRenderProps(className, "flex flex-col gap-4")}
    >
      {(renderProps) => (
        <>
          <div>
            <Label className={labelClassName}>{label}</Label>
            {description && (
              <Text className={descriptionClassName} slot="description">
                {description}
              </Text>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {typeof children === "function" ? children(renderProps) : children}
          </div>
          <FieldError>{errorMessage}</FieldError>
        </>
      )}
    </Rac.CheckboxGroup>
  );
}
