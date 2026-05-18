import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getPlatformSiteName } from "@/lib/platform-settings";

function formatPrice(value: unknown) {
  const price = Number(value);

  if (!price || price <= 0) {
    return "مجاني";
  }

  return `${price.toLocaleString("ar-SA")} ريال`;
}

function getPaymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "بانتظار الدفع",
    PAID: "مدفوع",
    REJECTED: "مرفوض",
    REFUNDED: "مسترد",
  };

  return labels[status] ?? status;
}

export default async function StudentDashboardPage() {
  const user = await requireUser();
  const siteName = await getPlatformSiteName();

  const [
    myCoursesCount,
    completedLessonsCount,
    ordersCount,
    latestEnrollment,
    latestOrder,
  ] = await Promise.all([
    prisma.enrollment.count({
      where: {
        userId: user.id,
        isActive: true,
      },
    }),
    prisma.lessonProgress.count({
      where: {
        userId: user.id,
        isCompleted: true,
      },
    }),
    prisma.order.count({
      where: {
        userId: user.id,
      },
    }),
    prisma.enrollment.findFirst({
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
    }),
    prisma.order.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  let latestCourseProgress = 0;

  if (latestEnrollment) {
    const lessons = latestEnrollment.course.sections.flatMap(
      (section) => section.lessons
    );

    const completed = lessons.filter(
      (lesson) => lesson.progresses.length > 0
    ).length;

    latestCourseProgress =
      lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white shadow-sm">
          <div className="pointer-events-none absolute -right-20 top-8 h-72 w-72 rounded-full bg-[var(--brand-400)]/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-8 h-72 w-72 rounded-full bg-[var(--accent-500)]/15 blur-3xl" />

          <div className="relative grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="p-6 sm:p-8">
              <p className="font-bold text-[var(--brand-500)]">لوحة الطالب</p>

              <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
                مرحبًا {user.name}، تابع رحلتك التعليمية
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
                من هنا يمكنك متابعة كورساتك المفتوحة، معرفة تقدمك في الدروس،
                ومراجعة طلبات الشراء داخل {siteName}.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/student/my-courses"
                  className="rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-5 py-3 text-center text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
                >
                  كورساتي
                </Link>

                <Link
                  href="/student/orders"
                  className="rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)]"
                >
                  طلباتي
                </Link>

                <Link
                  href="/courses"
                  className="rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)]"
                >
                  تصفح الكورسات
                </Link>

                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-extrabold text-red-700 transition hover:-translate-y-0.5 sm:w-auto"
                  >
                    تسجيل الخروج
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-[var(--brand-950)] p-6 text-white sm:p-8">
              <p className="text-sm font-bold text-white/60">ملخص سريع</p>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/60">الكورسات المفتوحة</p>
                  <p className="mt-1 text-3xl font-extrabold">
                    {myCoursesCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/60">الدروس المكتملة</p>
                  <p className="mt-1 text-3xl font-extrabold">
                    {completedLessonsCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/60">طلبات الشراء</p>
                  <p className="mt-1 text-3xl font-extrabold">{ordersCount}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-[var(--brand-500)]">
                  آخر كورس مفتوح
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">
                  تابع من حيث توقفت
                </h2>
              </div>

              <Link
                href="/student/my-courses"
                className="hidden text-sm font-extrabold text-[var(--brand-600)] transition hover:text-[var(--accent-500)] sm:inline-flex"
              >
                عرض الكل ←
              </Link>
            </div>

            {latestEnrollment ? (
              <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5">
                <div className="relative mb-5 flex h-40 items-end overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[var(--brand-950)] via-[var(--brand-700)] to-[var(--accent-500)] p-4">
                  <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[var(--brand-400)]/30 blur-2xl" />
                  <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[var(--accent-500)]/30 blur-2xl" />

                  <span className="relative rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
                    {latestEnrollment.course.category?.name ?? "كورس"}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold">
                  {latestEnrollment.course.title}
                </h3>

                {latestEnrollment.course.subtitle ? (
                  <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                    {latestEnrollment.course.subtitle}
                  </p>
                ) : null}

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
                    <span>التقدم</span>
                    <span>{latestCourseProgress}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[var(--brand-50)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-[var(--brand-400)] to-[var(--accent-500)]"
                      style={{ width: `${latestCourseProgress}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/learn/${latestEnrollment.course.slug}`}
                  className="mt-6 block rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-5 py-3 text-center text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
                >
                  متابعة التعلم
                </Link>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--border-soft)] bg-[var(--surface-soft)] p-8 text-center">
                <h3 className="text-xl font-extrabold">
                  لا توجد كورسات مفتوحة بعد
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                  اختر كورسًا من صفحة الكورسات، وبعد تأكيد الدفع سيظهر هنا.
                </p>
                <Link
                  href="/courses"
                  className="mt-6 inline-flex rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20"
                >
                  تصفح الكورسات
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-[var(--brand-500)]">آخر طلب</p>
                <h2 className="mt-1 text-2xl font-extrabold">حالة الشراء</h2>
              </div>

              <Link
                href="/student/orders"
                className="hidden text-sm font-extrabold text-[var(--brand-600)] transition hover:text-[var(--accent-500)] sm:inline-flex"
              >
                كل الطلبات ←
              </Link>
            </div>

            {latestOrder ? (
              <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--brand-50)] px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                    {getPaymentStatusLabel(latestOrder.paymentStatus)}
                  </span>

                  <span className="rounded-full bg-[var(--brand-50)] px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                    {formatPrice(latestOrder.finalAmount)}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold">
                  {latestOrder.items[0]?.course.title ?? "طلب شراء كورس"}
                </h3>

                <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                  تم إنشاء الطلب بتاريخ{" "}
                  {latestOrder.createdAt.toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                {latestOrder.paymentStatus === "PENDING" ? (
                  <div className="mt-5 rounded-2xl bg-white p-4 text-sm leading-7 text-[var(--text-muted)]">
                    الطلب بانتظار تأكيد الإدارة. بعد التأكيد سيظهر الكورس في
                    صفحة كورساتي.
                  </div>
                ) : null}

                <Link
                  href="/student/orders"
                  className="mt-6 block rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)]"
                >
                  عرض تفاصيل الطلب
                </Link>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--border-soft)] bg-[var(--surface-soft)] p-8 text-center">
                <h3 className="text-xl font-extrabold">لا توجد طلبات بعد</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                  عند شراء أي كورس سيظهر أحدث طلب هنا.
                </p>
                <Link
                  href="/courses"
                  className="mt-6 inline-flex rounded-2xl border border-[var(--border-soft)] bg-white px-6 py-3 text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)]"
                >
                  ابدأ الآن
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <Link
            href="/courses"
            className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="font-bold text-[var(--brand-500)]">اكتشف</p>
            <h3 className="mt-2 text-xl font-extrabold">تصفح الكورسات</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
              شاهد كل الكورسات المتاحة على المنصة.
            </p>
          </Link>

          <Link
            href="/student/my-courses"
            className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="font-bold text-[var(--brand-500)]">تعلم</p>
            <h3 className="mt-2 text-xl font-extrabold">كورساتي</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
              ارجع إلى الكورسات المفتوحة لك وتابع التقدم.
            </p>
          </Link>

          <Link
            href="/student/orders"
            className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="font-bold text-[var(--brand-500)]">الطلبات</p>
            <h3 className="mt-2 text-xl font-extrabold">متابعة الشراء</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
              راجع حالة الدفع والتأكيد لكل طلباتك.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}