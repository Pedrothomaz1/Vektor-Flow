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
  name: "list_objectives",
  title: "List objectives",
  description: "List OKR objectives the signed-in user can see. Filter by cycle and/or owner.",
  inputSchema: {
    cycle_id: z.string().uuid().optional(),
    owner_id: z.string().uuid().optional().describe("Filter to objectives owned by this user."),
    only_mine: z.boolean().optional().describe("Only objectives owned by the caller."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ cycle_id, owner_id, only_mine }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = sb(ctx)
      .from("objectives")
      .select("id,title,description,progress,owner_id,cycle_id,parent_objective_id,business_unit_id,created_at")
      .order("created_at", { ascending: false });
    if (cycle_id) q = q.eq("cycle_id", cycle_id);
    if (only_mine) q = q.eq("owner_id", ctx.getUserId());
    else if (owner_id) q = q.eq("owner_id", owner_id);
    const { data, error } = await q;
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { objectives: data ?? [] } };
  },
});