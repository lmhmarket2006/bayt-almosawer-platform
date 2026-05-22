import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "قيد المراجعة",
    APPROVED: "مقبول",
    REJECTED: "مرفوض",
  };

  return labels[status] ?? status;
}

function getStatusClassName(status: string) {
  const classes: Record<string, string> = {
    PENDING:
      "border-amber-200 bg-amber-50 text-amber-800",
    APPROVED:
      "border-green-200 bg-green-50 text-green-700",
    REJECTED:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    classes[status] ??
    "border-[var(--border-soft)] bg-[var(--surface-soft)] text-[var(--text-muted)]"
  );
}

export default async function AdminInstructorApplicationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  const applications = await prisma.instructorApplication.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      reviewedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const pendingCount = applications.filter(
    (application) => application.status === "PENDING"
  ).length;

  const approvedCount = applications.filter(
    (application) => application.status === "APPROVED"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "REJECTED"
  ).length;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border-soft)] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-20">
          <div>
            <p className="text-sm font-bold text-[var(--text-muted)]">
              لوحة الإدارة
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-[var(--brand-900)]">
              طلبات الانضمام كمدرب
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-[var(--border-soft)] bg-white px-4 py-2.5 text-sm font-extrabold text-[var(--brand-900)] transition hover:border-[var(--brand-400)]"
            >
              لوحة الإدارة
            </Link>

            <Link
              href="/"
              className="rounded-xl bg-[var(--brand-700)] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[var(--brand-600)]"
            >
              الرئيسية
            </Link>
          </div>
        </div>
      </header>

      <section className="px-5 py-8 sm:px-8 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-[var(--text-muted)]">
                إجمالي الطلبات
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[var(--brand-900)]">
                {applications.length}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
              <p className="text-sm font-bold text-amber-800">
                قيد المراجعة
              </p>
              <p className="mt-2 text-3xl font-extrabold text-amber-900">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-green-50 p-5 shadow-sm">
              <p className="text-sm font-bold text-green-700">
                مقبولة
              </p>
              <p className="mt-2 text-3xl font-extrabold text-green-800">
                {approvedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
              <p className="text-sm font-bold text-red-700">
                مرفوضة
              </p>
              <p className="mt-2 text-3xl font-extrabold text-red-800">
                {rejectedCount}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white shadow-sm">
            <div className="border-b border-[var(--border-soft)] p-5">
              <h2 className="text-xl font-extrabold text-[var(--brand-900)]">
                قائمة طلبات المدربين
              </h2>
              <p className="mt-2 text-sm font-bold text-[var(--text-muted)]">
                هذه الصفحة للعرض فقط حاليًا. سنضيف القبول والرفض في الخطوة التالية.
              </p>
            </div>

            {applications.length === 0 ? (
              <div className="p-10 text-center">
                <h3 className="text-xl font-extrabold text-[var(--brand-900)]">
                  لا توجد طلبات مدربين حتى الآن
                </h3>
                <p className="mt-2 text-sm font-bold text-[var(--text-muted)]">
                  عندما يرسل أحد المدربين طلبًا من صفحة الانضمام، سيظهر هنا.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-right">
                  <thead className="bg-[var(--surface-soft)]">
                    <tr className="text-sm text-[var(--text-muted)]">
                      <th className="px-5 py-4 font-extrabold">المدرب</th>
                      <th className="px-5 py-4 font-extrabold">التواصل</th>
                      <th className="px-5 py-4 font-extrabold">التخصص</th>
                      <th className="px-5 py-4 font-extrabold">فكرة الكورس</th>
                      <th className="px-5 py-4 font-extrabold">الحالة</th>
                      <th className="px-5 py-4 font-extrabold">تاريخ الإرسال</th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map((application) => (
                      <tr
                        key={application.id}
                        className="border-t border-[var(--border-soft)] align-top"
                      >
                        <td className="px-5 py-4">
                          <p className="font-extrabold text-[var(--brand-900)]">
                            {application.name}
                          </p>

                          {application.applicant ? (
                            <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                              مستخدم مسجل: {application.applicant.name}
                            </p>
                          ) : (
                            <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                              طلب من زائر أو بريد غير مربوط بحساب
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-[var(--brand-900)]">
                            {application.email}
                          </p>

                          {application.phone ? (
                            <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">
                              {application.phone}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-[180px] text-sm font-bold leading-7 text-[var(--text-muted)]">
                            {application.specialty || "غير محدد"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="line-clamp-3 max-w-[260px] text-sm font-bold leading-7 text-[var(--text-muted)]">
                            {application.proposedCourse || "لم يتم إدخال فكرة كورس"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold ${getStatusClassName(
                              application.status
                            )}`}
                          >
                            {getStatusLabel(application.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-[var(--text-muted)]">
                            {formatDate(application.createdAt)}
                          </p>

                          {application.reviewedAt ? (
                            <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                              تمت المراجعة: {formatDate(application.reviewedAt)}
                            </p>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}