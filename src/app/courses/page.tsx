import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPlatformSiteName } from "@/lib/platform-settings";

export const dynamic = "force-dynamic";

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

type CourseState = {
  enrolled: boolean;
  pending: boolean;
};

export default async function CoursesPage() {
  const user = await getCurrentUser();
  const siteName = await getPlatformSiteName();

  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      status: "PUBLISHED",
    },
    include: {
      category: true,
      sections: {
        select: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const courseStates = new Map<string, CourseState>();

  if (user) {
    const [enrollments, pendingOrders] = await Promise.all([
      prisma.enrollment.findMany({
        where: {
          userId: user.id,
          isActive: true,
        },
        select: {
          courseId: true,
        },
      }),
      prisma.order.findMany({
        where: {
          userId: user.id,
          paymentStatus: "PENDING",
        },
        include: {
          items: {
            select: {
              courseId: true,
            },
          },
        },
      }),
    ]);

    for (const enrollment of enrollments) {
      courseStates.set(enrollment.courseId, {
        enrolled: true,
        pending: false,
      });
    }

    for (const order of pendingOrders) {
      for (const item of order.items) {
        const current = courseStates.get(item.courseId);

        courseStates.set(item.courseId, {
          enrolled: current?.enrolled ?? false,
          pending: true,
        });
      }
    }
  }

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
                مكتبة الكورسات
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-[var(--text-muted)] md:flex">
            <Link href="/" className="transition hover:text-[var(--brand-600)]">
              الرئيسية
            </Link>
            <Link
              href="/courses"
              className="text-[var(--brand-700)] transition hover:text-[var(--brand-600)]"
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

      <section className="relative overflow-hidden px-5 py-10 sm:px-8 lg:px-20 lg:py-14">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[var(--brand-400)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-14 h-72 w-72 rounded-full bg-[var(--accent-500)]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-6 sm:p-8 lg:p-10">
                <Link
                  href="/"
                  className="mb-6 inline-flex text-sm font-extrabold text-[var(--brand-600)] transition hover:text-[var(--accent-500)]"
                >
                  ← العودة للرئيسية
                </Link>

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-extrabold text-[var(--brand-700)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent-500)]" />
                  مكتبة كورسات تصويرك
                </div>

                <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-[var(--brand-900)] sm:text-5xl">
                  اختر كورسك وابدأ
                  <span className="block text-[var(--brand-700)]">
                    رحلة التعلم العملي
                  </span>
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--text-muted)] sm:text-lg">
                  تصفّح كورسات {siteName} في التصوير، الإضاءة، وصناعة المحتوى.
                  إذا كنت مسجلًا، ستظهر لك حالة كل كورس: مفتوح لك، أو لديك طلب
                  قيد المراجعة، أو متاح للشراء.
                </p>

                <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 text-center">
                    <p className="text-2xl font-extrabold text-[var(--brand-700)]">
                      {courses.length}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                      كورسات منشورة
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 text-center">
                    <p className="text-2xl font-extrabold text-[var(--brand-700)]">
                      100%
                    </p>
                    <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                      تجربة عربية
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 text-center">
                    <p className="text-2xl font-extrabold text-[var(--brand-700)]">
                      PDF
                    </p>
                    <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                      مرفقات عملية
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 text-center">
                    <p className="text-2xl font-extrabold text-[var(--brand-700)]">
                      UX
                    </p>
                    <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                      موبايل أولًا
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--brand-950)] p-6 text-white sm:p-8 lg:p-10">
                <div className="rounded-[1.5rem] bg-white p-5">
                  <Image
                    src="/logo-taswerak.png"
                    alt={siteName}
                    width={420}
                    height={240}
                    className="mx-auto h-36 w-auto object-contain"
                    priority
                  />
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    "اختر الكورس المناسب",
                    "راجع تفاصيل الدروس والسعر",
                    "أنشئ طلب الشراء",
                    "ابدأ التعلم بعد تأكيد الإدارة",
                  ].map((step, index) => (
                    <div
                      key={step}
                      className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-500)] text-sm font-extrabold text-white">
                          {index + 1}
                        </div>
                        <p className="font-extrabold">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-7 text-white/70">
                  جميع الكورسات المنشورة تظهر هنا تلقائيًا بعد إضافتها من لوحة
                  الإدارة، مع عرض حالة الطالب إن كان مسجلًا.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-bold text-[var(--brand-500)]">
                جميع الكورسات
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-[var(--brand-900)]">
                اختر المسار المناسب لك
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
                كل كورس يحتوي على دروس منظمة، وقد يحتوي على مرفقات وروابط عملية
                تساعدك في التطبيق.
              </p>
            </div>

            {!user ? (
              <Link
                href="/register"
                className="rounded-xl border border-[var(--border-soft)] bg-white px-5 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)]"
              >
                إنشاء حساب طالب
              </Link>
            ) : (
              <Link
                href="/student/my-courses"
                className="rounded-xl border border-[var(--border-soft)] bg-white px-5 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)]"
              >
                كورساتي المفتوحة
              </Link>
            )}
          </div>

          {courses.length === 0 ? (
            <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-50)] text-2xl">
                🎥
              </div>
              <h3 className="text-2xl font-extrabold">لا توجد كورسات منشورة</h3>
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                سيتم عرض الكورسات هنا بعد إضافتها ونشرها من لوحة الإدارة.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => {
                const lessonsCount = course.sections.reduce(
                  (total, section) => total + section._count.lessons,
                  0
                );

                const state = courseStates.get(course.id);

                return (
                  <article
                    key={course.id}
                    className="group overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link
                      href={`/courses/${course.slug}`}
                      className="relative block h-52 overflow-hidden bg-[var(--surface-soft)]"
                    >
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[var(--brand-950)] text-3xl text-white">
                          🎥
                        </div>
                      )}

                      <div className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-[var(--brand-700)] shadow-sm">
                        {course.category?.name ?? "كورس"}
                      </div>

                      {state?.enrolled ? (
                        <div className="absolute left-4 top-4 rounded-full bg-green-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                          مفتوح لك
                        </div>
                      ) : state?.pending ? (
                        <div className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                          قيد المراجعة
                        </div>
                      ) : null}
                    </Link>

                    <div className="p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-[var(--brand-50)] px-3 py-1 text-xs font-extrabold text-[var(--brand-700)]">
                          {getLevelLabel(course.level)}
                        </span>

                        <span className="text-xs font-bold text-[var(--text-muted)]">
                          {lessonsCount} درس
                        </span>
                      </div>

                      <Link href={`/courses/${course.slug}`}>
                        <h3 className="line-clamp-2 min-h-14 text-xl font-extrabold leading-7 text-[var(--brand-900)] transition group-hover:text-[var(--brand-700)]">
                          {course.title}
                        </h3>
                      </Link>

                      {course.subtitle ? (
                        <p className="mt-3 line-clamp-2 min-h-14 text-sm leading-7 text-[var(--text-muted)]">
                          {course.subtitle}
                        </p>
                      ) : null}

                      {user ? (
                        <div
                          className={
                            state?.enrolled
                              ? "mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-xs font-bold text-green-700"
                              : state?.pending
                                ? "mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800"
                                : "mt-4 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 text-xs font-bold text-[var(--text-muted)]"
                          }
                        >
                          {state?.enrolled
                            ? "هذا الكورس مفتوح لك بالفعل."
                            : state?.pending
                              ? "لديك طلب قيد المراجعة لهذا الكورس."
                              : "يمكنك شراء هذا الكورس وفتحه بعد تأكيد الدفع."}
                        </div>
                      ) : null}

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-4">
                        {state?.enrolled ? (
                          <strong className="text-sm font-extrabold text-green-700">
                            متاح للتعلم الآن
                          </strong>
                        ) : (
                          <strong className="text-lg font-extrabold text-[var(--brand-900)]">
                            {formatPrice(course.salePrice ?? course.price)}
                          </strong>
                        )}

                        <Link
                          href={`/courses/${course.slug}`}
                          className={
                            state?.enrolled
                              ? "rounded-xl bg-[var(--brand-700)] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--brand-600)]"
                              : "rounded-xl bg-[var(--accent-500)] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--accent-600)]"
                          }
                        >
                          {state?.enrolled ? "ابدأ التعلم" : "التفاصيل"}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}