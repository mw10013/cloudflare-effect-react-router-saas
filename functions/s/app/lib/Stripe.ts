import type { Stripe as StripeType } from "stripe";
import type { UserId } from "./Domain";
import { ConfigEx, ErrorEx } from "@workspace/shared";
import {
  Cause,
  Config,
  ConfigError,
  Effect,
  Either,
  Option,
  Predicate,
  Redacted,
  Schema,
} from "effect";
import { Stripe as StripeClass } from "stripe";
import { Email } from "./Domain";
import { IdentityMgr } from "./IdentityMgr";

export class Stripe extends Effect.Service<Stripe>()("Stripe", {
  accessors: true,
  dependencies: [IdentityMgr.Default],
  effect: Effect.gen(function* () {
    const STRIPE_SECRET_KEY = yield* Config.redacted("STRIPE_SECRET_KEY");
    const stripe = new StripeClass(Redacted.value(STRIPE_SECRET_KEY), {
      apiVersion: "2025-05-28.basil", // See the doc string for apiVersion.
    });
    const identityMgr = yield* IdentityMgr;
    const allowedEvents: StripeType.Event.Type[] = [
      "checkout.session.completed",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "customer.subscription.paused",
      "customer.subscription.resumed",
      "customer.subscription.pending_update_applied",
      "customer.subscription.pending_update_expired",
      "customer.subscription.trial_will_end",
      "invoice.paid",
      "invoice.payment_failed",
      "invoice.payment_action_required",
      "invoice.upcoming",
      "invoice.marked_uncollectible",
      "invoice.payment_succeeded",
      "payment_intent.succeeded",
      "payment_intent.payment_failed",
      "payment_intent.canceled",
    ];

    const stripeDo = yield* ConfigEx.object("STRIPE_DO").pipe(
      Config.mapOrFail((object) =>
        Predicate.hasProperty(object, "idFromName") &&
        typeof object.idFromName === "function"
          ? Either.right(object as Env["STRIPE_DO"])
          : Either.left(
              ConfigError.InvalidData(
                [],
                `Expected a DurableObjectNamespace but received ${object}`,
              ),
            ),
      ),
    );
    const id = stripeDo.idFromName("stripe");
    const stub = stripeDo.get(id);

    const getSubscriptionForCustomer = (
      customerId: NonNullable<StripeType.SubscriptionListParams["customer"]>,
    ) =>
      Effect.tryPromise(() =>
        stripe.subscriptions.list({
          customer: customerId,
          limit: 1,
          status: "all",
          expand: ["data.items", "data.items.data.price"],
        }),
      ).pipe(Effect.map((result) => Option.fromNullable(result.data[0])));

    const syncStripeData = (customerId: string) =>
      // We do not handle multiple subscriptions.
      getSubscriptionForCustomer(customerId).pipe(
        Effect.flatMap((subscriptionOption) =>
          Option.match(subscriptionOption, {
            onNone: () =>
              // Stripe test environment deletes stale subscriptions.
              identityMgr.setAccountStripeSubscription({
                stripeCustomerId: customerId,
                stripeSubscriptionId: null,
                stripeProductId: null,
                planName: null,
                subscriptionStatus: null,
              }),
            onSome: (subscription) => {
              const stripeProductId = subscription.items.data[0].price.product;
              const planName = subscription.items.data[0].price.lookup_key;
              return Predicate.isString(stripeProductId) &&
                Predicate.isString(planName)
                ? identityMgr.setAccountStripeSubscription({
                    stripeCustomerId: customerId,
                    stripeSubscriptionId: subscription.id,
                    stripeProductId,
                    planName,
                    subscriptionStatus: subscription.status,
                  })
                : Effect.fail(
                    new Error(
                      `syncStripeData: price product (${stripeProductId}) and lookup key (${planName}) must be strings`,
                    ),
                  );
            },
          }).pipe(Effect.asVoid),
        ),
      );
    return {
      getPrices: () =>
        Effect.tryPromise(() =>
          stripe.prices.list({
            lookup_keys: ["base", "plus"],
            expand: ["data.product"],
          }),
        ).pipe(
          Effect.map((priceList) =>
            priceList.data.sort((a, b) =>
              a.lookup_key && b.lookup_key
                ? a.lookup_key.localeCompare(b.lookup_key)
                : 0,
            ),
          ),
        ),
      createBillingPortalSession: (
        props: Pick<
          {
            [K in keyof StripeType.BillingPortal.SessionCreateParams]-?: NonNullable<
              StripeType.BillingPortal.SessionCreateParams[K]
            >;
          },
          "customer" | "return_url"
        >,
      ) =>
        Effect.tryPromise(() =>
          stripe.billingPortal.configurations.list(),
        ).pipe(
          Effect.filterOrFail(
            (result) => result.data.length > 0,
            () => new Error("No billing portal configuration found"),
          ),
          Effect.map((result) => result.data[0]),
          Effect.flatMap((configuration) =>
            Effect.tryPromise(() =>
              stripe.billingPortal.sessions.create({
                ...props,
                configuration: configuration.id,
              }),
            ),
          ),
        ),
      getSubscriptionForCustomer,
      // https://github.com/t3dotgg/stripe-recommendations?tab=readme-ov-file#checkout-flow
      ensureStripeCustomerId: ({
        userId,
        email,
      }: {
        userId: UserId;
        email: Email;
      }) =>
        Effect.gen(function* () {
          const account = yield* identityMgr.getAccountForUser({ userId });
          if (account.stripeCustomerId)
            return {
              stripeCustomerId: account.stripeCustomerId,
              stripeSubscriptionId: account.stripeSubscriptionId,
            };
          // Test environment may have seeded stripe customers
          const {
            data: [existingCustomer],
          } = yield* Effect.tryPromise(() =>
            stripe.customers.list({
              email,
              limit: 1,
            }),
          );
          const customer = existingCustomer
            ? existingCustomer
            : yield* Effect.tryPromise(() =>
                stripe.customers.create({
                  email,
                  // metadata: { userId: userId.toString() } // DO NOT FORGET THIS
                }),
              );
          yield* identityMgr.setAccountStripeCustomerId({
            userId,
            stripeCustomerId: customer.id,
          });
          return {
            stripeCustomerId: customer.id,
            stripeSubscriptionId: null,
          };
        }),
      createCheckoutSession: ({
        customer,
        client_reference_id,
        success_url,
        cancel_url,
        price,
      }: Pick<
        {
          [K in keyof StripeType.Checkout.SessionCreateParams]-?: NonNullable<
            StripeType.Checkout.SessionCreateParams[K]
          >;
        },
        "customer" | "client_reference_id" | "success_url" | "cancel_url"
      > & { price: string }) =>
        Effect.tryPromise(() =>
          stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
              {
                price,
                quantity: 1,
              },
            ],
            mode: "subscription",
            success_url,
            cancel_url,
            customer,
            client_reference_id,
            allow_promotion_codes: true,
            subscription_data: {
              trial_period_days: 14,
            },
          }),
        ),
      finalizeCheckoutSession: (sessionId: string) =>
        Effect.tryPromise(() =>
          stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["customer"],
          }),
        ).pipe(
          Effect.flatMap((session) =>
            Option.fromNullable(session.customer).pipe(
              Option.filterMap((v) =>
                v !== null && typeof v !== "string"
                  ? Option.some(v)
                  : Option.none(),
              ),
            ),
          ),
          Effect.flatMap((customer) => syncStripeData(customer.id)),
        ),
      getCheckoutSession: (sessionId: string) =>
        Effect.tryPromise(() =>
          stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["customer"],
          }),
        ),

      syncStripeData,

      handleWebhook: (request: Request) =>
        Effect.gen(function* () {
          const signature = yield* Effect.fromNullable(
            request.headers.get("Stripe-Signature"),
          ).pipe(
            Effect.mapError(
              () =>
                new ErrorEx.InvariantResponseError({
                  message: "Missing stripe signature.",
                  response: new Response(null, { status: 400 }),
                }),
            ),
          );
          const body = yield* Effect.tryPromise(() => request.text());
          const event = yield* Config.redacted("STRIPE_WEBHOOK_SECRET").pipe(
            Effect.flatMap((stripeWebhookSecretRedacted) =>
              Effect.tryPromise(() =>
                stripe.webhooks.constructEventAsync(
                  body,
                  signature,
                  Redacted.value(stripeWebhookSecretRedacted),
                ),
              ),
            ),
            Effect.tap((event) => Effect.log(`Stripe webhook: ${event.type}`)),
          );
          const allowedOption = Option.liftPredicate<StripeType.Event>(
            (event) => allowedEvents.includes(event.type),
          )(event);
          if (Option.isNone(allowedOption)) {
            yield* Effect.logError(
              `Stripe webhook: ${event.type} is not allowed`,
            );
            return new Response(); // Return 200 to avoid retries
          }
          const customerId = (
            allowedOption.value.data.object as { customer: string }
          ).customer;
          if (!Predicate.isString(customerId)) {
            yield* Effect.logError(
              `Stripe webhook: customerId is not string for event type: ${event.type}`,
            );
            return new Response(); // Return 200 to avoid retries
          }
          yield* Effect.tryPromise(() => stub.handleEvent(customerId));
          // yield* syncStripeData(customerId)
          return new Response();
        }).pipe(
          Effect.tapError((error) =>
            Cause.isUnknownException(error)
              ? Effect.logError(
                  `Stripe webhook failed: UnknownException: ${error.error instanceof Error ? error.error.message : error.error}`,
                )
              : Effect.logError(
                  `Stripe webhook failed: ${error instanceof Error ? error.message : "Internal server error"}`,
                ),
          ),
          Effect.mapError((error) =>
            error instanceof ErrorEx.InvariantResponseError
              ? error.response
              : new Response(null, { status: 500 }),
          ),
          Effect.merge,
        ),

      seed: () =>
        Effect.gen(function* () {
          // Ensure prices
          const ensurePrice = (lookup_key: string, unit_amount: number) =>
            Effect.tryPromise(() =>
              stripe.prices.list({
                lookup_keys: [lookup_key],
                limit: 1,
              }),
            ).pipe(
              Effect.flatMap((list) => Effect.fromNullable(list.data[0])),
              Effect.catchTag("NoSuchElementException", () =>
                Effect.gen(function* () {
                  const name =
                    lookup_key.charAt(0).toUpperCase() + lookup_key.slice(1);
                  const product = yield* Effect.tryPromise(() =>
                    stripe.products.create({
                      name,
                      description: `${name} subscription plan`,
                    }),
                  );
                  return yield* Effect.tryPromise(() =>
                    stripe.prices.create({
                      product: product.id,
                      unit_amount,
                      currency: "usd",
                      recurring: {
                        interval: "month",
                        trial_period_days: 7,
                      },
                      lookup_key,
                    }),
                  );
                }),
              ),
            );
          const [basePrice, plusPrice] = yield* Effect.zip(
            ensurePrice("base", 800), // $8 in cents
            ensurePrice("plus", 1200),
          );
          yield* Effect.log({ basePrice, plusPrice });

          // Ensure billing portal configuration
          yield* Effect.tryPromise(() =>
            stripe.billingPortal.configurations.list(),
          ).pipe(
            Effect.flatMap((list) => Effect.fromNullable(list.data[0])),
            Effect.catchTag("NoSuchElementException", () =>
              Effect.tryPromise(() =>
                stripe.billingPortal.configurations.create({
                  business_profile: {
                    headline: "Manage your subscription",
                  },
                  features: {
                    payment_method_update: {
                      enabled: true,
                    },
                    subscription_update: {
                      enabled: true,
                      default_allowed_updates: ["price", "promotion_code"],
                      proration_behavior: "create_prorations",
                      products: [
                        {
                          product:
                            typeof basePrice.product === "string"
                              ? basePrice.product
                              : basePrice.product.id,
                          prices: [basePrice.id],
                        },
                        {
                          product:
                            typeof plusPrice.product === "string"
                              ? plusPrice.product
                              : plusPrice.product.id,
                          prices: [plusPrice.id],
                        },
                      ],
                    },
                    subscription_cancel: {
                      enabled: true,
                      mode: "at_period_end",
                      cancellation_reason: {
                        enabled: true,
                        options: [
                          "too_expensive",
                          "missing_features",
                          "switched_service",
                          "unused",
                          "other",
                        ],
                      },
                    },
                  },
                }),
              ),
            ),
            Effect.tap((configuration) =>
              Effect.log({ billingPortalConfiguration: configuration }),
            ),
          );

          // Ensure customers
          const iterable = [
            "motio1@mail.com",
            "motio2@mail.com",
            "u@u.com",
            "u1@u.com",
            "u2@u.com",
            "u3@u.com",
            "u4@u.com",
            "u5@u.com",
            "u6@u.com",
            "u7@u.com",
            "u8@u.com",
            "u9@u.com",
            "u10@u.com",
            "u11@u.com",
            "u12@u.com",
            "u13@u.com",
            "u14@u.com",
            "u15@u.com",
            "u16@u.com",
          ].map((s) =>
            Effect.gen(function* () {
              const email = yield* Schema.decode(Email)(s);
              const user = yield* identityMgr.provisionUser({ email });
              const customer = yield* Effect.tryPromise(() =>
                stripe.customers.list({
                  email,
                  limit: 1,
                }),
              ).pipe(
                Effect.flatMap((list) => Effect.fromNullable(list.data[0])),
                Effect.catchTag("NoSuchElementException", () =>
                  Effect.gen(function* () {
                    const customer = yield* Effect.tryPromise(() =>
                      stripe.customers.create({
                        email,
                      }),
                    );
                    yield* Effect.tryPromise(() =>
                      stripe.paymentMethods.attach("pm_card_visa", {
                        customer: customer.id,
                      }),
                    ).pipe(
                      Effect.flatMap((paymentMethod) =>
                        Effect.tryPromise(() =>
                          stripe.customers.update(customer.id, {
                            invoice_settings: {
                              default_payment_method: paymentMethod.id,
                            },
                          }),
                        ),
                      ),
                      Effect.flatMap((customer) =>
                        Effect.tryPromise(() =>
                          stripe.subscriptions.create({
                            customer: customer.id,
                            items: [{ price: basePrice.id }],
                            payment_behavior: "error_if_incomplete", // Forces immediate payment
                          }),
                        ),
                      ),
                    );
                    return customer;
                  }),
                ),
              );
              yield* Effect.log({
                email,
                customerId: customer.id,
                priceId: basePrice.id,
              });
              yield* identityMgr.setAccountStripeCustomerId({
                userId: user.userId,
                stripeCustomerId: customer.id,
              });
              yield* syncStripeData(customer.id);
            }),
          );
          yield* Effect.all(iterable, { concurrency: 2 });
        }),
    };
  }),
}) {}
