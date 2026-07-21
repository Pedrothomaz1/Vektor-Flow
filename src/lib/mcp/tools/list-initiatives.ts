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
  name: "list_initiatives",
  title: "List initiatives",
  description: "List initiatives visible to the signed-in user. Filter by cycle, owner, or completion state.",
  inputSchema: {
    cycle_id: z.string().uuid().optional(),
    owner_id: z.string().uuid().optional(),
    only_mine: z.boolean().optional(),
    completed: z.boolean().optional().describe("If true, only completed initiatives; if false, only open ones."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ cycle_id, owner_id, only_mine, completed }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = sb(ctx)
      .from("initiatives")
      .select("id,title,description,owner_id,cycle_id,business_unit_id,deadline,status,channel,created_at")
      .order("deadline", { ascending: true });
    if (cycle_id) q = q.eq("cycle_id", cycle_id);
    if (only_mine) q = q.eq("owner_id", ctx.getUserId());
    else if (owner_id) q = q.eq("owner_id", owner_id);
    if (completed === true) q = q.in("status", ["completed", "completed_late"]);
    else if (completed === false) q = q.eq("status", "pending");
    const { data, error } = await q;
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { initiatives: data ?? [] } };
  },
});