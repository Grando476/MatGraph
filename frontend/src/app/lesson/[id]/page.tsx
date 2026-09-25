import LessonView from "@/components/LessonView";

export const dynamic = "force-dynamic";

export default function LessonPage({ params }: { params: { id: string } }) {
  return <LessonView lessonId={params.id} />;
}
