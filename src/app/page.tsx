import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
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

const platformFeatures = [
  {
    title: "تعلم بصري احترافي",
    description:
      "كورسات عربية منظمة في التصوير، الإضاءة، وصناعة المحتوى بأسلوب واضح وتطبيقي.",
  },
  {
    title: "رحلة شراء سهلة",
    description:
      "اختر الكورس، أنشئ طلب شراء، ثم يتم فتح المحتوى داخل حسابك بعد تأكيد الإدارة.",
  },
  {
    title: "لوحة تعلم محمية",
    description:
      "كل طالب يشاهد فقط الكورسات المفتوحة له مع دروس ومرفقات منظمة.",
  },
  {
    title: "محتوى قابل للتطبيق",
    description:
      "دروس عملية تساعدك على تحسين تصويرك ومحتواك خطوة بخطوة.",
  },
];

const learningSteps = [
  "اختر الكورس المناسب لهدفك",
  "أنشئ حساب طالب وطلب شراء",
  "أرسل إثبات الدفع للإدارة",
  "ابدأ التعلم ومتابعة تقدمك",
];

const categoryHighlights = [
  "تصوير الميكب",
  "تصوير الأطعمة",
  "Beauty Photography",
  "High-End Retouching",
  "تصوير البورتريه",
  "إضاءة الاستديو",
];

export default async function HomePage() {
  const siteName = await getPlatformSiteName();

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
                منصة تعليم التصوير وصناعة المحتوى
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-[var(--text-muted)] md:flex">
            <Link
              href="/"
              className="text-[var(--brand-700)] transition hover:text-[var(--brand-600)]"
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
              href="/login"
              className="transition hover:text-[var(--brand-600)]"
            >
              تسجيل الدخول
            </Link>
          </nav>

          <Link
            href="/courses"
            className="rounded-xl bg-[var(--accent-500)] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--accent-600)]"
          >
            ابدأ الآن
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-5 py-12 sm:px-8 lg:px-20 lg:py-20">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[var(--brand-400)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[var(--accent-500)]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-extrabold text-[var(--brand-700)] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-500)]" />
              منصة عربية متخصصة في تعليم التصوير
            </div>

            <h2 className="max-w-4xl text-4xl font-extrabold leading-tight text-[var(--brand-900)] sm:text-5xl lg:text-6xl">
              تعلّم التصوير وصناعة المحتوى
              <span className="block text-[var(--brand-700)]">
                بخطة عملية تقودك للاحتراف
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-9 text-[var(--text-muted)]">
              {siteName} تقدم كورسات عربية منظمة في التصوير، الإضاءة،
              الريتاتش، وصناعة المحتوى؛ مع تجربة تعلم واضحة ومناسبة للموبايل
              ولوحة طالب مخصصة.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="rounded-xl bg-[var(--accent-500)] px-7 py-4 text-center text-base font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--accent-600)]"
              >
                تصفّح الكورسات
              </Link>

              <Link
                href="/register"
                className="rounded-xl border border-[var(--border-soft)] bg-white px-7 py-4 text-center text-base font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)]"
              >
                إنشاء حساب طالب
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[var(--brand-700)]">
                  {featuredCourses.length}
                </div>
                <div className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                  كورسات مميزة
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[var(--brand-700)]">
                  100%
                </div>
                <div className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                  تجربة عربية
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[var(--brand-700)]">
                  PDF
                </div>
                <div className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                  مرفقات عملية
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[var(--brand-700)]">
                  UX
                </div>
                <div className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                  موبايل أولًا
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-[var(--brand-400)]/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white p-4 shadow-xl">
              <div className="rounded-[1.5rem] bg-[var(--brand-950)] p-6 text-white">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-white/60">
                      رحلة الطالب
                    </p>
                    <h3 className="mt-1 text-2xl font-extrabold">
                      من اختيار الكورس إلى التعلم
                    </h3>
                  </div>

                  <div className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold">
                    تجربة كاملة
                  </div>
                </div>

                <div className="mb-6 flex justify-center rounded-[1.25rem] bg-white p-5">
                  <Image
                    src="/logo-taswerak.png"
                    alt={siteName}
                    width={360}
                    height={200}
                    className="h-32 w-auto object-contain"
                    priority
                  />
                </div>

                <div className="space-y-4">
                  {learningSteps.map((step, index) => (
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
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                  <p className="text-xs font-bold text-[var(--text-muted)]">
                    محتوى
                  </p>
                  <p className="mt-1 font-extrabold text-[var(--brand-900)]">
                    فيديو + مرفقات
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                  <p className="text-xs font-bold text-[var(--text-muted)]">
                    دفع
                  </p>
                  <p className="mt-1 font-extrabold text-[var(--brand-900)]">
                    تحويل يدوي
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                  <p className="text-xs font-bold text-[var(--text-muted)]">
                    متابعة
                  </p>
                  <p className="mt-1 font-extrabold text-[var(--brand-900)]">
                    تقدم الطالب
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-8 sm:px-8 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-bold text-[var(--brand-500)]">
                مسارات تعليمية
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-[var(--brand-900)]">
                اختر المجال الذي يناسب هدفك
              </h3>
            </div>

            <Link
              href="/courses"
              className="text-sm font-extrabold text-[var(--brand-700)] transition hover:text-[var(--accent-500)]"
            >
              عرض كل الكورسات ←
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {categoryHighlights.map((category) => (
              <Link
                key={category}
                href="/courses"
                className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)] hover:text-[var(--brand-700)]"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-8 pt-6 sm:px-8 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-4">
          {platformFeatures.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-50)] text-[var(--brand-700)] transition group-hover:scale-105">
                <span className="h-3 w-3 rounded-full bg-[var(--brand-600)]" />
              </div>

              <h3 className="text-lg font-extrabold text-[var(--brand-900)]">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm font-bold leading-7 text-[var(--text-muted)]">
                {feature.description}
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
              <h3 className="mt-2 text-3xl font-extrabold text-[var(--brand-900)]">
                ابدأ رحلتك التعليمية من هنا
              </h3>
            </div>

            <Link
              href="/courses"
              className="hidden text-sm font-extrabold text-[var(--brand-900)] transition hover:text-[var(--accent-500)] sm:block"
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
                        <h4 className="line-clamp-2 min-h-14 text-xl font-extrabold leading-7 text-[var(--brand-900)] transition group-hover:text-[var(--brand-700)]">
                          {course.title}
                        </h4>
                      </Link>

                      {course.subtitle ? (
                        <p className="mt-3 line-clamp-2 min-h-14 text-sm leading-7 text-[var(--text-muted)]">
                          {course.subtitle}
                        </p>
                      ) : null}

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-4">
                        <strong className="text-lg font-extrabold text-[var(--brand-900)]">
                          {formatPrice(course.salePrice ?? course.price)}
                        </strong>

                        <Link
                          href={`/courses/${course.slug}`}
                          className="rounded-xl bg-[var(--accent-500)] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--accent-600)]"
                        >
                          التفاصيل
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