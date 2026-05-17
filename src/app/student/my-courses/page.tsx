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
        <section className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <Link
            href="/student"
            className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
          >
            ← العودة للوحة الطالب
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="font-bold text-[var(--brand-500)]">كورساتي</p>
              <h1 className="mt-2 text-3xl font-extrabold">
                الكورسات المفتوحة لك
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
                تابع دروسك وشاهد تقدمك في كل كورس تم فتحه بعد تأكيد الدفع.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-5">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
                <span>إجمالي تقدمك</span>
                <span>{overallProgress}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#f4e8f8]">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[var(--brand-400)] to-[var(--brand-700)]"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>

              <p className="mt-3 text-xs font-bold text-[var(--text-muted)]">
                {totalCompleted} درس مكتمل من أصل {totalLessons} درس
              </p>
            </div>
          </div>
        </section>

        {enrollments.length === 0 ? (
          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-700)] to-[var(--brand-400)] text-2xl font-extrabold text-white">
              ب
            </div>

            <h2 className="text-2xl font-extrabold">لا توجد كورسات مفتوحة بعد</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--text-muted)]">
              بعد شراء كورس وتأكيد الدفع من الإدارة، سيظهر هنا ويمكنك مشاهدة
              الدروس ومتابعة تقدمك.
            </p>

            <Link
              href="/courses"
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-pink-500/20"
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
                  className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="mb-5 flex h-44 items-end rounded-[1.5rem] bg-gradient-to-br from-[var(--brand-950)] via-[var(--brand-700)] to-[var(--brand-400)] p-4">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
                      {course.category?.name ?? "كورس"}
                    </span>
                  </div>

                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]">
                      {getLevelLabel(course.level)}
                    </span>

                    <span className="text-xs font-bold text-[var(--text-muted)]">
                      {lessonsCount} درس
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold">{course.title}</h2>

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

                    <div className="h-2 overflow-hidden rounded-full bg-[#f4e8f8]">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-[var(--brand-400)] to-[var(--brand-700)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">
                      {completedCount} مكتمل من {lessonsCount}
                    </p>
                  </div>

                  <Link
                    href={
                      firstLesson
                        ? `/learn/${course.slug}/${firstLesson.id}`
                        : `/learn/${course.slug}`
                    }
                    className="mt-6 block rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-5 py-3 text-center text-sm font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
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