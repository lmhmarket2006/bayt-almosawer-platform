import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/student");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-lg rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-700)] via-[var(--brand-500)] to-[var(--brand-400)] text-xl font-extrabold text-white shadow-lg">
            ب
          </div>

          <h1 className="text-3xl font-extrabold">تسجيل الدخول</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            ادخل إلى حسابك لمتابعة الكورسات والدروس الخاصة بك.
          </p>
        </div>

        {params.error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {params.error}
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
            className="w-full rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            دخول
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-extrabold text-[var(--brand-600)]">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </main>
  );
}