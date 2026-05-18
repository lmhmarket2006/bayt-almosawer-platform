import Link from "next/link";
import { getPlatformSettings } from "@/lib/platform-settings";

export const dynamic = "force-dynamic";

function cleanWhatsAppNumber(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.replace(/\D/g, "");
}

export default async function ContactPage() {
  const settings = await getPlatformSettings();
  const whatsappNumber = cleanWhatsAppNumber(settings?.whatsappNumber);
  const siteName = settings.siteName || "منصة تصويرك التعليمية";

  const hasContactInfo =
    settings?.supportEmail || settings?.supportPhone || whatsappNumber;

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white shadow-sm">
          <div className="pointer-events-none absolute -right-20 top-8 h-72 w-72 rounded-full bg-[var(--brand-400)]/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-8 h-72 w-72 rounded-full bg-[var(--accent-500)]/15 blur-3xl" />

          <div className="relative grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 sm:p-8">
              <Link
                href="/"
                className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)] transition hover:text-[var(--accent-500)]"
              >
                ← العودة للرئيسية
              </Link>

              <p className="font-bold text-[var(--brand-500)]">تواصل معنا</p>

              <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
                نحن هنا لمساعدتك
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
                لأي استفسار حول الكورسات، الدفع، فتح الوصول، أو تجربة التعلم
                داخل {siteName} يمكنك التواصل معنا عبر القنوات التالية.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {whatsappNumber ? (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-5 py-3 text-center text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
                  >
                    تواصل عبر واتساب
                  </a>
                ) : null}

                <Link
                  href="/courses"
                  className="rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)]"
                >
                  تصفح الكورسات
                </Link>
              </div>
            </div>

            <div className="bg-[var(--brand-950)] p-6 text-white sm:p-8">
              <p className="text-sm font-bold text-white/60">دعم الطلاب</p>

              <div className="mt-5 rounded-[1.5rem] bg-white/10 p-5">
                <h2 className="text-2xl font-extrabold">
                  أسرع طريقة للوصول إلينا
                </h2>

                <p className="mt-3 text-sm leading-7 text-white/65">
                  أرسل لنا استفسارك مع اسم الكورس أو رقم الطلب إن وجد، وسنساعدك
                  في متابعة حالة الدفع أو فتح الكورس داخل حسابك.
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/60">الدفع</p>
                  <p className="mt-1 font-extrabold">تحويل يدوي</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/60">الدعم</p>
                  <p className="mt-1 font-extrabold">واتساب / بريد</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {hasContactInfo ? (
          <section className="grid gap-5 md:grid-cols-3">
            {settings?.supportEmail ? (
              <a
                href={`mailto:${settings.supportEmail}`}
                className="group rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-50)] text-xl">
                  ✉️
                </div>

                <p className="font-bold text-[var(--brand-500)]">البريد</p>
                <h2 className="mt-2 text-xl font-extrabold">راسلنا</h2>

                <p
                  className="mt-3 break-all text-sm text-[var(--text-muted)]"
                  dir="ltr"
                >
                  {settings.supportEmail}
                </p>

                <p className="mt-5 text-sm font-extrabold text-[var(--brand-600)] transition group-hover:text-[var(--accent-500)]">
                  إرسال بريد ←
                </p>
              </a>
            ) : null}

            {settings?.supportPhone ? (
              <a
                href={`tel:${settings.supportPhone}`}
                className="group rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-50)] text-xl">
                  📞
                </div>

                <p className="font-bold text-[var(--brand-500)]">الهاتف</p>
                <h2 className="mt-2 text-xl font-extrabold">اتصل بنا</h2>

                <p className="mt-3 text-sm text-[var(--text-muted)]" dir="ltr">
                  {settings.supportPhone}
                </p>

                <p className="mt-5 text-sm font-extrabold text-[var(--brand-600)] transition group-hover:text-[var(--accent-500)]">
                  اتصال مباشر ←
                </p>
              </a>
            ) : null}

            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[2rem] border border-green-200 bg-green-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl">
                  💬
                </div>

                <p className="font-bold text-green-700">واتساب</p>
                <h2 className="mt-2 text-xl font-extrabold text-green-900">
                  تواصل سريع
                </h2>

                <p className="mt-3 text-sm text-green-700" dir="ltr">
                  {whatsappNumber}
                </p>

                <p className="mt-5 text-sm font-extrabold text-green-700 transition group-hover:text-green-900">
                  فتح واتساب ←
                </p>
              </a>
            ) : null}
          </section>
        ) : (
          <section className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--accent-500)] text-2xl shadow-lg shadow-orange-500/20">
              📩
            </div>

            <h2 className="text-2xl font-extrabold">
              لم يتم إدخال بيانات التواصل بعد
            </h2>

            <p className="mt-3 text-sm text-[var(--text-muted)]">
              يمكنك إدخال بيانات التواصل من لوحة الإدارة في صفحة إعدادات المنصة.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}