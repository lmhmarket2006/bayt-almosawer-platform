import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

function formatPrice(value: unknown) {
  const price = Number(value);

  if (!price || price <= 0) {
    return "مجاني";
  }

  return `${price.toLocaleString("ar-SA")} ريال`;
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "مسودة",
    PENDING_REVIEW: "بانتظار المراجعة",
    PUBLISHED: "منشور",
    ARCHIVED: "مؤرشف",
  };

  return labels[status] ?? status;
}

function getLevelLabel(level: string) {
  const labels: Record<string, string> = {
    BEGINNER: "مبتدئ",
    INTERMEDIATE: "متوسط",
    ADVANCED: "متقدم",
  };

  return labels[level] ?? level;
}

export default async function AdminCoursesPage() {
  await requireRole("ADMIN");

  const courses = await prisma.course.findMany({
    include: {
      category: true,
      sections: {
        select: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin"
              className="mb-4 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
            >
              ← العودة للوحة الإدارة
            </Link>

            <p className="font-bold text-[var(--brand-500)]">إدارة الكورسات</p>
            <h1 className="mt-2 text-3xl font-extrabold">كل الكورسات</h1>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
              من هنا يمكنك إضافة الكورسات وتعديلها ونشرها أو إخفاؤها من المنصة.
            </p>
          </div>

          <Link
            href="/admin/courses/new"
            className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-5 py-3 text-center text-sm font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
          >
            إضافة كورس جديد
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-extrabold">لا توجد كورسات بعد</h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              ابدأ بإضافة أول كورس للمنصة.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {courses.map((course) => {
              const lessonsCount = course.sections.reduce(
                (total, section) => total + section._count.lessons,
                0
              );

              return (
                <article
                  key={course.id}
                  className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]">
                          {course.category?.name ?? "بدون تصنيف"}
                        </span>

                        <span className="rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]">
                          {getLevelLabel(course.level)}
                        </span>

                        <span className="rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]">
                          {getStatusLabel(course.status)}
                        </span>

                        <span className="rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]">
                          {course.isPublished ? "ظاهر للطلاب" : "مخفي"}
                        </span>
                      </div>

                      <h2 className="text-2xl font-extrabold">
                        {course.title}
                      </h2>

                      {course.subtitle ? (
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
                          {course.subtitle}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-[var(--text-muted)]">
                        <span>
                          السعر: {formatPrice(course.salePrice ?? course.price)}
                        </span>
                        <span>الدروس: {lessonsCount}</span>
                        <span dir="ltr">Slug: {course.slug}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                      >
                        معاينة
                      </Link>

                      <Link
                        href={`/admin/courses/${course.id}/curriculum`}
                        className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-4 py-3 text-center text-sm font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
                      >
                        المنهج
                      </Link>

                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                      >
                        تعديل
                      </Link>

                      <form
                        action={`/api/admin/courses/${course.id}/toggle-publish`}
                        method="POST"
                      >
                        <button
                          type="submit"
                          className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                        >
                          {course.isPublished ? "إخفاء" : "نشر"}
                        </button>
                      </form>

                      <form
                        action={`/api/admin/courses/${course.id}/delete`}
                        method="POST"
                      >
                        <button
                          type="submit"
                          className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700 transition hover:-translate-y-0.5"
                        >
                          حذف
                        </button>
                      </form>
                    </div>
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