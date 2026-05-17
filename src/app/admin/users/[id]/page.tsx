import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type AdminUserDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatPrice(value: unknown) {
  const price = Number(value);

  if (!price || price <= 0) {
    return "0 ريال";
  }

  return `${price.toLocaleString("ar-SA")} ريال`;
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: "أدمن",
    STUDENT: "طالب",
  };

  return labels[role] ?? role;
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

export default async function AdminUserDetailsPage({
  params,
}: AdminUserDetailsPageProps) {
  await requireRole("ADMIN");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      enrollments: {
        include: {
          course: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      orders: {
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
      },
    },
  });

  if (!user) {
    notFound();
  }

  const enrolledCourseIds = user.enrollments.map(
    (enrollment) => enrollment.courseId
  );

  const availableCourses = await prisma.course.findMany({
    where: {
      isPublished: true,
      status: "PUBLISHED",
      id: {
        notIn: enrolledCourseIds.length > 0 ? enrolledCourseIds : ["__none__"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <Link
            href="/admin/users"
            className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
          >
            ← العودة للمستخدمين
          </Link>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="font-bold text-[var(--brand-500)]">
                تفاصيل المستخدم
              </p>

              <h1 className="mt-2 text-3xl font-extrabold">{user.name}</h1>

              <p className="mt-2 text-sm text-[var(--text-muted)]" dir="ltr">
                {user.email}
              </p>
            </div>

            <form
              action={`/api/admin/users/${user.id}/toggle-active`}
              method="POST"
            >
              <button
                type="submit"
                className={
                  user.isActive
                    ? "rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-extrabold text-red-700 transition hover:-translate-y-0.5"
                    : "rounded-2xl border border-green-100 bg-green-50 px-5 py-3 text-sm font-extrabold text-green-700 transition hover:-translate-y-0.5"
                }
              >
                {user.isActive ? "إيقاف الحساب" : "تفعيل الحساب"}
              </button>
            </form>
          </div>
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-4">
          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[var(--text-muted)]">الدور</p>
            <p className="mt-2 text-2xl font-extrabold text-[var(--brand-700)]">
              {getRoleLabel(user.role)}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[var(--text-muted)]">الحالة</p>
            <p className="mt-2 text-2xl font-extrabold text-[var(--brand-700)]">
              {user.isActive ? "نشط" : "موقوف"}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[var(--text-muted)]">
              الكورسات المفتوحة
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[var(--brand-700)]">
              {user.enrollments.length}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[var(--text-muted)]">
              الطلبات
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[var(--brand-700)]">
              {user.orders.length}
            </p>
          </div>
        </section>

        {user.role === "STUDENT" ? (
          <section className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold">فتح كورس يدويًا</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
              استخدم هذا الخيار إذا أردت فتح كورس لهذا الطالب بدون طلب شراء.
            </p>

            {availableCourses.length === 0 ? (
              <div className="mt-5 rounded-2xl bg-[var(--surface-soft)] p-5 text-sm font-bold text-[var(--text-muted)]">
                لا توجد كورسات متاحة للفتح أو كل الكورسات مفتوحة لهذا الطالب.
              </div>
            ) : (
              <form
                action={`/api/admin/users/${user.id}/grant-course`}
                method="POST"
                className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]"
              >
                <select
                  name="courseId"
                  required
                  className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                >
                  <option value="">اختر كورس</option>
                  {availableCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-pink-500/20"
                >
                  فتح الكورس
                </button>
              </form>
            )}
          </section>
        ) : null}

        <section className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold">الكورسات المفتوحة</h2>

          {user.enrollments.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[var(--surface-soft)] p-5 text-sm font-bold text-[var(--text-muted)]">
              لا توجد كورسات مفتوحة لهذا المستخدم.
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {user.enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl bg-[var(--surface-soft)] p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-extrabold">{enrollment.course.title}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {enrollment.isActive ? "مفتوح" : "غير نشط"} —{" "}
                      {enrollment.createdAt.toLocaleDateString("ar-SA")}
                    </p>
                  </div>

                  <form
                    action={`/api/admin/users/${user.id}/revoke-course`}
                    method="POST"
                  >
                    <input
                      type="hidden"
                      name="courseId"
                      value={enrollment.courseId}
                    />

                    <button
                      type="submit"
                      className="rounded-2xl border border-red-100 bg-red-50 px-4 py-2 text-xs font-extrabold text-red-700 transition hover:-translate-y-0.5"
                    >
                      إلغاء فتح الكورس
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold">طلبات المستخدم</h2>

          {user.orders.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[var(--surface-soft)] p-5 text-sm font-bold text-[var(--text-muted)]">
              لا توجد طلبات لهذا المستخدم.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {user.orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-extrabold">
                        {order.items[0]?.course.title ?? "طلب شراء كورس"}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {order.createdAt.toLocaleDateString("ar-SA")}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                        {formatPrice(order.finalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}