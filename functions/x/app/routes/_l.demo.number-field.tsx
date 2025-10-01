import type { Route } from "./+types/_l.demo.number-field";
import * as Oui from "@workspace/oui";
import * as Rac from "react-aria-components";
import { useSubmit } from "react-router";
import { z } from "zod";
import { DemoContainer } from "~/components/demo-container";

export const action = async ({ request }: { request: Request }) => {
  const schema = z.object({
    age: z.coerce.number().positive("Must be > 0.").int("Must be integer."),
    quantity: z.coerce
      .number()
      .positive("Must be > 0.")
      .int("Must be integer."),
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
      <Rac.Form
        method="post"
        validationBehavior="aria"
        validationErrors={actionData?.validationErrors}
        onSubmit={(e) => {
          e.preventDefault();
          void submit(e.currentTarget);
        }}
        className="grid w-full max-w-sm gap-6"
      >
        <Oui.NumberFieldEx
          name="age"
          placeholder="age"
          label="Age"
          description="This is your age."
        />
        <Oui.NumberFieldEx
          name="quantity"
          label="Quantity"
          description="Your best quantity."
        />
        <Oui.Button type="submit">Submit</Oui.Button>
      </Rac.Form>
      <pre>{JSON.stringify({ actionData }, null, 2)}</pre>
    </DemoContainer>
  );
}
