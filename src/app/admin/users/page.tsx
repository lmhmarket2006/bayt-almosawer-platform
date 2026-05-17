import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: "أدمن",
    STUDENT: "طالب",
  };

  return labels[role] ?? role;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const q = String(params.q || "").trim();
  const status = String(params.status || "").trim();

  const where: Prisma.UserWhereInput = {
    ...(q
      ? {
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
    ...(status === "active"
      ? {
          isActive: true,
        }
      : {}),
    ...(status === "inactive"
      ? {
          isActive: false,
        }
      : {}),
  };

  const [users, usersCount, studentsCount, activeUsersCount, inactiveUsersCount] =
    await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              enrollments: true,
              orders: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
      }),
      prisma.user.count(),
      prisma.user.count({
        where: {
          role: "STUDENT",
        },
      }),
      prisma.user.count({
        where: {
          isActive: true,
        },
      }),
      prisma.user.count({
        where: {
          isActive: false,
        },
      }),
    ]);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <Link
            href="/admin"
            className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
          >
            ← العودة للوحة الإدارة
          </Link>

          <p className="font-bold text-[var(--brand-500)]">المستخدمون</p>

          <h1 className="mt-2 text-3xl font-extrabold">
            إدارة الطلاب والحسابات
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
            من هنا يمكنك متابعة حسابات الطلاب، حالة الحساب، الطلبات، والكورسات
            المفتوحة لكل طالب.
          </p>
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-4">
          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[var(--text-muted)]">
              إجمالي المستخدمين
            </p>
            <p className="mt-2 text-3xl font-extrabold text-[var(--brand-700)]">
              {usersCount}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[var(--text-muted)]">
              الطلاب
            </p>
            <p className="mt-2 text-3xl font-extrabold text-[var(--brand-700)]">
              {studentsCount}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[var(--text-muted)]">
              الحسابات النشطة
            </p>
            <p className="mt-2 text-3xl font-extrabold text-[var(--brand-700)]">
              {activeUsersCount}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[var(--text-muted)]">
              الحسابات الموقوفة
            </p>
            <p className="mt-2 text-3xl font-extrabold text-[var(--brand-700)]">
              {inactiveUsersCount}
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
          <form className="grid gap-3 md:grid-cols-[1fr_220px_auto]" method="GET">
            <input
              name="q"
              defaultValue={q}
              placeholder="ابحث بالاسم أو البريد الإلكتروني"
              className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
            />

            <select
              name="status"
              defaultValue={status}
              className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
            >
              <option value="">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">موقوف</option>
            </select>

            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-pink-500/20"
            >
              بحث
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
          {users.length === 0 ? (
            <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-8 text-center">
              <h2 className="text-2xl font-extrabold">لا توجد نتائج</h2>
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                جرّب تغيير كلمة البحث أو الفلتر.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-y-3 text-sm">
                <thead>
                  <tr className="text-right text-xs font-bold text-[var(--text-muted)]">
                    <th className="px-4">المستخدم</th>
                    <th className="px-4">الدور</th>
                    <th className="px-4">الحالة</th>
                    <th className="px-4">الكورسات</th>
                    <th className="px-4">الطلبات</th>
                    <th className="px-4">تاريخ التسجيل</th>
                    <th className="px-4">إجراء</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="bg-[var(--surface-soft)]">
                      <td className="rounded-r-2xl px-4 py-4">
                        <p className="font-extrabold">{user.name}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]" dir="ltr">
                          {user.email}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                          {getRoleLabel(user.role)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={
                            user.isActive
                              ? "rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold text-green-700"
                              : "rounded-full bg-red-50 px-3 py-1 text-xs font-extrabold text-red-700"
                          }
                        >
                          {user.isActive ? "نشط" : "موقوف"}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {user._count.enrollments}
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {user._count.orders}
                      </td>

                      <td className="px-4 py-4 text-xs text-[var(--text-muted)]">
                        {user.createdAt.toLocaleDateString("ar-SA")}
                      </td>

                      <td className="rounded-l-2xl px-4 py-4">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="rounded-2xl bg-white px-4 py-2 text-xs font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                        >
                          عرض التفاصيل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}