import type { Route } from "./+types/_l.demo.text-field";
import * as Oui from "@workspace/oui";
import * as Rac from "react-aria-components";
import { useSubmit } from "react-router";
import * as z from "zod";
import { DemoContainer } from "~/components/demo-container";

export const action = async ({ request }: { request: Request }) => {
  const schema = z.object({
    username: z.string().min(1, "Required"),
  });
  const result = schema.safeParse(Object.fromEntries(await request.formData()));
  if (result.success) {
    return { formData: result.data };
  }
  const flattened = z.flattenError(result.error);
  return {
    formErrors: flattened.formErrors,
    validationErrors: flattened.fieldErrors,
  };
};

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  return (
    <DemoContainer>
      <Rac.Form
        method="post"
        validationBehavior="aria"
        validationErrors={actionData?.validationErrors}
        onSubmit={(e) => {
          e.preventDefault();
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
