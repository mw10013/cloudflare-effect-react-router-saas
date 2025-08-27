import { createRequestHandler } from "react-router";

export default {
  async fetch(request, _env, _ctx) {
    const requestHandler = createRequestHandler(
      () => import("virtual:react-router/server-build"),
      import.meta.env.MODE,
    );
    return await requestHandler(request);
  },
} satisfies ExportedHandler<Env>;
