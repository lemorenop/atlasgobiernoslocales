import { getAllCache, clearCache } from "@/app/utils/cache";

export async function GET() {
  return Response.json({ cache: getAllCache() });
}

export async function DELETE() {
  clearCache();
  return Response.json({ ok: true });
} 