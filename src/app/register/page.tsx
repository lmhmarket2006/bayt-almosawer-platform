import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPlatformSiteName } from "@/lib/platform-settings";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getRegisterError(error?: string) {
  const errors: Record<string, string> = {
    "missing-fields": "من فضلك أكمل جميع الحقول المطلوبة.",
    "email-exists": "هذا البريد الإلكتروني مستخدم من قبل.",
    "password-too-short": "كلمة المرور يجب ألا تقل عن 8 أحرف.",
    "password-mismatch": "كلمة المرور وتأكيدها غير متطابقين.",
    "invalid-email": "البريد الإلكتروني غير صالح.",
  };

  return error ? errors[error] ?? error : null;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const user = await getCurrentUser();
  const siteName = await getPlatformSiteName();

  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/student");
  }

  const params = await searchParams;
  const error = getRegisterError(params.error);

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
              حساب طالب جديد
            </div>

            <h1 className="text-4xl font-extrabold leading-tight">
              ابدأ رحلتك التعليمية
              <span className="block bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--accent-500)] bg-clip-text text-transparent">
                في التصوير وصناعة المحتوى
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-8 text-white/65">
              أنشئ حسابك للوصول إلى تجربة تعلم منظمة، شراء الكورسات، متابعة
              الطلبات، ومشاهدة الدروس والمرفقات بعد تأكيد الدفع.
            </p>

            <div className="mt-10 grid gap-3">
              {[
                "أنشئ حساب طالب خلال دقيقة",
                "اختر الكورس المناسب لك",
                "تابع طلباتك وكورساتك من لوحة واحدة",
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
              إنشاء حساب طالب
            </p>

            <h2 className="mt-2 text-3xl font-extrabold">
              انضم إلى {siteName}
            </h2>

            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              أنشئ حسابك لمتابعة كورساتك ودروسك وطلباتك داخل منصة تعليمية منظمة.
            </p>
          </div>

          {error ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">
              {error}
            </div>
          ) : null}

          <form action="/api/auth/register" method="POST" className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-extrabold">
                الاسم الكامل
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                placeholder="مثال: محمد سعيد"
              />
            </div>

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
                رقم الجوال
              </label>
              <input
                name="phone"
                type="tel"
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  كلمة المرور
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                  placeholder="8 أحرف على الأقل"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  تأكيد كلمة المرور
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                  placeholder="أعد كتابة كلمة المرور"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              إنشاء الحساب
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 text-center text-sm text-[var(--text-muted)]">
            لديك حساب بالفعل؟{" "}
            <Link
              href="/login"
              className="font-extrabold text-[var(--brand-600)] transition hover:text-[var(--accent-500)]"
            >
              تسجيل الدخول
            </Link>
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/courses"
              className="text-sm font-extrabold text-[var(--text-muted)] transition hover:text-[var(--brand-600)]"
            >
              تصفّح الكورسات قبل التسجيل ←
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}