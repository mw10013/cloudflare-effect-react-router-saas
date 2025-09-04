import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

// React.FormEvent<HTMLFormElement>

export function Form({ className, ...props }: Rac.FormProps) {
  return (
    <Rac.Form
      className={twMerge("flex flex-col gap-4", className)}
      {...props}
    />
  );
}
