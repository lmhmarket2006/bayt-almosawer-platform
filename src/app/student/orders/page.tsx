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
    return "مجاني";
  }

  return `${price.toLocaleString("ar-SA")} ريال`;
}

function getPaymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "بانتظار الدفع",
    PAID: "مدفوع",
    REJECTED: "مرفوض",
    REFUNDED: "مسترد",
  };

  return labels[status] ?? status;
}

function getOrderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "قيد المراجعة",
    CONFIRMED: "مؤكد",
    CANCELLED: "ملغي",
    REFUNDED: "مسترد",
  };

  return labels[status] ?? status;
}

function getMessage(message?: string) {
  const messages: Record<string, string> = {
    created:
      "تم إنشاء طلب الشراء بنجاح. برجاء تحويل المبلغ ثم انتظار تأكيد الإدارة.",
    "pending-exists": "لديك طلب شراء قيد المراجعة لهذا الكورس بالفعل.",
    "already-enrolled": "هذا الكورس مفتوح لك بالفعل.",
  };

  return message ? messages[message] : null;
}

export default async function StudentOrdersPage({
  searchParams,
}: StudentOrdersPageProps) {
  const user = await requireUser();

  const params = await searchParams;
  const message = getMessage(params.message);

  const orders = await prisma.order.findMany({
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
  });

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <Link
            href="/student"
            className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
          >
            ← العودة للوحة الطالب
          </Link>

          <p className="font-bold text-[var(--brand-500)]">طلبات الطالب</p>
          <h1 className="mt-2 text-3xl font-extrabold">طلباتي</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            هنا تظهر طلبات شراء الكورسات وحالة الدفع والتأكيد.
          </p>
        </div>

        {message ? (
          <div className="mb-6 rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-4 text-sm font-bold text-[var(--brand-700)] shadow-sm">
            {message}
          </div>
        ) : null}

        {orders.length === 0 ? (
          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-extrabold">لا توجد طلبات بعد</h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              عند شراء كورس سيظهر الطلب هنا.
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-pink-500/20"
            >
              تصفح الكورسات
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 border-b border-[var(--border-soft)] pb-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)]">
                      رقم الطلب
                    </p>
                    <h2 className="mt-1 text-lg font-extrabold">{order.id}</h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]">
                      {getOrderStatusLabel(order.orderStatus)}
                    </span>
                    <span className="rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]">
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between gap-3 rounded-2xl bg-[var(--surface-soft)] p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-extrabold">{item.course.title}</p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          {item.course.subtitle}
                        </p>
                      </div>

                      <strong className="text-lg text-[var(--brand-900)]">
                        {formatPrice(item.price)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-sm text-[var(--text-muted)]">
                    تاريخ الطلب:{" "}
                    {order.createdAt.toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  <strong className="text-xl text-[var(--brand-900)]">
                    الإجمالي: {formatPrice(order.finalAmount)}
                  </strong>
                </div>

                {order.paymentStatus === "PENDING" ? (
                  <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-4 text-sm leading-7 text-[var(--text-muted)]">
                    <strong className="text-[var(--brand-900)]">
                      تعليمات الدفع اليدوي:
                    </strong>{" "}
                    حوّل قيمة الكورس على حساب الأكاديمية، ثم تواصل مع الإدارة
                    لإرسال إيصال التحويل. بعد التأكيد سيتم فتح الكورس لك.
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}