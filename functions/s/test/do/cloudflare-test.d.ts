/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "cloudflare:test" {
  /**
   * Run code within a Durable Object instance.
   *
   * BUG: TypeScript type incompatibility between standard Request and \@cloudflare/workers-types Request.
   * @see https://github.com/cloudflare/workers-sdk/issues/10108
   */
  export function runInDurableObject<T>(
    stub: any,
    callback: (instance: any, state: any) => Promise<T>,
  ): Promise<T>;
}
