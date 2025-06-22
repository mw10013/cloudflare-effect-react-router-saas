import * as Rac from "react-aria-components";
import { baseStyles, composeTailwindRenderProps } from "./oui-base";

/**
 * TextArea component for multi-line text input.
 * Derived from shadcn Textarea.
 * Can be nested inside TextFieldEx for label and description.
 *
 * @example
 * ```tsx
 * <Oui.TextFieldEx
 *   name="bio"
 *   label="Bio"
 *   description="You can mention other users and organizations."
 * >
 *   <Oui.TextArea
 *     className="resize-none"
 *     placeholder="Tell us a little bit about yourself"
 *   />
 * </Oui.TextFieldEx>
 * ```
 */
export const TextArea = ({ className, ...props }: Rac.TextAreaProps) => (
  <Rac.TextArea
    className={composeTailwindRenderProps(className, [
      baseStyles,
      "border-input placeholder:text-muted-foreground dark:bg-input/30 field-sizing-content shadow-xs flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base transition-[color,box-shadow] md:text-sm",
      "data-[invalid]:ring-destructive/20 dark:data-[invalid]:ring-destructive/40 data-[invalid]:border-destructive",
      "data-[disabled]:cursor-not-allowed",
    ])}
    {...props}
  />
);
