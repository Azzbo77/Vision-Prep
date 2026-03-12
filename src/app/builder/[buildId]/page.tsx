export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import BuilderView from "./BuilderView";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ buildId: string }>;
}) {
  const { buildId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: build } = await supabase
    .from("Build")
    .select("*")
    .eq("id", buildId)
    .single();

  const { data: buildSteps } = await supabase
    .from("BuildStep")
    .select(`
      *,
      step:Step(
        id, title, description,
        images:StepImage(id, url, annotations),
        parts:StepPart(id, quantity, notes, part:Part(id, name, category))
      )
    `)
    .eq("buildId", buildId)
    .order("order", { ascending: true });

  const { data: completions } = await supabase
    .from("StepCompletion")
    .select("buildStepId")
    .eq("userId", user.id);

  if (!build || !buildSteps) {
    return (
      <div style={{ padding: 32, color: "var(--text-muted)" }}>
        Build not found
      </div>
    );
  }

  const completedIds = new Set(completions?.map((c) => c.buildStepId) ?? []);
  const validBuildSteps = buildSteps.filter((bs) => bs.step !== null);

  return (
    <BuilderView
      build={build}
      buildSteps={validBuildSteps}
      completedIds={Array.from(completedIds)}
      userId={user.id}
    />
  );
}
