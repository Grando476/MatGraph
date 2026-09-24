import LessonView from "@/components/LessonView";

export default function LessonPage({ params }: { params: { id: string } }) {
  return <LessonView lessonId={params.id} />;
}
