import type { Route } from './+types/admin.stripe'
import * as Oui from '@workspace/oui'
import { SchemaEx } from '@workspace/shared'
import { Effect, Schema } from 'effect'
import * as Rac from 'react-aria-components'
import * as ReactRouterEx from '~/lib/ReactRouterEx'
import { Stripe } from '~/lib/Stripe'

export const action = ReactRouterEx.routeEffect(({ request }: Route.ActionArgs) =>
  Effect.gen(function* () {
    const FormDataSchema = Schema.Union(
      Schema.Struct({
        intent: Schema.Literal('seed')
      }),
      Schema.Struct({
        intent: Schema.Literal('sync_stripe_data', 'customer_subscription'),
        customerId: Schema.NonEmptyString
      })
    )
    const formData = yield* SchemaEx.decodeRequestFormData({ request, schema: FormDataSchema })
    let message: string | undefined
    if (formData.intent === 'seed') {
      yield* Stripe.seed()
      message = 'Seeded'
    }
    return {
      message,
      formData
    }
  }).pipe(SchemaEx.catchValidationError)
)

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  return (
    <div className="flex min-h-svh flex-col gap-2 p-6">
      {/* <Rac.Form method="post" validationErrors={actionData?.validationErrors} className="grid w-full max-w-sm gap-6"> */}
      <Rac.Form method="post" className="grid w-full max-w-sm gap-6">
        <Oui.Button name="intent" value="seed" type="submit">
          Seed
        </Oui.Button>
      </Rac.Form>
      <pre>{JSON.stringify(actionData, null, 2)}</pre>
    </div>
  )
}
