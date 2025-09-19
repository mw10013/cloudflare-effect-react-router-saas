import { DurableObject } from "cloudflare:workers";

export class DomainDo extends DurableObject {
  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    switch (url.pathname) {
      case "/status":
        return this.handleStatus();
      case "/data":
        if (method === "GET") {
          return this.handleGetData();
        } else if (method === "POST") {
          return this.handleSetData(await request.json());
        }
        break;
      default:
        return new Response("Not Found", { status: 404 });
    }

    return new Response("Method Not Allowed", { status: 405 });
  }

  ping(): string {
    return "pong";
  }

  private async handleStatus(): Promise<Response> {
    const data = await this.ctx.storage.get("lastUpdated");
    return Response.json({
      status: "active",
      id: this.ctx.id.toString(),
      lastUpdated: data ?? null,
    });
  }

  private async handleGetData(): Promise<Response> {
    const data = await this.ctx.storage.get("domainData");
    return Response.json({ data: data ?? null });
  }

  private async handleSetData(data: unknown): Promise<Response> {
    await this.ctx.storage.put("domainData", data);
    await this.ctx.storage.put("lastUpdated", new Date().toISOString());

    return Response.json({
      success: true,
      message: "Data updated successfully",
    });
  }
}

/**
 * Identity function used because the linter gets confused with
 * `DurableObjectNamespace<import("./workers/app").DomainDo>`.
 * @example
 *   // eslint-disable-next-line \@typescript-eslint/no-unsafe-argument
 *   const domainDo = asDomainDo(env.DOMAIN_DO);
 */
export function asDomainDo(
  v: DurableObjectNamespace<DomainDo>,
): DurableObjectNamespace<DomainDo> {
  return v;
}
