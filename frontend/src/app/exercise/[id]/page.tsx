import ExerciseView from "@/components/ExerciseView";

export default function ExercisePage({ params }: { params: { id: string } }) {
  return <ExerciseView exerciseId={params.id} />;
}
