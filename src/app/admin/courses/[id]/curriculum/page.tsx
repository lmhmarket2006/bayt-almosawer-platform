import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAlert } from "@/components/AdminAlert";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getAdminError, getAdminMessage } from "@/lib/admin-messages";

type CurriculumPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

export default async function CourseCurriculumPage({
  params,
  searchParams,
}: CurriculumPageProps) {
  await requireRole("ADMIN");

  const { id } = await params;
  const query = await searchParams;

  const message = getAdminMessage(query.message);
  const error = getAdminError(query.error);

  const course = await prisma.course.findUnique({
    where: {
      id,
    },
    include: {
      sections: {
        include: {
          lessons: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const lessonsCount = course.sections.reduce(
    (total, section) => total + section.lessons.length,
    0
  );

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <Link
            href="/admin/courses"
            className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
          >
            ← العودة للكورسات
          </Link>

          <p className="font-bold text-[var(--brand-500)]">إدارة المنهج</p>
          <h1 className="mt-2 text-3xl font-extrabold">{course.title}</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            من هنا يمكنك إدارة أقسام الكورس والدروس التي تظهر للطلاب داخل صفحة
            التعلم.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
              <p className="text-xs font-bold text-[var(--text-muted)]">
                عدد الأقسام
              </p>
              <p className="mt-2 text-2xl font-extrabold text-[var(--brand-700)]">
                {course.sections.length}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
              <p className="text-xs font-bold text-[var(--text-muted)]">
                عدد الدروس
              </p>
              <p className="mt-2 text-2xl font-extrabold text-[var(--brand-700)]">
                {lessonsCount}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
              <p className="text-xs font-bold text-[var(--text-muted)]">
                حالة النشر
              </p>
              <p className="mt-2 text-lg font-extrabold text-[var(--brand-700)]">
                {course.isPublished ? "منشور" : "مخفي"}
              </p>
            </div>
          </div>
        </div>

        {message ? <AdminAlert type="success">{message}</AdminAlert> : null}
        {error ? <AdminAlert type="error">{error}</AdminAlert> : null}

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.4fr]">
          <aside className="h-fit rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-2xl font-extrabold">إضافة قسم جديد</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
              القسم هو مجموعة دروس داخل الكورس، مثل: المقدمة، أساسيات الإضاءة،
              تطبيقات عملية.
            </p>

            <form
              action={`/api/admin/courses/${course.id}/sections/create`}
              method="POST"
              className="mt-6 space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  عنوان القسم
                </label>
                <input
                  name="title"
                  required
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                  placeholder="مثال: المقدمة"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  ترتيب القسم
                </label>
                <input
                  name="sortOrder"
                  type="number"
                  min="0"
                  defaultValue={course.sections.length + 1}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
              >
                إضافة القسم
              </button>
            </form>
          </aside>

          <section className="space-y-5">
            {course.sections.length === 0 ? (
              <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
                <h2 className="text-2xl font-extrabold">
                  لا توجد أقسام بعد
                </h2>
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  أضف أول قسم، ثم أضف الدروس داخله.
                </p>
              </div>
            ) : (
              course.sections.map((section, sectionIndex) => (
                <article
                  key={section.id}
                  className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex flex-col justify-between gap-4 border-b border-[var(--border-soft)] pb-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold text-[var(--text-muted)]">
                        القسم {sectionIndex + 1}
                      </p>
                      <h2 className="mt-1 text-2xl font-extrabold">
                        {section.title}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {section.lessons.length} درس
                      </p>
                    </div>

                    <form
                      action={`/api/admin/sections/${section.id}/delete`}
                      method="POST"
                    >
                      <button
                        type="submit"
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700 transition hover:-translate-y-0.5"
                      >
                        حذف القسم
                      </button>
                    </form>
                  </div>

                  <div className="mb-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5">
                    <h3 className="text-lg font-extrabold">إضافة درس جديد</h3>

                    <form
                      action={`/api/admin/sections/${section.id}/lessons/create`}
                      method="POST"
                      className="mt-5 grid gap-4"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-extrabold">
                            عنوان الدرس
                          </label>
                          <input
                            name="title"
                            required
                            className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                            placeholder="مثال: مقدمة الدرس"
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
                            defaultValue={section.lessons.length + 1}
                            className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-extrabold">
                          رابط الفيديو
                        </label>
                        <input
                          name="videoUrl"
                          dir="ltr"
                          className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                          placeholder="https://www.youtube.com/embed/..."
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-extrabold">
                          وصف الدرس
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 leading-8 outline-none transition focus:border-[var(--brand-500)]"
                          placeholder="وصف مختصر لمحتوى الدرس..."
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-extrabold">
                            مدة الدرس بالدقائق
                          </label>
                          <input
                            name="durationMinutes"
                            type="number"
                            min="0"
                            defaultValue="10"
                            className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                          />
                        </div>

                        <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-white p-4 text-sm font-extrabold">
                          <input
                            name="isFreePreview"
                            type="checkbox"
                            value="true"
                            className="h-5 w-5"
                          />
                          درس مجاني للمعاينة
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
                      >
                        إضافة الدرس
                      </button>
                    </form>
                  </div>

                  {section.lessons.length === 0 ? (
                    <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-5 text-center text-sm font-bold text-[var(--text-muted)]">
                      لا توجد دروس داخل هذا القسم بعد.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-4 sm:flex-row sm:items-center"
                        >
                          <div>
                            <h3 className="font-extrabold">{lesson.title}</h3>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                              {lesson.durationMinutes} دقيقة
                              {lesson.isFreePreview ? " • مجاني للمعاينة" : ""}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Link
                              href={`/admin/lessons/${lesson.id}/edit`}
                              className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                            >
                              تعديل
                            </Link>

                            <form
                              action={`/api/admin/lessons/${lesson.id}/delete`}
                              method="POST"
                            >
                              <button
                                type="submit"
                                className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700 transition hover:-translate-y-0.5"
                              >
                                حذف
                              </button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </main>
  );
}