"use client";
import { LESSON_COMPONENTS } from "@/content/lesson-registry";

export default function LessonHost({ slug }: { slug: string }) {
  const C = LESSON_COMPONENTS[slug];
  if (!C) return <p>This lesson isn’t written yet.</p>;
  return <C />;
}
