import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function sb(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "whoami",
  title: "Who am I",
  description: "Return the signed-in user's profile, roles, and Business Units.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const client = sb(ctx);
    const uid = ctx.getUserId();
    const [{ data: profile }, { data: roles }, { data: bus }] = await Promise.all([
      client.from("profiles").select("id,email,full_name,job_title,department,management").eq("id", uid).maybeSingle(),
      client.from("user_roles").select("role").eq("user_id", uid),
      client.from("user_business_units").select("business_unit_id,business_units(name)").eq("user_id", uid),
    ]);
    const payload = {
      user_id: uid,
      email: ctx.getUserEmail(),
      profile,
      roles: (roles ?? []).map((r: any) => r.role),
      business_units: bus ?? [],
    };
    return { content: [{ type: "text", text: JSON.stringify(payload) }], structuredContent: payload };
  },
});