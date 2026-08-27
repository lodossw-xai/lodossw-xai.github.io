interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

function isClientRoute(request: Request): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return false;
  }

  const segments = new URL(request.url).pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? '';
  return !lastSegment.includes('.');
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || !isClientRoute(request)) {
      return response;
    }

    const indexUrl = new URL('/', request.url);
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};

export default worker;
