import { Stripe } from "stripe";

/*

https://docs.stripe.com/checkout/fulfillment
https://github.com/t3dotgg/stripe-recommendations

Endpoint URL https://saas-production.devxo.workers.dev/api/stripe/webhook
API version 2025-02-24.acacia
Listening to
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

2025-07-30.basil
*/