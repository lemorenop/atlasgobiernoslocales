import { getAllCache, clearCache } from "@/app/utils/cache";

export async function GET() {
  return Response.json({ cache: getAllCache() });
}

export async function DELETE(request) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key') || request.headers.get('x-cache-key');

  if (!key || key !== process.env.CACHE_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  clearCache();
  return Response.json({ ok: true });
} 