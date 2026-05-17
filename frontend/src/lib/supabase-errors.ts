/**
 * Extract a human-readable message from a Supabase Edge Function error.
 *
 * `supabase.functions.invoke(...)` returns `{ data, error }` — when the
 * Edge Function returns a non-2xx response, `error` is a `FunctionsHttpError`
 * with the generic message:
 *
 *   "Edge Function returned a non-2xx status code"
 *
 * The *real* error reason is in the response body (`error.context.json()`),
 * which most code never reads. This helper parses that body and returns the
 * actual reason ("Plan not found", "Razorpay returned ...", etc.).
 *
 * Usage:
 * ```ts
 * const { data, error } = await supabase.functions.invoke('foo', { body });
 * if (error) {
 *   const reason = await extractFunctionsError(error, data);
 *   throw new Error(reason);
 * }
 * ```
 */
export async function extractFunctionsError(
  error: any,
  fallbackData?: any,
): Promise<string> {
  // 1. Some functions return { success:false, error: "..." } with 200 status —
  //    the SDK's `error` is null, but `data.error` carries the reason.
  if (!error && fallbackData?.error) return String(fallbackData.error);

  if (!error) return 'Unknown error';

  // 2. Inline data already carrying error (rare)
  if (fallbackData?.error) return String(fallbackData.error);

  // 3. FunctionsHttpError exposes the underlying Response in `error.context`
  const ctx = (error as any).context;

  if (ctx && typeof ctx === 'object') {
    try {
      // ctx may be the Response itself
      if (typeof ctx.json === 'function') {
        const body = await ctx.clone().json();
        const msg = body?.error || body?.message || body?.detail;
        if (msg) return typeof msg === 'string' ? msg : JSON.stringify(msg);
      } else if (typeof ctx.text === 'function') {
        const text = await ctx.clone().text();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            return parsed?.error || parsed?.message || parsed?.detail || text;
          } catch {
            return text;
          }
        }
      }
    } catch {
      /* fall through */
    }
  }

  // 4. Final fallback to the SDK's generic message
  return error?.message || 'Request failed';
}
