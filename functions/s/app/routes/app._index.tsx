import { Effect } from 'effect'
import { redirect } from 'react-router'
import { IdentityMgr } from '~/lib/IdentityMgr'
import * as ReactRouterEx from '~/lib/ReactRouterEx'

export const loader = ReactRouterEx.routeEffect(({ context }) =>
  Effect.gen(function* () {
    const sessionUser = yield* Effect.fromNullable(context.get(ReactRouterEx.appLoadContext).session.get('sessionUser'))
    const account = yield* IdentityMgr.getAccountForUser(sessionUser)
    return redirect(`/app/${account.accountId}`)
  })
)
