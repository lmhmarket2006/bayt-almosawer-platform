import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type StudentOrdersPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

function formatPrice(value: unknown) {
  const price = Number(value);

  if (!price || price <= 0) {
    return "0 ريال";
  }

  return `${price.toLocaleString("ar-SA")} ريال`;
}

function getPaymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "بانتظار تأكيد الدفع",
    PAID: "مدفوع ومؤكد",
    REJECTED: "مرفوض",
    REFUNDED: "مسترد",
  };

  return labels[status] ?? status;
}

function getOrderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "قيد المراجعة",
    CONFIRMED: "تم التأكيد",
    CANCELLED: "ملغي",
    REFUNDED: "مسترد",
  };

  return labels[status] ?? status;
}

function getMessage(message?: string) {
  const messages: Record<string, string> = {
    created:
      "تم إنشاء طلبك بنجاح. يرجى تنفيذ التحويل البنكي ثم إرسال إيصال الدفع للإدارة.",
    "already-pending": "لديك طلب سابق قيد المراجعة لهذا الكورس.",
  };

  return message ? messages[message] : null;
}

function cleanWhatsAppNumber(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.replace(/\D/g, "");
}

export default async function StudentOrdersPage({
  searchParams,
}: StudentOrdersPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const message = getMessage(params.message);

  const [orders, settings] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.platformSettings.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  const whatsappNumber = cleanWhatsAppNumber(settings?.whatsappNumber);

  const hasPaymentInfo =
    settings?.bankName ||
    settings?.bankAccountName ||
    settings?.bankAccountNumber ||
    settings?.bankIban ||
    settings?.orderInstructions ||
    whatsappNumber ||
    settings?.supportPhone ||
    settings?.supportEmail;

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <Link
            href="/student"
            className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
          >
            ← العودة للوحة الطالب
          </Link>

          <p className="font-bold text-[var(--brand-500)]">طلباتي</p>

          <h1 className="mt-2 text-3xl font-extrabold">
            طلبات شراء الكورسات
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
            هنا تظهر طلباتك وحالة تأكيد الدفع. إذا كان الطلب بانتظار الدفع،
            ستجد بيانات التحويل البنكي وتعليمات إرسال الإيصال في نفس الصفحة.
          </p>
        </section>

        {message ? (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold leading-7 text-green-700">
            {message}
          </div>
        ) : null}

        {orders.length === 0 ? (
          <section className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-extrabold">لا توجد طلبات بعد</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--text-muted)]">
              عند شراء أي كورس، سيظهر طلبك هنا بانتظار مراجعة الإدارة.
            </p>

            <Link
              href="/courses"
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-pink-500/20"
            >
              تصفح الكورسات
            </Link>
          </section>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isPendingPayment = order.paymentStatus === "PENDING";
              const firstCourseTitle =
                order.items[0]?.course.title ?? "طلب شراء كورس";

              const whatsappMessage = encodeURIComponent(
                `السلام عليكم، أرسلت إيصال تحويل لطلب شراء كورس: ${firstCourseTitle}\nرقم الطلب: ${order.id}\nالمبلغ: ${formatPrice(order.finalAmount)}\nالاسم: ${user.name}\nالبريد: ${user.email}`
              );

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white shadow-sm"
                >
                  <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="p-6 sm:p-8">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]">
                          {getOrderStatusLabel(order.orderStatus)}
                        </span>

                        <span className="rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]">
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                      </div>

                      <h2 className="text-2xl font-extrabold">
                        {firstCourseTitle}
                      </h2>

                      <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                        تاريخ الطلب:{" "}
                        {order.createdAt.toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>

                      <div className="mt-5 rounded-[1.5rem] bg-[var(--surface-soft)] p-5">
                        <p className="text-sm font-bold text-[var(--text-muted)]">
                          إجمالي الطلب
                        </p>
                        <p className="mt-2 text-3xl font-extrabold text-[var(--brand-900)]">
                          {formatPrice(order.finalAmount)}
                        </p>
                      </div>

                      <div className="mt-5 space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3"
                          >
                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                              <p className="font-bold">{item.course.title}</p>
                              <p className="text-sm font-extrabold text-[var(--brand-700)]">
                                {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.paymentStatus === "PAID" ? (
                        <Link
                          href="/student/my-courses"
                          className="mt-6 inline-flex rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
                        >
                          الذهاب إلى كورساتي
                        </Link>
                      ) : null}
                    </div>

                    <aside className="border-t border-[var(--border-soft)] bg-[var(--surface-soft)] p-6 sm:p-8 lg:border-t-0 lg:border-r">
                      {isPendingPayment ? (
                        <div>
                          <p className="font-bold text-[var(--brand-500)]">
                            تعليمات الدفع
                          </p>

                          <h3 className="mt-2 text-2xl font-extrabold">
                            بيانات التحويل البنكي
                          </h3>

                          {hasPaymentInfo ? (
                            <div className="mt-5 space-y-3">
                              {settings?.bankName ? (
                                <div className="rounded-2xl bg-white p-4">
                                  <p className="text-xs font-bold text-[var(--text-muted)]">
                                    اسم البنك
                                  </p>
                                  <p className="mt-1 font-extrabold">
                                    {settings.bankName}
                                  </p>
                                </div>
                              ) : null}

                              {settings?.bankAccountName ? (
                                <div className="rounded-2xl bg-white p-4">
                                  <p className="text-xs font-bold text-[var(--text-muted)]">
                                    اسم صاحب الحساب
                                  </p>
                                  <p className="mt-1 font-extrabold">
                                    {settings.bankAccountName}
                                  </p>
                                </div>
                              ) : null}

                              {settings?.bankAccountNumber ? (
                                <div className="rounded-2xl bg-white p-4">
                                  <p className="text-xs font-bold text-[var(--text-muted)]">
                                    رقم الحساب
                                  </p>
                                  <p className="mt-1 font-extrabold" dir="ltr">
                                    {settings.bankAccountNumber}
                                  </p>
                                </div>
                              ) : null}

                              {settings?.bankIban ? (
                                <div className="rounded-2xl bg-white p-4">
                                  <p className="text-xs font-bold text-[var(--text-muted)]">
                                    IBAN
                                  </p>
                                  <p
                                    className="mt-1 break-all font-extrabold"
                                    dir="ltr"
                                  >
                                    {settings.bankIban}
                                  </p>
                                </div>
                              ) : null}

                              {settings?.orderInstructions ? (
                                <div className="rounded-2xl bg-white p-4">
                                  <p className="text-xs font-bold text-[var(--text-muted)]">
                                    التعليمات
                                  </p>
                                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[var(--text-muted)]">
                                    {settings.orderInstructions}
                                  </p>
                                </div>
                              ) : null}

                              <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4">
                                <p className="text-xs font-bold text-[var(--text-muted)]">
                                  بعد التحويل
                                </p>
                                <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                                  أرسل إيصال التحويل للإدارة لمراجعة الطلب وفتح
                                  الكورس داخل حسابك.
                                </p>

                                {whatsappNumber ? (
                                  <a
                                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-4 block rounded-2xl bg-green-600 px-5 py-3 text-center text-sm font-extrabold text-white transition hover:-translate-y-0.5"
                                  >
                                    إرسال الإيصال عبر واتساب
                                  </a>
                                ) : null}

                                {settings?.supportPhone ? (
                                  <p className="mt-3 text-center text-sm font-bold text-[var(--text-muted)]">
                                    رقم الدعم:{" "}
                                    <span dir="ltr">
                                      {settings.supportPhone}
                                    </span>
                                  </p>
                                ) : null}

                                {settings?.supportEmail ? (
                                  <p className="mt-2 text-center text-sm font-bold text-[var(--text-muted)]">
                                    البريد:{" "}
                                    <span dir="ltr">
                                      {settings.supportEmail}
                                    </span>
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
                              لم يتم إدخال بيانات التحويل البنكي بعد. يرجى
                              التواصل مع الإدارة لإتمام الدفع.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-white p-5">
                          <p className="font-extrabold">
                            {order.paymentStatus === "PAID"
                              ? "تم تأكيد الدفع"
                              : "حالة الطلب"}
                          </p>
                          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                            {order.paymentStatus === "PAID"
                              ? "تم فتح الكورس داخل حسابك ويمكنك متابعته من صفحة كورساتي."
                              : "تابع حالة طلبك من هذه الصفحة."}
                          </p>
                        </div>
                      )}
                    </aside>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}