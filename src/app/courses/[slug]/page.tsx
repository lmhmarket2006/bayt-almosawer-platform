import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPlatformSiteName } from "@/lib/platform-settings";

export const dynamic = "force-dynamic";

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
  const siteName = await getPlatformSiteName();

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
      <header className="sticky top-0 z-40 border-b border-[var(--border-soft)] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-14 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-[var(--border-soft)]">
              <Image
                src="/logo-taswerak.png"
                alt={siteName}
                width={220}
                height={120}
                className="h-full w-full object-contain p-1.5"
                priority
              />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-base font-extrabold sm:text-lg">
                {siteName}
              </h1>
              <p className="text-xs text-[var(--text-muted)] sm:text-sm">
                تفاصيل الكورس
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-[var(--text-muted)] md:flex">
            <Link
              href="/"
              className="transition hover:text-[var(--brand-600)]"
            >
              الرئيسية
            </Link>
            <Link
              href="/courses"
              className="transition hover:text-[var(--brand-600)]"
            >
              الكورسات
            </Link>
            <Link
              href={user ? "/student" : "/login"}
              className="transition hover:text-[var(--brand-600)]"
            >
              {user ? "لوحتي" : "تسجيل الدخول"}
            </Link>
          </nav>

          <Link
            href={user ? "/student" : "/register"}
            className="rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
          >
            {user ? "لوحة الطالب" : "ابدأ الآن"}
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-5 py-10 sm:px-8 lg:px-20 lg:py-14">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[var(--brand-400)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[var(--accent-500)]/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/courses"
            className="mb-6 inline-flex text-sm font-extrabold text-[var(--brand-600)] transition hover:text-[var(--accent-500)]"
          >
            ← العودة للكورسات
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.8fr]">
            <div className="overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white shadow-sm">
              <div className="bg-[var(--brand-950)] p-5 text-white sm:p-7">
                <div className="mb-6 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
                    {course.category?.name ?? "كورس"}
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
                    {getLevelLabel(course.level)}
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
                    {getCourseTypeLabel(course.courseType)}
                  </span>

                  {hasAccess ? (
                    <span className="rounded-full bg-green-400/20 px-3 py-1 text-xs font-extrabold text-green-100 backdrop-blur">
                      مفتوح لك
                    </span>
                  ) : null}
                </div>

                <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.45fr]">
                  <div>
                    <p className="mb-4 text-sm font-bold text-white/60">
                      تفاصيل الكورس
                    </p>

                    <h1 className="text-4xl font-extrabold leading-tight lg:text-5xl">
                      {course.title}
                    </h1>

                    {course.subtitle ? (
                      <p className="mt-5 max-w-3xl text-lg leading-9 text-white/70">
                        {course.subtitle}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-[1.5rem] bg-white p-5">
                    <Image
                      src="/logo-taswerak.png"
                      alt={siteName}
                      width={360}
                      height={200}
                      className="mx-auto h-32 w-auto object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid gap-3 sm:grid-cols-3">
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
                      {course.createdBy?.name ?? siteName}
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
                  <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                      <p className="font-bold text-[var(--brand-500)]">
                        محتوى الكورس
                      </p>
                      <h2 className="mt-2 text-2xl font-extrabold">
                        الدروس والأقسام
                      </h2>
                    </div>

                    <span className="rounded-full bg-[var(--brand-50)] px-4 py-2 text-xs font-extrabold text-[var(--brand-600)]">
                      {course.sections.length} أقسام • {lessonsCount} دروس
                    </span>
                  </div>

                  <div className="space-y-4">
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
                            <h3 className="font-extrabold text-[var(--brand-900)]">
                              {sectionIndex + 1}. {section.title}
                            </h3>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
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
                                    <p className="mt-1 text-xs font-extrabold text-[var(--accent-500)]">
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
            </div>

            <aside className="h-fit rounded-[2rem] border border-[var(--border-soft)] bg-white p-5 shadow-xl lg:sticky lg:top-24">
              <div className="relative mb-5 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[var(--brand-950)] via-[var(--brand-700)] to-[var(--accent-500)] p-5 text-white">
                <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-[var(--brand-400)]/30 blur-2xl" />
                <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-[var(--accent-500)]/30 blur-2xl" />

                <div className="relative">
                  <p className="text-sm font-bold text-white/60">
                    {hasAccess ? "بطاقة التعلم" : "بطاقة التسجيل"}
                  </p>

                  <h2 className="mt-2 text-2xl font-extrabold">
                    {hasAccess ? "الكورس مفتوح لك" : "ابدأ هذا الكورس الآن"}
                  </h2>

                  {!hasAccess ? (
                    <div className="mt-5 rounded-2xl bg-white/10 p-4">
                      <p className="text-xs font-bold text-white/60">
                        سعر الكورس
                      </p>
                      <p className="mt-2 text-3xl font-extrabold">
                        {formatPrice(course.salePrice ?? course.price)}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl bg-green-400/15 p-4">
                      <p className="text-xs font-bold text-green-100/80">
                        حالة الوصول
                      </p>
                      <p className="mt-2 text-2xl font-extrabold text-green-100">
                        متاح للتعلم الآن
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {hasAccess ? (
                <Link
                  href={
                    firstLesson
                      ? `/learn/${course.slug}/${firstLesson.id}`
                      : `/learn/${course.slug}`
                  }
                  className="block rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-6 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  ابدأ التعلم
                </Link>
              ) : hasPendingOrder ? (
                <Link
                  href="/student/orders"
                  className="block rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-center text-base font-extrabold text-amber-800 shadow-sm transition hover:-translate-y-0.5"
                >
                  طلبك قيد المراجعة
                </Link>
              ) : user ? (
                <form action="/api/orders/create" method="POST">
                  <input type="hidden" name="courseId" value={course.id} />

                  <button
                    type="submit"
                    className="block w-full rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-6 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    شراء الكورس
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-6 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  تسجيل الدخول للشراء
                </Link>
              )}

              <div
                className={
                  hasAccess
                    ? "mt-4 rounded-2xl border border-green-100 bg-green-50 p-4 text-center text-xs font-bold leading-6 text-green-700"
                    : hasPendingOrder
                      ? "mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-center text-xs font-bold leading-6 text-amber-800"
                      : "mt-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 text-center text-xs font-bold leading-6 text-[var(--text-muted)]"
                }
              >
                {hasAccess
                  ? "هذا الكورس مفتوح لك بالفعل ويمكنك متابعة التعلم الآن."
                  : hasPendingOrder
                    ? "تم إنشاء طلبك وهو بانتظار تأكيد الإدارة."
                    : user
                      ? "بعد إنشاء الطلب وتأكيد الدفع، سيتم فتح الكورس داخل حسابك."
                      : "سجّل الدخول أو أنشئ حسابًا لتتمكن من شراء الكورس."}
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                  <p className="text-xs font-bold text-[var(--text-muted)]">
                    نوع الكورس
                  </p>
                  <p className="mt-1 font-extrabold text-[var(--brand-900)]">
                    {getCourseTypeLabel(course.courseType)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                  <p className="text-xs font-bold text-[var(--text-muted)]">
                    المستوى
                  </p>
                  <p className="mt-1 font-extrabold text-[var(--brand-900)]">
                    {getLevelLabel(course.level)}
                  </p>
                </div>

                {!hasAccess ? (
                  <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                    <p className="text-xs font-bold text-[var(--text-muted)]">
                      الوصول للمحتوى
                    </p>
                    <p className="mt-1 font-extrabold text-[var(--brand-900)]">
                      بعد تأكيد الدفع
                    </p>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}