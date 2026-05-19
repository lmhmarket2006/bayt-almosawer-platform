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
      "يختار الطالب الكورس، ينشئ طلب شراء، ثم يتم فتح المحتوى بعد تأكيد الدفع.",
  },
  {
    title: "لوحة تعلم محمية",
    description:
      "كل طالب يشاهد فقط الكورسات المفتوحة له مع دروس ومرفقات منظمة.",
  },
  {
    title: "جاهزة للتوسع",
    description:
      "بنية قابلة للتطوير لاحقًا بإضافة الشهادات، المدربين، الاشتراكات، والتقارير.",
  },
];

const learningSteps = [
  "اختر الكورس المناسب لهدفك",
  "أنشئ حساب طالب وطلب شراء",
  "أرسل إيصال التحويل للإدارة",
  "ابدأ التعلم ومتابعة تقدمك",
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
                تعلّم التصوير وصناعة المحتوى باحترافية.
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
              href="/login"
              className="transition hover:text-[var(--brand-600)]"
            >
              تسجيل الدخول
            </Link>
          </nav>

          <Link
            href="/courses"
            className="rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
          >
            ابدأ الآن
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-5 py-12 sm:px-8 lg:px-20 lg:py-20">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[var(--brand-400)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[var(--accent-500)]/15 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-extrabold text-[var(--brand-700)] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-500)]" />
              منصة عربية لتعليم التصوير وصناعة المحتوى
            </div>

            <h2 className="max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              طوّر مهارتك في التصوير
              <span className="block bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--accent-500)] bg-clip-text text-transparent">
                بتجربة تعلم احترافية ومنظمة
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-9 text-[var(--text-muted)]">
              {siteName} تساعدك على تعلم التصوير، الإضاءة، وصناعة المحتوى
              خطوة بخطوة من خلال كورسات عربية واضحة، مرفقات عملية، ولوحة تعلم
              مخصصة لكل طالب.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-7 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                تصفّح الكورسات
              </Link>

              <Link
                href="/register"
                className="rounded-2xl border border-[var(--border-soft)] bg-white px-7 py-4 text-center text-base font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)]"
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
                  كورسات منشورة
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
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-[var(--brand-400)]/25 via-transparent to-[var(--accent-500)]/25 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white p-4 shadow-2xl">
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

                  <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold">
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
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-400)] to-[var(--accent-500)] text-sm font-extrabold text-white">
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
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-4">
          {platformFeatures.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--accent-500)] shadow-lg shadow-cyan-500/10 transition group-hover:scale-105">
                <span className="h-3 w-3 rounded-full bg-white" />
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
              <h3 className="mt-2 text-3xl font-extrabold">
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
                    className="group overflow-hidden rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="relative mb-5 h-44 overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[var(--brand-950)] via-[var(--brand-700)] to-[var(--accent-500)]">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <>
                          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[var(--brand-400)]/30 blur-2xl" />
                          <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[var(--accent-500)]/30 blur-2xl" />
                        </>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
                          {course.category?.name ?? "كورس"}
                        </span>

                        <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
                          {lessonsCount} درس
                        </span>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[var(--brand-50)] px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
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

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <strong className="text-lg font-extrabold text-[var(--brand-900)]">
                        {formatPrice(course.salePrice ?? course.price)}
                      </strong>

                      <Link
                        href={`/courses/${course.slug}`}
                        className="rounded-xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
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