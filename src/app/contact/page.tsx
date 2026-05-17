import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function cleanWhatsAppNumber(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.replace(/\D/g, "");
}

export default async function ContactPage() {
  const settings = await prisma.platformSettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  const whatsappNumber = cleanWhatsAppNumber(settings?.whatsappNumber);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <section className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <Link
            href="/"
            className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
          >
            ← العودة للرئيسية
          </Link>

          <p className="font-bold text-[var(--brand-500)]">تواصل معنا</p>
          <h1 className="mt-2 text-3xl font-extrabold">
            نحن هنا لمساعدتك
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
            لأي استفسار حول الكورسات، الدفع، أو فتح الوصول، يمكنك التواصل معنا
            عبر القنوات التالية.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {settings?.supportEmail ? (
            <a
              href={`mailto:${settings.supportEmail}`}
              className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="font-bold text-[var(--brand-500)]">البريد</p>
              <h2 className="mt-2 text-xl font-extrabold">راسلنا</h2>
              <p className="mt-3 break-all text-sm text-[var(--text-muted)]" dir="ltr">
                {settings.supportEmail}
              </p>
            </a>
          ) : null}

          {settings?.supportPhone ? (
            <a
              href={`tel:${settings.supportPhone}`}
              className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="font-bold text-[var(--brand-500)]">الهاتف</p>
              <h2 className="mt-2 text-xl font-extrabold">اتصل بنا</h2>
              <p className="mt-3 text-sm text-[var(--text-muted)]" dir="ltr">
                {settings.supportPhone}
              </p>
            </a>
          ) : null}

          {whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-[2rem] border border-green-200 bg-green-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="font-bold text-green-700">واتساب</p>
              <h2 className="mt-2 text-xl font-extrabold text-green-900">
                تواصل سريع
              </h2>
              <p className="mt-3 text-sm text-green-700" dir="ltr">
                {whatsappNumber}
              </p>
            </a>
          ) : null}
        </section>

        {!settings?.supportEmail && !settings?.supportPhone && !whatsappNumber ? (
          <section className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-extrabold">
              لم يتم إدخال بيانات التواصل بعد
            </h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              يمكنك إدخال بيانات التواصل من لوحة الإدارة.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}