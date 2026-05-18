import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPlatformSiteName } from "@/lib/platform-settings";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getLoginError(error?: string) {
  const errors: Record<string, string> = {
    "invalid-credentials": "بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.",
    "missing-fields": "من فضلك أدخل البريد الإلكتروني وكلمة المرور.",
    "inactive-account": "هذا الحساب موقوف حاليًا. تواصل مع الإدارة.",
  };

  return error ? errors[error] ?? error : null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  const siteName = await getPlatformSiteName();

  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/student");
  }

  const params = await searchParams;
  const error = getLoginError(params.error);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[var(--brand-400)]/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[var(--accent-500)]/15 blur-3xl" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden bg-[var(--brand-950)] p-8 text-white lg:block">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-16 w-28 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg">
              <Image
                src="/logo-taswerak.png"
                alt={siteName}
                width={220}
                height={120}
                className="h-full w-full object-contain p-1.5"
                priority
              />
            </div>

            <div>
              <p className="font-extrabold">{siteName}</p>
              <p className="mt-1 text-xs text-white/60">
                تعلّم التصوير وصناعة المحتوى.
              </p>
            </div>
          </Link>

          <div className="mt-16">
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/80">
              بوابة الطالب
            </div>

            <h1 className="text-4xl font-extrabold leading-tight">
              أكمل رحلتك التعليمية
              <span className="block bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--accent-500)] bg-clip-text text-transparent">
                من حيث توقفت
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-8 text-white/65">
              سجّل دخولك للوصول إلى كورساتك المفتوحة، متابعة طلبات الشراء،
              ومشاهدة الدروس والمرفقات التعليمية داخل لوحة تعلم منظمة.
            </p>

            <div className="mt-10 grid gap-3">
              {[
                "الوصول إلى الكورسات المفتوحة لك",
                "متابعة حالة طلبات الشراء",
                "مشاهدة الدروس والمرفقات التعليمية",
              ].map((item, index) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-400)] to-[var(--accent-500)] text-sm font-extrabold text-white">
                      {index + 1}
                    </div>
                    <p className="font-bold">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8 text-center lg:text-right">
            <Link href="/" className="mx-auto mb-5 inline-flex lg:hidden">
              <div className="flex h-16 w-28 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-[var(--border-soft)]">
                <Image
                  src="/logo-taswerak.png"
                  alt={siteName}
                  width={220}
                  height={120}
                  className="h-full w-full object-contain p-1.5"
                  priority
                />
              </div>
            </Link>

            <p className="font-bold text-[var(--brand-500)]">
              تسجيل الدخول
            </p>

            <h2 className="mt-2 text-3xl font-extrabold">
              أهلاً بعودتك
            </h2>

            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              ادخل إلى حسابك لمتابعة الكورسات والدروس الخاصة بك داخل {siteName}.
            </p>
          </div>

          {error ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">
              {error}
            </div>
          ) : null}

          <form action="/api/auth/login" method="POST" className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-extrabold">
                البريد الإلكتروني
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                placeholder="example@email.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                كلمة المرور
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                placeholder="اكتب كلمة المرور"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              دخول إلى الحساب
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 text-center text-sm text-[var(--text-muted)]">
            ليس لديك حساب؟{" "}
            <Link
              href="/register"
              className="font-extrabold text-[var(--brand-600)] transition hover:text-[var(--accent-500)]"
            >
              إنشاء حساب طالب جديد
            </Link>
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/courses"
              className="text-sm font-extrabold text-[var(--text-muted)] transition hover:text-[var(--brand-600)]"
            >
              تصفّح الكورسات أولًا ←
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}