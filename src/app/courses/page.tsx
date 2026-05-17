import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
                مكتبة الكورسات
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
          <div className="mb-10 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
            <Link
              href="/"
              className="mb-6 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
            >
              ← العودة للرئيسية
            </Link>

            <p className="font-bold text-[var(--brand-500)]">الكورسات</p>
            <h1 className="mt-2 text-4xl font-extrabold">
              مكتبة كورسات بيت المصور
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--text-muted)]">
              اختر الكورس المناسب لك وابدأ رحلة التعلم. إذا كنت مسجلًا، ستظهر
              لك حالة كل كورس حسب طلباتك والكورسات المفتوحة لك.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-extrabold">لا توجد كورسات منشورة</h2>
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
                    className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="mb-5 flex h-48 items-end rounded-[1.25rem] bg-gradient-to-br from-[var(--brand-950)] via-[var(--brand-700)] to-[var(--brand-400)] p-4">
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

                    <div className="mt-5 flex items-center justify-between">
                      <strong className="text-lg font-extrabold text-[var(--brand-900)]">
                        {formatPrice(course.salePrice ?? course.price)}
                      </strong>

                      <Link
                        href={`/courses/${course.slug}`}
                        className="rounded-xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        التفاصيل
                      </Link>
                    </div>

                    {user ? (
                      <div className="mt-4 rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-xs font-bold text-[var(--text-muted)]">
                        {state?.enrolled
                          ? "هذا الكورس مفتوح لك بالفعل."
                          : state?.pending
                            ? "لديك طلب قيد المراجعة لهذا الكورس."
                            : "يمكنك شراء هذا الكورس وفتحه بعد تأكيد الدفع."}
                      </div>
                    ) : null}
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