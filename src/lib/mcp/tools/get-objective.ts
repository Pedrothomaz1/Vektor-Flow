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
  name: "get_objective",
  title: "Get objective with KRs",
  description: "Fetch a single objective by id together with its key results and immediate child objectives.",
  inputSchema: { objective_id: z.string().uuid() },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ objective_id }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const client = sb(ctx);
    const [{ data: objective, error: e1 }, { data: krs, error: e2 }, { data: children, error: e3 }] = await Promise.all([
      client.from("objectives").select("*").eq("id", objective_id).maybeSingle(),
      client.from("key_results").select("id,title,current_value,start_value,target_value,unit,weight,owner_id,due_date").eq("objective_id", objective_id),
      client.from("objectives").select("id,title,progress,owner_id").eq("parent_objective_id", objective_id),
    ]);
    const err = e1 || e2 || e3;
    if (err) return { content: [{ type: "text", text: err.message }], isError: true };
    if (!objective) return { content: [{ type: "text", text: "Objective not found or not visible" }], isError: true };
    const payload = { objective, key_results: krs ?? [], child_objectives: children ?? [] };
    return { content: [{ type: "text", text: JSON.stringify(payload) }], structuredContent: payload };
  },
});