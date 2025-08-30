```
pnpm -F s test --project d1 auth
```

## TODO

- limit 2 on ensure
- billing: review, cancel, restore
- pricing: already subscribed behavior
- restrict auth api
- sign out a11y in sidebar
- stripe
  - authorizeReference
  - referenceId -> organizationId
  - trial period
- playwright
- admin
  - customers
  - sessions
- deploy  
- agent 

## Better-Auth

- https://github.com/Bekacru/better-call/blob/main/src/error.ts
- resend: true is creating a duplicate invite instead of reusing the existing one: https://github.com/better-auth/better-auth/issues/3507
- Create organization on user sign-up: https://github.com/better-auth/better-auth/issues/2010
  - feat: allow create an org on signup and set active org on sign in: https://github.com/better-auth/better-auth/pull/3076
- Async operations don't work inside databaseHooks on Cloudflare Workers: https://github.com/better-auth/better-auth/issues/2841
- The inferred type of 'auth' cannot be named without a reference: https://github.com/better-auth/better-auth/issues/2123

## Stripe

- https://docs.stripe.com/checkout/fulfillment

### Events
- https://www.better-auth.com/docs/plugins/stripe#set-up-stripe-webhooks

```
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
```

- https://github.com/t3dotgg/stripe-recommendations

```
checkout.session.completed
customer.subscription.created
customer.subscription.deleted
customer.subscription.paused
customer.subscription.pending_update_applied
customer.subscription.pending_update_expired
customer.subscription.resumed
customer.subscription.trial_will_end
customer.subscription.updated
invoice.marked_uncollectible
invoice.paid
invoice.payment_action_required
invoice.payment_failed
invoice.payment_succeeded
invoice.upcoming
payment_intent.created
payment_intent.payment_failed
payment_intent.succeeded
```

- Set API version in Stripe Workbench and confirm it matches version used by Stripe service.
- stripe trigger payment_intent.succeeded
- stripe trigger customer.subscription.updated

- https://docs.stripe.com/development
- https://docs.stripe.com/workbench/guides#view-api-versions

- Prevent customer creation race conditions: https://github.com/stripe/stripe-node/issues/476#issuecomment-402541143
- https://docs.stripe.com/api/idempotent_requests

- https://github.com/stripe/stripe-node
- https://docs.stripe.com/api?lang=node
- https://github.com/nextjs/saas-starter
- https://www.youtube.com/watch?v=Wdyndb17K58&t=173s

```
Double subscriptions are not an issue when you create a customer first, then create a payment intent for that customer and then load your checkout forms using that intent. It won't matter whether the user goes back, forward, refreshes or whatever. As long as the payment intent doesn't change, it won't be a double subscription. Also a lot of projects actually do allow multiple subscriptions, so they can't just make such a critical option on by default (limit to 1). On the price IDs between environments - use price lookup keys instead.
```

### Disable Cash App Pay

- https://github.com/t3dotgg/stripe-recommendations?tab=readme-ov-file#disable-cash-app-pay
- Settings | Payments | Payment methods

### Limit Customers to One Subscription

- https://github.com/t3dotgg/stripe-recommendations?tab=readme-ov-file#enable-limit-customers-to-one-subscription
- https://docs.stripe.com/payments/checkout/limit-subscriptions
- https://billing.stripe.com/p/login/test_3cs9EBfMn4Qn7Ze144

### Webhook

- stripe listen --load-from-webhooks-api --forward-to localhost:8787
  - Must have stripe webhook endpoint url with path /api/stripe/webhook
  - STRIPE_WEBHOOK_SECRET must align with listen secret
- stripe listen --forward-to localhost:8787/api/stripe/webhook
- stripe listen --print-secret

### Billing Portal

- Settings | Billing | Customer portal
- https://docs.stripe.com/customer-management/activate-no-code-customer-portal
- https://billing.stripe.com/p/login/test_9AQeYV6bN1Eb6VafYZ

### Testing Payments

To test Stripe payments, use the following test card details:

- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3-digit number
