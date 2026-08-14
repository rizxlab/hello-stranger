export default {
  async fetch(request, env) {
    let response = await env.ASSETS.fetch(request)

    if (
      response.status === 404 &&
      request.method === 'GET' &&
      request.headers.get('accept')?.includes('text/html')
    ) {
      const fallbackUrl = new URL(request.url)
      fallbackUrl.pathname = '/index.html'
      response = await env.ASSETS.fetch(new Request(fallbackUrl, request))
    }

    return response
  }
}
