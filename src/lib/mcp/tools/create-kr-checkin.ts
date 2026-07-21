import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function sb(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "create_kr_checkin",
  title: "Create key result check-in",
  description: "Register a check-in on a key result with the current value. Progress propagates to the parent objectives.",
  inputSchema: {
    key_result_id: z.string().uuid(),
    value: z.number().describe("New current value for the key result."),
    sentiment: z.enum(["on_track", "at_risk", "off_track"]).optional(),
    impediments: z.string().optional(),
    comment: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ key_result_id, value, sentiment, impediments, comment }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const payload: Record<string, unknown> = {
      key_result_id,
      value,
      user_id: ctx.getUserId(),
    };
    if (sentiment) payload.sentiment = sentiment;
    if (impediments) payload.impediments = impediments;
    if (comment) payload.comment = comment;
    const { data, error } = await sb(ctx).from("kr_checkins").insert(payload).select().maybeSingle();
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { checkin: data } };
  },
});