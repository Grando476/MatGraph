import ExerciseView from "@/components/ExerciseView";

export const dynamic = "force-dynamic";

export default function ExercisePage({ params }: { params: { id: string } }) {
  return <ExerciseView exerciseId={params.id} />;
}
