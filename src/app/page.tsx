export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: builds } = await supabase
    .from("Build")
    .select(`
      *,
      buildSteps:BuildStep(
        id,
        completions:StepCompletion(id)
      )
    `)
    .neq("status", "ARCHIVED")
    .order("createdAt", { ascending: false });

  const { data: issues } = await supabase
    .from("IssueReport")
    .select(`
      *,
      buildStep:BuildStep(
        id,
        step:Step(title)
      )
    `)
    .eq("status", "OPEN")
    .order("createdAt", { ascending: false })
    .limit(10);

  return (
    <DashboardClient
      initialBuilds={builds ?? []}
      initialIssues={issues ?? []}
    />
  );
}