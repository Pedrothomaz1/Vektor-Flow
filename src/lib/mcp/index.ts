import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCyclesTool from "./tools/list-cycles";
import listObjectivesTool from "./tools/list-objectives";
import getObjectiveTool from "./tools/get-objective";
import listInitiativesTool from "./tools/list-initiatives";
import createKrCheckinTool from "./tools/create-kr-checkin";
import whoamiTool from "./tools/whoami";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "vektorflow-mcp",
  title: "Vektor Flow MCP",
  version: "0.1.0",
  instructions:
    "Tools to explore and update OKRs and initiatives in Vektor Flow. All access respects the signed-in user's roles and Business Unit scope (RLS). Use `whoami` to inspect the current user, `list_cycles`, `list_objectives`, `get_objective`, `list_initiatives` to read data, and `create_kr_checkin` to register progress on a key result.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    whoamiTool,
    listCyclesTool,
    listObjectivesTool,
    getObjectiveTool,
    listInitiativesTool,
    createKrCheckinTool,
  ],
});