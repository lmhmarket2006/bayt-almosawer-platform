import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type LessonWatchPageProps = {
  params: Promise<{
    courseSlug: string;
    lessonId: string;
  }>;
};

function getResourceTypeLabel(type: string) {
  const labels: Record<string, string> = {
    PDF: "PDF",
    ZIP: "ZIP",
    LINK: "رابط",
    OTHER: "ملف آخر",
  };

  return labels[type] ?? type;
}

function getResourceButtonLabel(type: string) {
  const labels: Record<string, string> = {
    PDF: "فتح ملف PDF",
    ZIP: "تحميل ZIP",
    LINK: "فتح الرابط",
    OTHER: "فتح الملف",
  };

  return labels[type] ?? "فتح الملف";
}

function getResourceBadgeClass(type: string) {
  if (type === "PDF") {
    return "bg-red-50 text-red-700";
  }

  if (type === "ZIP") {
    return "bg-blue-50 text-blue-700";
  }

  if (type === "LINK") {
    return "bg-green-50 text-green-700";
  }

  return "bg-white text-[var(--brand-600)]";
}

export default async function LessonWatchPage({
  params,
}: LessonWatchPageProps) {
  const user = await requireUser();
  const { courseSlug, lessonId } = await params;

  const course = await prisma.course.findUnique({
    where: {
      slug: courseSlug,
    },
    include: {
      sections: {
        include: {
          lessons: {
            include: {
              progresses: {
                where: {
                  userId: user.id,
                },
              },
              resources: {
                orderBy: [
                  {
                    sortOrder: "asc",
                  },
                  {
                    createdAt: "asc",
                  },
                ],
              },
            },
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

  if (!course || !course.isPublished || course.status !== "PUBLISHED") {
    notFound();
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  if (!enrollment || !enrollment.isActive) {
    redirect("/student/my-courses");
  }

  const lessons = course.sections.flatMap((section) => section.lessons);
  const currentLessonIndex = lessons.findIndex(
    (lesson) => lesson.id === lessonId
  );
  const currentLesson = lessons[currentLessonIndex];

  if (!currentLesson) {
    notFound();
  }

  const completedLessonsCount = lessons.filter(
    (lesson) => lesson.progresses.length > 0 && lesson.progresses[0].isCompleted
  ).length;

  const progress =
    lessons.length > 0
      ? Math.round((completedLessonsCount / lessons.length) * 100)
      : 0;

  const previousLesson = lessons[currentLessonIndex - 1];
  const nextLesson = lessons[currentLessonIndex + 1];

  const isCompleted =
    currentLesson.progresses.length > 0 &&
    currentLesson.progresses[0].isCompleted;

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8 lg:px-20 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-5 rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <Link
                href="/student/my-courses"
                className="mb-3 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
              >
                ← العودة إلى كورساتي
              </Link>

              <p className="font-bold text-[var(--brand-500)]">مشاهدة الكورس</p>
              <h1 className="mt-2 text-2xl font-extrabold leading-tight lg:text-3xl">
                {course.title}
              </h1>
            </div>

            <div className="w-full lg:w-80">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
                <span>تقدمك في الكورس</span>
                <span>{progress}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#f4e8f8]">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[var(--brand-400)] to-[var(--brand-700)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <section className="overflow-hidden rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
            <div className="overflow-hidden rounded-[1.25rem] bg-[var(--brand-950)] sm:rounded-[1.5rem]">
              {currentLesson.videoUrl ? (
                <iframe
                  src={currentLesson.videoUrl}
                  title={currentLesson.title}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex aspect-video items-center justify-center p-8 text-center text-white">
                  لا يوجد فيديو مضاف لهذا الدرس حاليًا.
                </div>
              )}
            </div>

            <div className="mt-5 sm:mt-6">
              <p className="font-bold text-[var(--brand-500)]">
                الدرس {currentLessonIndex + 1} من {lessons.length}
              </p>

              <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">
                {currentLesson.title}
              </h2>

              {currentLesson.description ? (
                <p className="mt-4 leading-8 text-[var(--text-muted)]">
                  {currentLesson.description}
                </p>
              ) : null}
            </div>

            <section className="mt-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 sm:p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-bold text-[var(--brand-500)]">
                    مرفقات الدرس
                  </p>
                  <h3 className="mt-1 text-xl font-extrabold">
                    ملفات وموارد إضافية
                  </h3>
                </div>

                <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[var(--brand-600)]">
                  {currentLesson.resources.length} مرفق
                </span>
              </div>

              {currentLesson.resources.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-[var(--border-soft)] bg-white p-5 text-center text-sm font-bold text-[var(--text-muted)]">
                  لا توجد مرفقات لهذا الدرس حاليًا.
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {currentLesson.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border-soft)] bg-white p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-extrabold">{resource.title}</p>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-extrabold ${getResourceBadgeClass(
                              resource.type
                            )}`}
                          >
                            {getResourceTypeLabel(resource.type)}
                          </span>
                        </div>

                        <p className="mt-2 break-all text-xs text-[var(--text-muted)]" dir="ltr">
                          {resource.url}
                        </p>
                      </div>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-5 py-3 text-center text-sm font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
                      >
                        {getResourceButtonLabel(resource.type)}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-4 text-xs leading-6 text-[var(--text-muted)]">
                إذا كان الرابط من Google Drive أو OneDrive ولم يفتح، تأكد أن
                إعدادات مشاركة الملف تسمح بالوصول لمن لديه الرابط.
              </p>
            </section>

            <div className="mt-6 flex flex-col justify-between gap-3 border-t border-[var(--border-soft)] pt-5 sm:flex-row">
              <div className="grid grid-cols-2 gap-2 sm:flex">
                {previousLesson ? (
                  <Link
                    href={`/learn/${course.slug}/${previousLesson.id}`}
                    className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                  >
                    السابق
                  </Link>
                ) : (
                  <span className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 text-center text-sm font-bold text-[var(--text-muted)]">
                    السابق
                  </span>
                )}

                {nextLesson ? (
                  <Link
                    href={`/learn/${course.slug}/${nextLesson.id}`}
                    className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                  >
                    التالي
                  </Link>
                ) : (
                  <span className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 text-center text-sm font-bold text-[var(--text-muted)]">
                    التالي
                  </span>
                )}
              </div>

              <form
                action={`/api/lessons/${currentLesson.id}/complete`}
                method="POST"
              >
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 sm:w-auto"
                >
                  {isCompleted ? "تم إكمال الدرس" : "تحديد الدرس كمكتمل"}
                </button>
              </form>
            </div>
          </section>

          <aside className="h-fit rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5 lg:sticky lg:top-6">
            <h3 className="text-xl font-extrabold">محتوى الكورس</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              اختر أي درس للانتقال إليه مباشرة.
            </p>

            <div className="mt-5 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              {course.sections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"
                >
                  <h4 className="mb-3 font-extrabold">
                    {sectionIndex + 1}. {section.title}
                  </h4>

                  <div className="space-y-2">
                    {section.lessons.map((lesson) => {
                      const lessonCompleted =
                        lesson.progresses.length > 0 &&
                        lesson.progresses[0].isCompleted;

                      const isCurrentLesson = lesson.id === currentLesson.id;

                      return (
                        <Link
                          key={lesson.id}
                          href={`/learn/${course.slug}/${lesson.id}`}
                          className={`block rounded-2xl px-4 py-3 text-sm font-bold transition ${
                            isCurrentLesson
                              ? "bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] text-white shadow-lg shadow-pink-500/20"
                              : "bg-white text-[var(--foreground)] hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="leading-6">{lesson.title}</span>
                            <span className="shrink-0 text-xs">
                              {lessonCompleted
                                ? "✓"
                                : `${lesson.durationMinutes} د`}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}