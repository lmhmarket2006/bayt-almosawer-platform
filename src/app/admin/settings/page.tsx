import Link from "next/link";
import { AdminAlert } from "@/components/AdminAlert";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getAdminError, getAdminMessage } from "@/lib/admin-messages";

type AdminSettingsPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

export default async function AdminSettingsPage({
  searchParams,
}: AdminSettingsPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;

  const message = getAdminMessage(params.message);
  const error = getAdminError(params.error);

  const settings =
    (await prisma.platformSettings.findFirst()) ??
    (await prisma.platformSettings.create({
      data: {
        siteName: "منصة بيت المصور التعليمية",
        supportEmail: "",
        supportPhone: "",
        whatsappNumber: "",
        bankName: "",
        bankAccountName: "",
        bankAccountNumber: "",
        bankIban: "",
        orderInstructions:
          "بعد إنشاء طلب الشراء، يرجى تحويل قيمة الكورس على الحساب البنكي ثم التواصل مع الإدارة لإرسال إيصال التحويل. بعد التأكد من الدفع سيتم فتح الكورس داخل حساب الطالب.",
      },
    }));

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <section className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <Link
            href="/admin"
            className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
          >
            ← العودة للوحة الإدارة
          </Link>

          <p className="font-bold text-[var(--brand-500)]">إعدادات المنصة</p>

          <h1 className="mt-2 text-3xl font-extrabold">
            بيانات التشغيل والدفع
          </h1>

          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            هذه البيانات ستُستخدم في تعليمات الدفع والتواصل مع الطلاب وتجهيز
            المنصة للاستخدام التجاري الحقيقي.
          </p>
        </section>

        {message ? <AdminAlert type="success">{message}</AdminAlert> : null}
        {error ? <AdminAlert type="error">{error}</AdminAlert> : null}

        <form
          action="/api/admin/settings/update"
          method="POST"
          className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8"
        >
          <input type="hidden" name="id" value={settings.id} />

          <div className="grid gap-6">
            <div>
              <h2 className="text-2xl font-extrabold">بيانات المنصة</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                البيانات الأساسية التي تظهر في التواصل وتجربة المستخدم.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                اسم المنصة
              </label>
              <input
                name="siteName"
                defaultValue={settings.siteName}
                required
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  البريد الرسمي
                </label>
                <input
                  name="supportEmail"
                  type="email"
                  dir="ltr"
                  defaultValue={settings.supportEmail ?? ""}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                  placeholder="support@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  رقم الدعم
                </label>
                <input
                  name="supportPhone"
                  dir="ltr"
                  defaultValue={settings.supportPhone ?? ""}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                  placeholder="05xxxxxxxx"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  رقم واتساب
                </label>
                <input
                  name="whatsappNumber"
                  dir="ltr"
                  defaultValue={settings.whatsappNumber ?? ""}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                  placeholder="9665xxxxxxxx"
                />
              </div>
            </div>

            <div className="border-t border-[var(--border-soft)] pt-6">
              <h2 className="text-2xl font-extrabold">
                بيانات التحويل البنكي
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                هذه البيانات ستظهر لاحقًا للطالب بعد إنشاء طلب الشراء اليدوي.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  اسم البنك
                </label>
                <input
                  name="bankName"
                  defaultValue={settings.bankName ?? ""}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                  placeholder="مثال: البنك الأهلي السعودي"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  اسم صاحب الحساب
                </label>
                <input
                  name="bankAccountName"
                  defaultValue={settings.bankAccountName ?? ""}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                  placeholder="مثال: بيت المصور"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  رقم الحساب
                </label>
                <input
                  name="bankAccountNumber"
                  dir="ltr"
                  defaultValue={settings.bankAccountNumber ?? ""}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                  placeholder="رقم الحساب البنكي"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  IBAN
                </label>
                <input
                  name="bankIban"
                  dir="ltr"
                  defaultValue={settings.bankIban ?? ""}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                  placeholder="SA..."
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                تعليمات الدفع اليدوي
              </label>
              <textarea
                name="orderInstructions"
                rows={6}
                defaultValue={settings.orderInstructions ?? ""}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 leading-8 outline-none transition focus:border-[var(--brand-500)]"
                placeholder="اكتب تعليمات الدفع التي ستظهر للطالب بعد إنشاء الطلب."
              />
            </div>

            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 text-sm leading-7 text-[var(--text-muted)]">
              بعد حفظ هذه البيانات، ستظهر للطالب داخل صفحة الطلبات عند إنشاء طلب
              شراء يدوي، مع إمكانية التواصل عبر واتساب لإرسال إيصال التحويل.
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
            >
              حفظ الإعدادات
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}