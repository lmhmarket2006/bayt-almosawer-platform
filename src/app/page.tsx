import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

const platformFeatures = [
  "كورسات عربية احترافية في التصوير وصناعة المحتوى",
  "شراء يدوي ومتابعة حالة الطلب من حساب الطالب",
  "لوحة تعلم محمية حسب الكورسات المفتوحة",
  "بنية جاهزة للتوسع لاحقًا بالاشتراكات والمدربين",
];

export default async function HomePage() {
  const featuredCourses = await prisma.course.findMany({
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
    take: 3,
  });

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
                تعلّم باحتراف. تقدّم بثقة.
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-[var(--text-muted)] md:flex">
            <Link href="/">الرئيسية</Link>
            <Link href="/courses">الكورسات</Link>
            <Link href="/login">تسجيل الدخول</Link>
          </nav>
        </div>
      </header>

      <section className="px-5 py-10 sm:px-8 lg:px-20 lg:py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-bold text-[var(--brand-700)] shadow-sm">
              منصة كورسات تجارية لبيت المصور
            </div>

            <h2 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              تعلّم التصوير
              <span className="block bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] bg-clip-text text-transparent">
                من كورسات منظمة وتجربة تعليمية احترافية
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-9 text-[var(--text-muted)]">
              منصة عربية متخصصة في التصوير، الإضاءة، وصناعة المحتوى. اختر
              الكورس، أنشئ طلب شراء، وبعد تأكيد الدفع يتم فتح الدروس داخل حسابك.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-7 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                تصفّح الكورسات
              </Link>

              <Link
                href="/register"
                className="rounded-2xl border border-[var(--border-soft)] bg-white px-7 py-4 text-center text-base font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
              >
                إنشاء حساب طالب
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[var(--brand-700)]">
                  {featuredCourses.length}
                </div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">
                  كورسات منشورة
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[var(--brand-700)]">
                  100%
                </div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">
                  تجربة عربية
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[var(--brand-700)]">
                  RTL
                </div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">
                  اتجاه صحيح
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[var(--brand-700)]">
                  UI
                </div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">
                  موبايل أولًا
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-4 shadow-2xl">
            <div className="rounded-[1.5rem] bg-[var(--brand-950)] p-6 text-white">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/60">رحلة الطالب</p>
                  <h3 className="mt-1 text-2xl font-extrabold">
                    من الشراء إلى التعلم
                  </h3>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold">
                  تجربة كاملة
                </div>
              </div>

              <div className="space-y-4">
                {[
                  "اختر الكورس المناسب",
                  "أنشئ طلب شراء يدوي",
                  "انتظر تأكيد الإدارة",
                  "ابدأ مشاهدة الدروس وتتبع التقدم",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-400)] text-sm font-extrabold text-white">
                        {index + 1}
                      </div>
                      <p className="font-extrabold">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-6 sm:px-8 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-4">
          {platformFeatures.map((feature) => (
            <div
              key={feature}
              className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm"
            >
              <div className="mb-4 h-11 w-11 rounded-2xl bg-gradient-to-br from-[var(--brand-700)] to-[var(--brand-400)]" />
              <p className="text-sm font-bold leading-7 text-[var(--foreground)]">
                {feature}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-16 pt-6 sm:px-8 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-bold text-[var(--brand-500)]">
                الكورسات المميزة
              </p>
              <h3 className="mt-2 text-3xl font-extrabold">ابدأ من هنا</h3>
            </div>

            <Link
              href="/courses"
              className="hidden text-sm font-extrabold text-[var(--brand-900)] sm:block"
            >
              عرض جميع الكورسات ←
            </Link>
          </div>

          {featuredCourses.length === 0 ? (
            <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
              <h4 className="text-2xl font-extrabold">
                لا توجد كورسات منشورة بعد
              </h4>
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                سيتم عرض الكورسات هنا بعد نشرها من لوحة الإدارة.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredCourses.map((course) => {
                const lessonsCount = course.sections.reduce(
                  (total, section) => total + section._count.lessons,
                  0
                );

                return (
                  <article
                    key={course.id}
                    className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="mb-5 flex h-44 items-end rounded-[1.25rem] bg-gradient-to-br from-[var(--brand-950)] via-[var(--brand-700)] to-[var(--brand-400)] p-4">
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

                    <h4 className="text-xl font-extrabold">{course.title}</h4>

                    {course.subtitle ? (
                      <p className="mt-3 min-h-20 text-sm leading-7 text-[var(--text-muted)]">
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