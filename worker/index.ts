export default {
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/" || url.pathname === "/api/health") {
      return Response.json({
        ok: true,
        name: "OK Store",
        service: "okstore-api",
      });
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
