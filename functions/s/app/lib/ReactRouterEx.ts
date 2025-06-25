import type {
  AppLoadContext as ReactRouterAppLoadContext,
  unstable_MiddlewareFunction,
  unstable_RouterContextProvider,
} from "react-router";
import { Cloudflare, D1 } from "@workspace/shared";
import { Cause, Context, Effect, Exit, Layer, ManagedRuntime } from "effect";
import { unstable_createContext } from "react-router";
import { IdentityMgr } from "./IdentityMgr";
import * as Q from "./Queue";
import { Stripe } from "./Stripe";

export const appLoadContext =
  unstable_createContext<ReactRouterAppLoadContext>();

export class AppLoadContext extends Context.Tag("AppLoadContext")<
  AppLoadContext,
  ReactRouterAppLoadContext
>() {}

/**
 * Wraps a route's loader or action Effect with context provision and execution.
 * AppLoadContext is provided here to ensure the Effect receives the latest context,
 * as middleware might have modified it.
 */
export const routeEffect =
  <A, E, P extends { context: unstable_RouterContextProvider }>(
    f: (
      props: P,
    ) => Effect.Effect<
      A,
      E | Response,
      | AppLoadContext
      | ManagedRuntime.ManagedRuntime.Context<
          ReactRouterAppLoadContext["runtime"]
        >
    >,
  ) =>
  (props: P) =>
    f(props)
      .pipe(
        Effect.provideService(
          AppLoadContext,
          props.context.get(appLoadContext),
        ),
        (effect) =>
          props.context.get(appLoadContext).runtime.runPromiseExit(effect),
      )
      .then(
        Exit.match({
          onSuccess: (value) => value,
          onFailure: (cause) => {
            if (Cause.isFailType(cause) && cause.error instanceof Response) {
              throw cause.error;
            }
            throw new Error(
              `Route effect failed with unhandled cause: ${Cause.pretty(cause)}`,
            );
          },
        }),
      );

/**
 * Creates a React Router middleware function from an Effect.
 * The Effect can fail with a `Response` to short-circuit the middleware chain.
 *
 * Note: To enable precise contextual typing for middleware arguments (especially `args.params`),
 * and to ensure the resulting middleware function has a well-defined type,
 * annotate the variable with the route-specific`Route.unstable_MiddlewareFunction`.
 * @example `const myMiddleware: Route.unstable_MiddlewareFunction = middlewareEffect(...)`
 *
 * @template A - Success type of the Effect (usually undefined).
 * @template E - Error type of the Effect (excluding Response).
 * @template Args - Middleware arguments type, inferred contextually based on usage.
 * @param f - A function returning an Effect representing the middleware logic. It receives middleware args and the next function.
 * @returns A standard React Router middleware function compatible promise signature.
 */
export const middlewareEffect =
  <A, E, Args extends Parameters<unstable_MiddlewareFunction<Response>>[0]>(
    f: (
      args: Args,
      next: Parameters<unstable_MiddlewareFunction<Response>>[1],
    ) => Effect.Effect<
      A | undefined,
      E | Response,
      ManagedRuntime.ManagedRuntime.Context<
        ReactRouterAppLoadContext["runtime"]
      >
    >,
  ) =>
  (
    args: Args,
    next: Parameters<unstable_MiddlewareFunction<Response>>[1],
  ): Promise<A | undefined> =>
    args.context
      .get(appLoadContext)
      .runtime.runPromiseExit(f(args, next))
      .then(
        Exit.match({
          onSuccess: (value) => value,
          onFailure: (cause) => {
            if (Cause.isFailType(cause) && cause.error instanceof Response) {
              throw cause.error;
            }
            throw new Error(
              `Middleware failed with unhandled cause: ${Cause.pretty(cause)}`,
            );
          },
        }),
      );

export const makeRuntime = (env: Env) => {
  return Layer.mergeAll(
    IdentityMgr.Default,
    Stripe.Default,
    Q.Producer.Default,
    D1.D1.Default,
  ).pipe(Cloudflare.provideLoggerAndConfig(env), ManagedRuntime.make);
};

/*

export const makeRemixRuntime = <R, E>(layer: Layer.Layer<R, E, never>) => {
  const runtime = ManagedRuntime.make(layer);

  const loaderFunction =
    <A, E>(
      body: (...args: Parameters<LoaderFunction>) => Effect.Effect<A, E, R>
    ): {
      (...args: Parameters<LoaderFunction>): Promise<A>;
    } =>
    (...args) =>
      runtime.runPromise(body(...args));

  return { loaderFunction };
};

export const loader = loaderFunction(() => TodoRepo.getAllTodos);

*/

/*
export const routeEffect =
  <A, E, P extends { context: unstable_RouterContextProvider }>(
    f: (
      props: P,
    ) => Effect.Effect<
      A,
      E,
      | AppLoadContext
      | ManagedRuntime.ManagedRuntime.Context<RrAppLoadContext["runtime"]>
    >,
  ) =>
  (props: P) =>
    f(props).pipe(
      Effect.provideService(AppLoadContext, props.context.get(appLoadContext)),
      props.context.get(appLoadContext).runtime.runPromise,
    );
*/
