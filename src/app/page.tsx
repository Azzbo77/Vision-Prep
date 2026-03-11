import { supabase } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
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