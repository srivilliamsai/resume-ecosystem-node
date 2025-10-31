const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Authorization token missing" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }

  const upstream = `${API_BASE_URL}/resume/rebuild`;

  const response = await fetch(upstream, {
    method: "POST",
    headers: {
      authorization: authHeader
    }
  });

  const text = await response.text();

  return new Response(text || undefined, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json"
    }
  });
}
