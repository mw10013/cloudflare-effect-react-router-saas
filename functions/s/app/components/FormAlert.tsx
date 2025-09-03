import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/ui/alert";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

export type FormActionResult =
  | {
      success: true;
      message?: string;
      details?: string[];
    }
  | {
      success: false;
      message?: string;
      details?: string[];
      validationErrors?: Rac.FormProps["validationErrors"];
    };

export function FormErrorAlert({
  formErrors,
  variant = "destructive",
  className,
  ...props
}: React.ComponentProps<typeof Alert> & { formErrors?: string[] }) {
  if (!formErrors || formErrors.length === 0) return null;
  return (
    <Alert variant={variant} className={twMerge("mb-4", className)} {...props}>
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {formErrors.map((err, i) => (
          <div key={i}>{err}</div>
        ))}
      </AlertDescription>
    </Alert>
  );
}
