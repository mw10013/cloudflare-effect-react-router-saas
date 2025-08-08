export default {
  async fetch(request, _env, _ctx) {
    return new Response(`👋 ${request.url}`);
  },
} satisfies ExportedHandler<Env>;
