import type { DomainDo } from "../../workers/domain-do";
import type { Route } from "./+types/app.$organizationId.domain";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import { env } from "cloudflare:workers";

export async function loader() {
  // Type cast to resolve ESLint false positive for Cloudflare DO type
  const domainDo = env.DOMAIN_DO as DurableObjectNamespace<DomainDo>;
  const id = domainDo.idFromName("domain");
  const stub = domainDo.get(id);
  const pong = await stub.ping();
  return { domain: "example.com", ping: pong };
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-8 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Domain</h1>
        <p className="text-muted-foreground text-sm">
          Manage your organization's domain settings.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Domain Information</CardTitle>
          <CardDescription>
            View and manage domain-related settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre>{JSON.stringify(loaderData, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
