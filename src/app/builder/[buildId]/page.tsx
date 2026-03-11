import { supabase } from "@/lib/supabase";
import BuilderView from "./BuilderView";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ buildId: string }>;
}) {
  const { buildId } = await params;

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
    .eq("userId", "poc-user");

  if (!build || !buildSteps) {
    return (
      <div style={{ padding: 32, color: "var(--text-muted)" }}>
        Build not found
      </div>
    );
  }

  const completedIds = new Set(completions?.map((c) => c.buildStepId) ?? []);

  return (
    <BuilderView
      build={build}
      buildSteps={buildSteps}
      completedIds={Array.from(completedIds)}
    />
  );
}
