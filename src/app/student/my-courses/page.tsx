import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

function getLevelLabel(level: string) {
  const labels: Record<string, string> = {
    BEGINNER: "مبتدئ",
    INTERMEDIATE: "متوسط",
    ADVANCED: "متقدم",
  };

  return labels[level] ?? level;
}

export default async function StudentMyCoursesPage() {
  const user = await requireUser();

  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: user.id,
      isActive: true,
    },
    include: {
      course: {
        include: {
          category: true,
          sections: {
            include: {
              lessons: {
                include: {
                  progresses: {
                    where: {
                      userId: user.id,
                      isCompleted: true,
                    },
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalLessons = enrollments.reduce((total, enrollment) => {
    const lessons = enrollment.course.sections.flatMap(
      (section) => section.lessons
    );

    return total + lessons.length;
  }, 0);

  const totalCompleted = enrollments.reduce((total, enrollment) => {
    const lessons = enrollment.course.sections.flatMap(
      (section) => section.lessons
    );

    return (
      total + lessons.filter((lesson) => lesson.progresses.length > 0).length
    );
  }, 0);

  const overallProgress =
    totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white shadow-sm">
          <div className="pointer-events-none absolute -right-20 top-8 h-72 w-72 rounded-full bg-[var(--brand-400)]/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-8 h-72 w-72 rounded-full bg-[var(--accent-500)]/15 blur-3xl" />

          <div className="relative grid gap-0 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
            <div className="p-6 sm:p-8">
              <Link
                href="/student"
                className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)] transition hover:text-[var(--accent-500)]"
              >
                ← العودة للوحة الطالب
              </Link>

              <p className="font-bold text-[var(--brand-500)]">كورساتي</p>

              <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
                الكورسات المفتوحة لك
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
                تابع دروسك، شاهد مرفقاتك التعليمية، وراقب تقدمك في كل كورس تم
                فتحه لك بعد تأكيد الدفع من الإدارة.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/courses"
                  className="rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-5 py-3 text-center text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
                >
                  تصفح كورسات جديدة
                </Link>

                <Link
                  href="/student/orders"
                  className="rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)]"
                >
                  متابعة طلباتي
                </Link>
              </div>
            </div>

            <div className="bg-[var(--brand-950)] p-6 text-white sm:p-8">
              <p className="text-sm font-bold text-white/60">
                إجمالي تقدمك
              </p>

              <div className="mt-5 rounded-[1.5rem] bg-white/10 p-5">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/60">
                  <span>نسبة الإنجاز</span>
                  <span>{overallProgress}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-[var(--brand-400)] to-[var(--accent-500)]"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>

                <p className="mt-4 text-sm font-bold leading-7 text-white/70">
                  {totalCompleted} درس مكتمل من أصل {totalLessons} درس داخل
                  كل كورساتك المفتوحة.
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/60">الكورسات</p>
                  <p className="mt-1 text-2xl font-extrabold">
                    {enrollments.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/60">الدروس</p>
                  <p className="mt-1 text-2xl font-extrabold">
                    {totalLessons}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {enrollments.length === 0 ? (
          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--accent-500)] text-2xl font-extrabold text-white shadow-lg shadow-orange-500/20">
              🎥
            </div>

            <h2 className="text-2xl font-extrabold">
              لا توجد كورسات مفتوحة بعد
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--text-muted)]">
              بعد شراء كورس وتأكيد الدفع من الإدارة، سيظهر هنا ويمكنك مشاهدة
              الدروس، تحميل المرفقات، ومتابعة تقدمك.
            </p>

            <Link
              href="/courses"
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
            >
              تصفح الكورسات
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;

              const lessons = course.sections.flatMap(
                (section) => section.lessons
              );

              const lessonsCount = lessons.length;
              const completedCount = lessons.filter(
                (lesson) => lesson.progresses.length > 0
              ).length;

              const progress =
                lessonsCount > 0
                  ? Math.round((completedCount / lessonsCount) * 100)
                  : 0;

              const firstLesson = lessons[0];

              return (
                <article
                  key={enrollment.id}
                  className="group overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative mb-5 flex h-44 items-end overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[var(--brand-950)] via-[var(--brand-700)] to-[var(--accent-500)] p-4">
                    <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[var(--brand-400)]/30 blur-2xl" />
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[var(--accent-500)]/30 blur-2xl" />

                    <span className="relative rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
                      {course.category?.name ?? "كورس"}
                    </span>
                  </div>

                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[var(--brand-50)] px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                      {getLevelLabel(course.level)}
                    </span>

                    <span className="text-xs font-bold text-[var(--text-muted)]">
                      {lessonsCount} درس
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-[var(--foreground)]">
                    {course.title}
                  </h2>

                  {course.subtitle ? (
                    <p className="mt-3 min-h-16 text-sm leading-7 text-[var(--text-muted)]">
                      {course.subtitle}
                    </p>
                  ) : null}

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
                      <span>التقدم</span>
                      <span>{progress}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[var(--brand-50)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-[var(--brand-400)] to-[var(--accent-500)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">
                      {completedCount} درس مكتمل من {lessonsCount}
                    </p>
                  </div>

                  <Link
                    href={
                      firstLesson
                        ? `/learn/${course.slug}/${firstLesson.id}`
                        : `/learn/${course.slug}`
                    }
                    className="mt-6 block rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-5 py-3 text-center text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
                  >
                    متابعة التعلم
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}