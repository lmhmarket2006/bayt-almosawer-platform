import Link from "next/link";
import { requireRole } from "@/lib/auth";

type AdminSecurityPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

function getMessage(message?: string) {
  const messages: Record<string, string> = {
    "password-updated": "تم تغيير كلمة المرور بنجاح.",
  };

  return message ? messages[message] : null;
}

function getError(error?: string) {
  const errors: Record<string, string> = {
    "missing-fields": "من فضلك أكمل جميع الحقول.",
    "wrong-current-password": "كلمة المرور الحالية غير صحيحة.",
    "password-too-short": "كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف.",
    "password-mismatch": "كلمة المرور الجديدة وتأكيدها غير متطابقين.",
  };

  return error ? errors[error] : null;
}

export default async function AdminSecurityPage({
  searchParams,
}: AdminSecurityPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const message = getMessage(params.message);
  const error = getError(params.error);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <section className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <Link
            href="/admin"
            className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
          >
            ← العودة للوحة الإدارة
          </Link>

          <p className="font-bold text-[var(--brand-500)]">الأمان</p>
          <h1 className="mt-2 text-3xl font-extrabold">
            تغيير كلمة مرور الأدمن
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            غيّر كلمة المرور التجريبية إلى كلمة قوية قبل الاستخدام التجاري.
          </p>
        </section>

        {message ? (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        <form
          action="/api/admin/security/change-password"
          method="POST"
          className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-extrabold">
                كلمة المرور الحالية
              </label>
              <input
                name="currentPassword"
                type="password"
                required
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                كلمة المرور الجديدة
              </label>
              <input
                name="newPassword"
                type="password"
                required
                minLength={8}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
            >
              تغيير كلمة المرور
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}