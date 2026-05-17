import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type EditLessonPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  await requireRole("ADMIN");

  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: {
      id,
    },
    include: {
      section: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <Link
            href={`/admin/courses/${lesson.section.courseId}/curriculum`}
            className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
          >
            ← العودة للمنهج
          </Link>

          <p className="font-bold text-[var(--brand-500)]">تعديل درس</p>
          <h1 className="mt-2 text-3xl font-extrabold">{lesson.title}</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            الكورس: {lesson.section.course.title}
          </p>
        </div>

        <form
          action={`/api/admin/lessons/${lesson.id}/update`}
          method="POST"
          className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-extrabold">
                عنوان الدرس
              </label>
              <input
                name="title"
                required
                defaultValue={lesson.title}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                وصف الدرس
              </label>
              <textarea
                name="description"
                rows={5}
                defaultValue={lesson.description ?? ""}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 leading-8 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                رابط الفيديو
              </label>
              <input
                name="videoUrl"
                dir="ltr"
                defaultValue={lesson.videoUrl ?? ""}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  مدة الدرس بالدقائق
                </label>
                <input
                  name="durationMinutes"
                  type="number"
                  min="0"
                  defaultValue={lesson.durationMinutes}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  ترتيب الدرس
                </label>
                <input
                  name="sortOrder"
                  type="number"
                  min="0"
                  defaultValue={lesson.sortOrder}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 text-sm font-extrabold">
              <input
                name="isFreePreview"
                type="checkbox"
                value="true"
                defaultChecked={lesson.isFreePreview}
                className="h-5 w-5"
              />
              درس مجاني للمعاينة
            </label>

            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}