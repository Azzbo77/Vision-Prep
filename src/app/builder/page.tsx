export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import BuilderLanding from "./BuilderLanding";

export default async function BuilderPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get all active builds
  const { data: allBuilds } = await supabase
    .from("Build")
    .select(`
      *,
      buildSteps:BuildStep(
        id,
        completions:StepCompletion(id, userId)
      )
    `)
    .eq("status", "ACTIVE")
    .order("createdAt", { ascending: false });

  // Get assigned builds for this user
  const { data: assignments } = await supabase
    .from("BuildAssignment")
    .select("buildId")
    .eq("userId", user.id);

  const assignedBuildIds = new Set(assignments?.map((a) => a.buildId) ?? []);

  return (
    <BuilderLanding
      allBuilds={allBuilds ?? []}
      assignedBuildIds={Array.from(assignedBuildIds)}
      userId={user.id}
    />
  );
}
