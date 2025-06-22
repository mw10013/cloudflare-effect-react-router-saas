import * as Rac from "react-aria-components";
import { tv } from "tailwind-variants";

/**
 * Derived from shadcn DropdownMenuItem label and FormDescription.
 */
export const textStyles = tv({
  variants: {
    slot: {
      label: "text-sm",
      description: "text-muted-foreground text-sm",
    },
  },
});

type TextStylesSlotKey = keyof typeof textStyles.variants.slot;
function isTextStylesSlotKey(value: unknown): value is TextStylesSlotKey {
  return (
    typeof value === "string" &&
    Object.keys(textStyles.variants.slot).includes(value)
  );
}

export const Text = ({
  elementType: elementTypeProp,
  slot,
  className,
  ...props
}: Rac.TextProps) => {
  const elementType =
    !elementTypeProp && slot === "description" ? "p" : elementTypeProp;
  return (
    <Rac.Text
      data-slot={slot === "description" ? "form-description" : undefined}
      elementType={elementType}
      slot={slot}
      className={textStyles({
        slot: isTextStylesSlotKey(slot) ? slot : undefined,
        className,
      })}
      {...props}
    />
  );
};
