import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type CourseDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatPrice(value: unknown) {
  const price = Number(value);

  if (!price || price <= 0) {
    return "مجاني";
  }

  return `${price.toLocaleString("ar-SA")} ريال`;
}

function getLevelLabel(level: string) {
  const labels: Record<string, string> = {
    BEGINNER: "مبتدئ",
    INTERMEDIATE: "متوسط",
    ADVANCED: "متقدم",
  };

  return labels[level] ?? level;
}

function getCourseTypeLabel(type: string) {
  const labels: Record<string, string> = {
    RECORDED: "كورس مسجل",
    LIVE: "بث مباشر",
    IN_PERSON: "حضوري",
  };

  return labels[type] ?? type;
}

export default async function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const course = await prisma.course.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,
      createdBy: {
        select: {
          name: true,
        },
      },
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

  if (!course || !course.isPublished || course.status !== "PUBLISHED") {
    notFound();
  }

  const [enrollment, pendingOrder] = user
    ? await Promise.all([
        prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: course.id,
            },
          },
        }),
        prisma.order.findFirst({
          where: {
            userId: user.id,
            paymentStatus: "PENDING",
            items: {
              some: {
                courseId: course.id,
              },
            },
          },
        }),
      ])
    : [null, null];

  const hasAccess = Boolean(enrollment?.isActive);
  const hasPendingOrder = Boolean(pendingOrder);

  const lessonsCount = course.sections.reduce(
    (total, section) => total + section.lessons.length,
    0
  );

  const totalDuration = course.sections.reduce((total, section) => {
    const sectionDuration = section.lessons.reduce(
      (lessonTotal, lesson) => lessonTotal + lesson.durationMinutes,
      0
    );

    return total + sectionDuration;
  }, 0);

  const firstLesson = course.sections.flatMap((section) => section.lessons)[0];

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border-soft)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-700)] via-[var(--brand-500)] to-[var(--brand-400)] text-white shadow-lg">
              <span className="text-lg font-extrabold">ب</span>
            </div>

            <div>
              <h1 className="text-base font-extrabold sm:text-lg">
                منصة بيت المصور التعليمية
              </h1>
              <p className="text-xs text-[var(--text-muted)] sm:text-sm">
                تفاصيل الكورس
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-[var(--text-muted)] md:flex">
            <Link href="/">الرئيسية</Link>
            <Link href="/courses">الكورسات</Link>
            <Link href={user ? "/student" : "/login"}>
              {user ? "لوحتي" : "تسجيل الدخول"}
            </Link>
          </nav>
        </div>
      </header>

      <section className="px-5 py-10 sm:px-8 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/courses"
            className="mb-6 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
          >
            ← العودة للكورسات
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]">
                  {course.category?.name ?? "كورس"}
                </span>

                <span className="rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]">
                  {getLevelLabel(course.level)}
                </span>

                <span className="rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]">
                  {getCourseTypeLabel(course.courseType)}
                </span>
              </div>

              <h1 className="text-4xl font-extrabold leading-tight lg:text-5xl">
                {course.title}
              </h1>

              {course.subtitle ? (
                <p className="mt-5 text-lg leading-9 text-[var(--text-muted)]">
                  {course.subtitle}
                </p>
              ) : null}

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4">
                  <p className="text-xs font-bold text-[var(--text-muted)]">
                    عدد الدروس
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-[var(--brand-700)]">
                    {lessonsCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4">
                  <p className="text-xs font-bold text-[var(--text-muted)]">
                    المدة التقريبية
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-[var(--brand-700)]">
                    {totalDuration} دقيقة
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4">
                  <p className="text-xs font-bold text-[var(--text-muted)]">
                    المدرب
                  </p>
                  <p className="mt-2 text-lg font-extrabold text-[var(--brand-700)]">
                    {course.createdBy?.name ?? "بيت المصور"}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-extrabold">عن الكورس</h2>
                <p className="mt-4 leading-9 text-[var(--text-muted)]">
                  {course.description}
                </p>
              </div>

              <div className="mt-10">
                <h2 className="text-2xl font-extrabold">محتوى الكورس</h2>

                <div className="mt-5 space-y-4">
                  {course.sections.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-6 text-center text-sm font-bold text-[var(--text-muted)]">
                      لا توجد دروس منشورة لهذا الكورس حتى الآن.
                    </div>
                  ) : (
                    course.sections.map((section, sectionIndex) => (
                      <div
                        key={section.id}
                        className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <h3 className="font-extrabold">
                            {sectionIndex + 1}. {section.title}
                          </h3>
                          <span className="text-xs font-bold text-[var(--text-muted)]">
                            {section.lessons.length} درس
                          </span>
                        </div>

                        <div className="space-y-3">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3"
                            >
                              <div>
                                <p className="font-bold">
                                  {lessonIndex + 1}. {lesson.title}
                                </p>
                                {lesson.isFreePreview ? (
                                  <p className="mt-1 text-xs font-bold text-[var(--brand-500)]">
                                    درس مجاني للمعاينة
                                  </p>
                                ) : null}
                              </div>

                              <span className="shrink-0 text-xs font-bold text-[var(--text-muted)]">
                                {lesson.durationMinutes} دقيقة
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-[2rem] border border-[var(--border-soft)] bg-white p-5 shadow-xl lg:sticky lg:top-6">
              <div className="mb-5 h-56 rounded-[1.5rem] bg-gradient-to-br from-[var(--brand-950)] via-[var(--brand-700)] to-[var(--brand-400)]" />

              <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-5">
                <p className="text-sm font-bold text-[var(--text-muted)]">
                  سعر الكورس
                </p>
                <p className="mt-2 text-3xl font-extrabold text-[var(--brand-900)]">
                  {formatPrice(course.salePrice ?? course.price)}
                </p>
              </div>

              {hasAccess ? (
                <Link
                  href={
                    firstLesson
                      ? `/learn/${course.slug}/${firstLesson.id}`
                      : `/learn/${course.slug}`
                  }
                  className="mt-5 block rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  ابدأ التعلم
                </Link>
              ) : hasPendingOrder ? (
                <Link
                  href="/student/orders"
                  className="mt-5 block rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-6 py-4 text-center text-base font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                >
                  طلبك قيد المراجعة
                </Link>
              ) : user ? (
                <form action="/api/orders/create" method="POST" className="mt-5">
                  <input type="hidden" name="courseId" value={course.id} />

                  <button
                    type="submit"
                    className="block w-full rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    شراء الكورس
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="mt-5 block rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  تسجيل الدخول للشراء
                </Link>
              )}

              <div className="mt-4 rounded-2xl bg-[var(--surface-soft)] p-4 text-center text-xs leading-6 text-[var(--text-muted)]">
                {hasAccess
                  ? "هذا الكورس مفتوح لك بالفعل ويمكنك متابعة التعلم الآن."
                  : hasPendingOrder
                    ? "تم إنشاء طلبك وهو بانتظار تأكيد الإدارة."
                    : user
                      ? "بعد إنشاء الطلب وتأكيد الدفع، سيتم فتح الكورس داخل حسابك."
                      : "سجّل الدخول أو أنشئ حسابًا لتتمكن من شراء الكورس."}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}