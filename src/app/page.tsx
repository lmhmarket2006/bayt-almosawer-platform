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
    title: "تعلم عملي خطوة بخطوة",
    description:
      "كورسات تصوير وصناعة محتوى مبنية على التطبيق العملي، وليست مجرد شرح نظري.",
  },
  {
    title: "مدربون متخصصون",
    description:
      "تعلّم من خبرات عملية في تصوير المنتجات، الميكب، البورتريه، الطعام، والريتاتش.",
  },
  {
    title: "محتوى منظم للموبايل",
    description:
      "تجربة تعلم سهلة على الجوال والكمبيوتر، مع دروس مرتبة ومرفقات لكل كورس.",
  },
  {
    title: "فتح الكورسات بعد التأكيد",
    description:
      "أنشئ طلبك، وبعد تأكيد الإدارة يتم فتح الكورس داخل حسابك مباشرة.",
  },
];

const learningTracks = [
  "تصوير الميكب",
  "تصوير الأطعمة",
  "Beauty Photography",
  "High-End Retouching",
  "تصوير البورتريه",
  "إضاءة الاستديو",
];

const testimonials = [
  {
    name: "سارة محمد",
    role: "مصورة مبتدئة",
    text: "طريقة الشرح منظمة جدًا وساعدتني أفهم الإضاءة والتكوين بشكل عملي. حسيت أن الكورس معمول للمصور العربي فعلًا.",
  },
  {
    name: "عبدالله فهد",
    role: "صانع محتوى",
    text: "أكثر شيء أعجبني أن الدروس قصيرة وواضحة، والتطبيقات عملية. قدرت أطور جودة صوري ومحتواي بسرعة.",
  },
  {
    name: "نورة أحمد",
    role: "صاحبة متجر",
    text: "كورسات تصوير المنتجات ساعدتني أطلع صور أفضل لمتجري بدون تعقيد. التجربة بسيطة ومناسبة للموبايل.",
  },
];

const stats = [
  {
    value: "100%",
    label: "محتوى عربي",
  },
  {
    value: "6+",
    label: "مسارات تصوير",
  },
  {
    value: "HD",
    label: "تجربة مشاهدة",
  },
  {
    value: "24/7",
    label: "وصول للمحتوى",
  },
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
            ابدأ التعلم
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-images/homepage-hero-studio.png"
            alt="تعلم التصوير الاحترافي"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[var(--brand-950)]/80" />
          <div className="absolute inset-0 bg-gradient-to-l from-[var(--brand-950)] via-[var(--brand-950)]/85 to-[var(--brand-950)]/45" />
        </div>

        <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-20 lg:py-24">
          <div className="text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-extrabold text-white shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-500)]" />
              أول منصة عربية متخصصة في تعليم التصوير العملي
            </div>

            <h1 className="max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              تعلّم التصوير وصناعة المحتوى
              <span className="block text-[var(--brand-300)]">
                من الأساسيات إلى الاحتراف
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg font-bold leading-9 text-white/75">
              كورسات عربية عملية في تصوير الميكب، الأطعمة، البورتريه، الإضاءة،
              والريتاتش — بتجربة تعليمية منظمة تشبه المنصات العالمية ومناسبة
              للموبايل.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="rounded-xl bg-[var(--accent-500)] px-7 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-[var(--accent-600)]"
              >
                تصفّح الكورسات
              </Link>

              <Link
                href="/register"
                className="rounded-xl border border-white/35 bg-transparent px-7 py-4 text-center text-base font-extrabold text-white transition hover:-translate-y-0.5 hover:border-[var(--brand-300)] hover:bg-white/10"
              >
                إنشاء حساب طالب
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur"
                >
                  <div className="text-2xl font-extrabold text-white">
                    {item.value}
                  </div>
                  <div className="mt-1 text-xs font-bold text-white/65">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-white/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white p-4 shadow-2xl">
              <div className="relative h-[430px] overflow-hidden rounded-[1.5rem] bg-[var(--surface-soft)]">
                <Image
                  src="/hero-images/homepage-hero-studio.png"
                  alt="كورسات تصوير احترافية"
                  fill
                  sizes="45vw"
                  className="object-cover"
                  priority
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-5 shadow-sm backdrop-blur">
                  <p className="text-xs font-extrabold text-[var(--brand-700)]">
                    تجربة تعليمية احترافية
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-[var(--brand-950)]">
                    تعلم بالصور، الفيديو، المرفقات، والتطبيق العملي
                  </h2>
                  <p className="mt-3 text-sm font-bold leading-7 text-[var(--text-muted)]">
                    كل كورس مصمم ليأخذك من الفهم إلى التطبيق بخطوات واضحة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="px-5 py-12 sm:px-8 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-bold text-[var(--brand-500)]">
                مسارات تعليمية
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-[var(--brand-900)]">
                اختر المجال الذي يناسب هدفك
              </h2>
            </div>

            <Link
              href="/courses"
              className="text-sm font-extrabold text-[var(--brand-700)] transition hover:text-[var(--accent-500)]"
            >
              عرض كل الكورسات ←
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {learningTracks.map((track) => (
              <Link
                key={track}
                href="/courses"
                className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)] hover:text-[var(--brand-700)]"
              >
                {track}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-12 sm:px-8 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-4">
          {platformFeatures.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-50)] transition group-hover:scale-105">
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

      <section className="bg-white px-5 py-14 sm:px-8 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-bold text-[var(--brand-500)]">
                الكورسات المميزة
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-[var(--brand-900)]">
                ابدأ رحلتك التعليمية من هنا
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-bold leading-7 text-[var(--text-muted)]">
                اختر من الكورسات المختارة وابدأ التعلم بخطوات عملية واضحة.
              </p>
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
              <h3 className="text-2xl font-extrabold">
                لا توجد كورسات منشورة بعد
              </h3>
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
                        <h3 className="min-h-14 text-xl font-extrabold leading-7 text-[var(--brand-900)] transition group-hover:text-[var(--brand-700)]">
                          {course.title}
                        </h3>
                      </Link>

                      {course.subtitle ? (
                        <p className="mt-3 min-h-14 text-sm leading-7 text-[var(--text-muted)]">
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

      <section className="px-5 py-14 sm:px-8 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="font-bold text-[var(--brand-500)]">
              آراء المشتركين
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-[var(--brand-900)]">
              تجربة تعلم يثق بها المصورون وصناع المحتوى
            </h2>
            <p className="mt-3 text-sm font-bold leading-7 text-[var(--text-muted)]">
              آراء تجريبية يمكن استبدالها لاحقًا بآراء حقيقية من الطلاب بعد
              الإطلاق.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex gap-1 text-lg text-amber-400">
                  ★★★★★
                </div>

                <p className="text-sm font-bold leading-8 text-[var(--text-muted)]">
                  “{testimonial.text}”
                </p>

                <div className="mt-5 border-t border-[var(--border-soft)] pt-4">
                  <p className="font-extrabold text-[var(--brand-900)]">
                    {testimonial.name}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-14 sm:px-8 lg:px-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[var(--brand-950)] p-8 text-white shadow-xl lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="font-bold text-white/60">ابدأ الآن</p>
              <h2 className="mt-3 text-3xl font-extrabold lg:text-4xl">
                جاهز تطور تصويرك ومحتواك؟
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-bold leading-8 text-white/65">
                اختر الكورس المناسب، أنشئ حسابك، وابدأ رحلة تعلم منظمة تساعدك
                على إنتاج صور وفيديوهات أكثر احترافية.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                href="/courses"
                className="rounded-xl bg-[var(--accent-500)] px-6 py-4 text-center text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[var(--accent-600)]"
              >
                تصفح الكورسات
              </Link>

              <Link
                href="/register"
                className="rounded-xl border border-white/35 bg-transparent px-6 py-4 text-center text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:border-[var(--brand-300)] hover:bg-white/10"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border-soft)] bg-white px-5 py-10 sm:px-8 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[var(--border-soft)]">
                <Image
                  src="/logo-taswerak.png"
                  alt={siteName}
                  width={220}
                  height={120}
                  className="h-full w-full object-contain p-1.5"
                />
              </div>

              <div>
                <h3 className="font-extrabold text-[var(--brand-900)]">
                  {siteName}
                </h3>
                <p className="text-xs font-bold text-[var(--text-muted)]">
                  منصة تعليم التصوير وصناعة المحتوى
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm font-bold leading-8 text-[var(--text-muted)]">
              منصة عربية تساعد المصورين وصناع المحتوى على تطوير مهاراتهم من
              خلال كورسات عملية منظمة وتجربة تعلم احترافية.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-[var(--brand-900)]">المنصة</h4>
            <div className="mt-4 grid gap-3 text-sm font-bold text-[var(--text-muted)]">
              <Link href="/">الرئيسية</Link>
              <Link href="/courses">الكورسات</Link>
              <Link href="/login">تسجيل الدخول</Link>
              <Link href="/register">إنشاء حساب</Link>
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-[var(--brand-900)]">
              روابط مهمة
            </h4>
            <div className="mt-4 grid gap-3 text-sm font-bold text-[var(--text-muted)]">
              <Link href="/privacy">سياسة الخصوصية</Link>
              <Link href="/terms">الشروط والأحكام</Link>
              <Link href="/refund-policy">سياسة الاسترجاع</Link>
              <Link href="/contact">تواصل معنا</Link>
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-[var(--brand-900)]">
              ابدأ التعلم
            </h4>
            <p className="mt-4 text-sm font-bold leading-7 text-[var(--text-muted)]">
              تصفح الكورسات واختر المسار المناسب لهدفك في التصوير وصناعة
              المحتوى.
            </p>

            <Link
              href="/courses"
              className="mt-5 inline-flex rounded-xl bg-[var(--brand-700)] px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[var(--brand-600)]"
            >
              عرض الكورسات
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-col justify-between gap-3 border-t border-[var(--border-soft)] pt-6 text-xs font-bold text-[var(--text-muted)] sm:flex-row">
          <p>© {new Date().getFullYear()} {siteName}. جميع الحقوق محفوظة.</p>
          <p>تصميم وتجربة تعليمية عربية احترافية.</p>
        </div>
      </footer>
    </main>
  );
}