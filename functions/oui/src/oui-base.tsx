import { composeRenderProps } from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * A tagged template literal function that acts like an identity function for Tailwind CSS class strings.
 * Its primary purpose is to enable `prettier-plugin-tailwindcss` to sort classes in standalone
 * string literals or template literals not otherwise covered by the plugin (e.g., outside JSX `className`).
 * @see {@link https://github.com/tailwindlabs/prettier-plugin-tailwindcss?tab=readme-ov-file#sorting-classes-in-template-literals}
 */
export const tw = (strings: TemplateStringsArray, ...values: string[]) =>
  String.raw({ raw: strings.raw }, ...values);

/**
 * Base styles for Oui components, including focus visibility and disabled states.
 * Shadcn UI generally uses a custom ring (`ring-ring/50 ring-[3px]`) with `outline-none` for `focus-visible`.
 * Deviations occur for specific components:
 * - Sliders/Resizables: Adjusted ring thickness/offset for small interactive parts.
 * - Menubar items: Use background changes for focus.
 * - Tabs content: May omit explicit focus rings.
 * - Input OTP: Uses `data-[active=true]` for slot highlighting.
 * This approach balances a consistent baseline with flexibility for component-specific needs.
 * outline-none to reset user agent styles especially on Chrome
 * cursor-not-allowed is omitted as it's mainly for form controls in shadcn; visual/interaction cues are sufficient
 */

export const focusVisibleStyles = tw`data-[focus-visible]:border-ring data-[focus-visible]:ring-ring/50 outline-none data-[focus-visible]:ring-[3px]`;
export const groupFocusVisibleStyles = tw`group-data-[focus-visible]:border-ring group-data-[focus-visible]:ring-ring/50 outline-none group-data-[focus-visible]:ring-[3px]`;
export const disabledStyles = tw`data-[disabled]:pointer-events-none data-[disabled]:opacity-50`;

/**
 * Composes Tailwind CSS classes with render props.
 * @param className - Static or function-based CSS classes.
 * @param tw - Tailwind classes to merge.
 * @returns Composed class string or function.
 * @example
 * ```tsx
 * const newClassName = composeTailwindRenderProps(className, [
 *   baseStyles,
 *   "data-[focused]:bg-accent data-[hovered]:bg-accent",
 * ]);
 * ```
 */
export function composeTailwindRenderProps<T>(
  className: string | ((v: T) => string) | undefined,
  tw: Parameters<typeof twMerge>[0],
): string | ((v: T) => string) {
  return composeRenderProps(className, (className) => twMerge(tw, className));
}
