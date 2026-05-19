import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPlatformSiteName } from "@/lib/platform-settings";
import { CourseTabs } from "@/components/course-tabs";

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

const learningOutcomes = [
  "فهم خطوات تنفيذ التطبيق العملي داخل الكورس.",
  "تحسين جودة الصور أو المحتوى حسب موضوع الكورس.",
  "التعرّف على الأخطاء الشائعة وكيفية تجنبها.",
  "تطبيق المهارات المكتسبة على مشاريعك الشخصية أو التجارية.",
];

const targetStudents = [
  "المصورون الراغبون في تطوير مستواهم.",
  "صنّاع المحتوى الذين يريدون صورًا وفيديوهات أكثر احترافية.",
  "أصحاب المشاريع الصغيرة والمتاجر والخدمات.",
  "المبتدئون الذين يريدون تعلمًا واضحًا ومنظمًا.",
];

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

  const courseTabsSections = course.sections.map((section) => ({
    id: section.id,
    title: section.title,
    lessons: section.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      durationMinutes: lesson.durationMinutes,
      isFreePreview: lesson.isFreePreview,
    })),
  }));

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border-soft)] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-14 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[var(--border-soft)]">
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
            <Link href="/" className="transition hover:text-[var(--brand-600)]">
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
            className="rounded-xl bg-[var(--accent-500)] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--accent-600)]"
          >
            {user ? "لوحة الطالب" : "ابدأ الآن"}
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-5 py-8 sm:px-8 lg:px-20 lg:py-12">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[var(--brand-400)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[var(--accent-500)]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/courses"
            className="mb-6 inline-flex text-sm font-extrabold text-[var(--brand-700)] transition hover:text-[var(--accent-500)]"
          >
            ← العودة للكورسات
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.8fr]">
            <div className="overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="bg-[var(--brand-950)] p-6 text-white sm:p-8">
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
                      <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-extrabold text-green-100 backdrop-blur">
                        مفتوح لك
                      </span>
                    ) : null}
                  </div>

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

                  <div className="mt-7 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs font-bold text-white/60">
                        الدروس
                      </p>
                      <p className="mt-1 text-xl font-extrabold">
                        {lessonsCount}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs font-bold text-white/60">المدة</p>
                      <p className="mt-1 text-xl font-extrabold">
                        {totalDuration} د
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs font-bold text-white/60">
                        المستوى
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {getLevelLabel(course.level)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative min-h-[280px] bg-[var(--surface-soft)]">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full min-h-[280px] items-center justify-center bg-[var(--brand-950)] text-5xl text-white">
                      🎥
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-4 shadow-sm backdrop-blur">
                    <p className="text-xs font-bold text-[var(--text-muted)]">
                      المدرب
                    </p>
                    <p className="mt-1 font-extrabold text-[var(--brand-900)]">
                      {course.createdBy?.name ?? siteName}
                    </p>
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
                      نوع الكورس
                    </p>
                    <p className="mt-2 text-lg font-extrabold text-[var(--brand-700)]">
                      {getCourseTypeLabel(course.courseType)}
                    </p>
                  </div>
                </div>

                <CourseTabs
                  description={course.description}
                  learningOutcomes={learningOutcomes}
                  targetStudents={targetStudents}
                  sections={courseTabsSections}
                  sectionsCount={course.sections.length}
                  lessonsCount={lessonsCount}
                />
              </div>
            </div>

            <aside className="h-fit rounded-[2rem] border border-[var(--border-soft)] bg-white p-5 shadow-xl lg:sticky lg:top-24">
              <div className="mb-5 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5">
                <p className="text-sm font-bold text-[var(--text-muted)]">
                  {hasAccess ? "بطاقة التعلم" : "بطاقة التسجيل"}
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-[var(--brand-900)]">
                  {hasAccess ? "الكورس مفتوح لك" : "ابدأ هذا الكورس الآن"}
                </h2>

                {!hasAccess ? (
                  <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold text-[var(--text-muted)]">
                      سعر الكورس
                    </p>
                    <p className="mt-2 text-3xl font-extrabold text-[var(--brand-900)]">
                      {formatPrice(course.salePrice ?? course.price)}
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-4">
                    <p className="text-xs font-bold text-green-700/80">
                      حالة الوصول
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-green-700">
                      متاح للتعلم الآن
                    </p>
                  </div>
                )}
              </div>

              {hasAccess ? (
                <Link
                  href={
                    firstLesson
                      ? `/learn/${course.slug}/${firstLesson.id}`
                      : `/learn/${course.slug}`
                  }
                  className="block rounded-xl bg-[var(--brand-700)] px-6 py-4 text-center text-base font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--brand-600)]"
                >
                  ابدأ التعلم
                </Link>
              ) : hasPendingOrder ? (
                <Link
                  href="/student/orders"
                  className="block rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 text-center text-base font-extrabold text-amber-800 shadow-sm transition hover:-translate-y-0.5"
                >
                  طلبك قيد المراجعة
                </Link>
              ) : user ? (
                <form action="/api/orders/create" method="POST">
                  <input type="hidden" name="courseId" value={course.id} />

                  <button
                    type="submit"
                    className="block w-full rounded-xl bg-[var(--accent-500)] px-6 py-4 text-center text-base font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--accent-600)]"
                  >
                    شراء الكورس
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-xl bg-[var(--accent-500)] px-6 py-4 text-center text-base font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--accent-600)]"
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