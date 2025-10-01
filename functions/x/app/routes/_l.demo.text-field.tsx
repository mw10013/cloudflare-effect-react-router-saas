import type { Route } from "./+types/_l.demo.text-field";
import * as Oui from "@workspace/oui";
import * as Rac from "react-aria-components";
import { useSubmit } from "react-router";
import * as z from "zod";
import { DemoContainer } from "~/components/demo-container";

export const action = async ({ request }: { request: Request }) => {
  const schema = z.object({
    username: z.string().nonempty("Required."),
  });
  const parseResult = schema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parseResult.success) {
    const { formErrors, fieldErrors: validationErrors } = z.flattenError(
      parseResult.error,
    );
    return {
      formErrors,
      validationErrors,
    };
  }
  return { formData: parseResult.data };
};

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  return (
    <DemoContainer>
      {/* validationBehavior of 'aria': does not block submit, shows errors via ARIA attributes instead of browser UI */}
      <Rac.Form
        method="post"
        validationBehavior="aria"
        validationErrors={actionData?.validationErrors}
        onSubmit={(e) => {
          e.preventDefault();
          // eslint-disable-next-line @typescript-eslint/no-floating-promises -- React Router handles submission errors via actionData and error boundaries
          submit(e.currentTarget);
        }}
        className="grid w-full max-w-sm gap-6"
      >
        <Oui.TextFieldEx name="username" label="Username" isRequired />
        <Oui.Button type="submit">Submit</Oui.Button>
      </Rac.Form>
      <pre>{JSON.stringify({ actionData }, null, 2)}</pre>
    </DemoContainer>
  );
}
