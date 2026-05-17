import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/student");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-xl rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-700)] via-[var(--brand-500)] to-[var(--brand-400)] text-xl font-extrabold text-white shadow-lg">
            ب
          </div>

          <h1 className="text-3xl font-extrabold">إنشاء حساب طالب</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            أنشئ حسابك لمتابعة كورساتك ودروسك داخل منصة بيت المصور التعليمية.
          </p>
        </div>

        {params.error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {params.error}
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

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            إنشاء الحساب
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-extrabold text-[var(--brand-600)]">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </main>
  );
}