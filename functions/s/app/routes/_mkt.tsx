import type { MouseEvent } from "react";
import type { Route } from "./+types/_mkt";
import * as Oui from "@workspace/oui";
import { Effect } from "effect";
import * as Rac from "react-aria-components";
import { Outlet, useRouteLoaderData } from "react-router";
import * as ReactRouterEx from "~/lib/ReactRouterEx";

export const loader = ReactRouterEx.routeEffect(
  ({ request, context }: Route.LoaderArgs) =>
    Effect.gen(function* () {
      const appLoacContext = context.get(ReactRouterEx.appLoadContext);
      yield* Effect.log({
        message: "_mkt: loader",
        sessionUser: appLoacContext.session.get("sessionUser"),
      });
      return {
        sessionUser: appLoacContext.session.get("sessionUser"),
        authenticateUrlAbsolute: `${new URL(request.url).origin}/authenticate`,
      };
    }),
);

export default function RouteComponent({}: Route.ComponentProps) {
  return (
    // shadcn AppLayout
    <div data-wrapper="" className="border-grid flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      {/* <SiteFooter /> */}
    </div>
  );
}

function SiteHeader() {
  const routeLoaderData =
    useRouteLoaderData<Route.ComponentProps["loaderData"]>("routes/_mkt");
  return (
    <header className="border-grid bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container-wrapper">
        <div className="container flex h-14 items-center gap-2 md:gap-4">
          <MainNav />
          {/* <MobileNav />
          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
              <CommandMenu />
            </div>
            <nav className="flex items-center gap-0.5">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-8 w-8 px-0"
              >
                <Link
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icons.gitHub className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <ModeSwitcher />
            </nav>
          </div> */}
          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            {/* <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
              <CommandMenu />
            </div> */}
            <nav className="flex items-center gap-0.5">
              {routeLoaderData?.sessionUser ? (
                <Rac.Form
                  action="/signout"
                  method="post"
                  className="grid w-full max-w-sm gap-6"
                >
                  <Oui.Button type="submit" variant="outline">
                    Sign Out
                  </Oui.Button>
                </Rac.Form>
              ) : (
                <Rac.Link
                  className={Oui.buttonClassName({ variant: "outline" })}
                  onPress={() => {
                    // Bypass client-side routing (Rac.RouterProvider) to hit the Hono OpenAuth endpoint directly.
                    window.location.href = "/authenticate";
                  }}
                >
                  Sign In
                </Rac.Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

function MainNav() {
  return (
    <div className="mr-4 hidden md:flex">
      <Oui.Link href="/" className="mr-4 flex items-center gap-2 lg:mr-6">
        {/* <Logo className="h-6 w-6" /> */}
        <span className="hidden font-bold lg:inline-block">SaaS</span>
      </Oui.Link>
      <nav className="flex items-center gap-4 text-sm xl:gap-6">
        <Oui.Link
          href="/pricing"
          className={
            "text-foreground/80 data-[hovered]:text-foreground/80 transition-colors"
          }
        >
          Pricing
        </Oui.Link>
      </nav>
    </div>
  );
}
