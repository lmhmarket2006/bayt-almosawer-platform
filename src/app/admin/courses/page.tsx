import Link from "next/link";
import { CourseStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type AdminCoursesPageProps = {
  searchParams: Promise<{
    status?: string;
    message?: string;
    error?: string;
  }>;
};

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

function getMessage(message?: string) {
  const messages: Record<string, string> = {
    "course-created": "تم إضافة الكورس بنجاح.",
    "course-updated": "تم حفظ تعديلات الكورس بنجاح.",
    "course-published": "تم نشر الكورس وإظهاره للطلاب.",
    "course-hidden": "تم إخفاء الكورس من الواجهة العامة.",
    "course-archived": "تم أرشفة الكورس وإخفاؤه من الواجهة العامة.",
    "course-unarchived": "تمت استعادة الكورس من الأرشيف وأصبح مسودة مخفية.",
    "course-deleted": "تم حذف الكورس نهائيًا.",
    "use-delete-button": "استخدم زر الحذف من لوحة الإدارة.",
    "use-archive-button": "استخدم زر الأرشفة من لوحة الإدارة.",
    "use-unarchive-button": "استخدم زر استعادة الكورس من لوحة الإدارة.",
  };

  return message ? messages[message] : null;
}

function getError(error?: string) {
  const errors: Record<string, string> = {
    "course-not-found": "الكورس غير موجود.",
    "course-has-data":
      "لا يمكن حذف هذا الكورس نهائيًا لأنه يحتوي على طلبات أو طلاب مسجلين. يمكنك أرشفته بدلًا من الحذف.",
    "delete-failed": "حدث خطأ أثناء حذف الكورس.",
    "archive-failed": "حدث خطأ أثناء أرشفة الكورس.",
    "unarchive-failed": "حدث خطأ أثناء استعادة الكورس من الأرشيف.",
  };

  return error ? errors[error] : null;
}

function getStatusFilter(status?: string): Prisma.CourseWhereInput {
  if (status === "published") {
    return {
      status: CourseStatus.PUBLISHED,
      isPublished: true,
    };
  }

  if (status === "draft") {
    return {
      status: CourseStatus.DRAFT,
    };
  }

  if (status === "archived") {
    return {
      status: CourseStatus.ARCHIVED,
    };
  }

  if (status === "hidden") {
    return {
      isPublished: false,
      NOT: {
        status: CourseStatus.ARCHIVED,
      },
    };
  }

  return {};
}

export default async function AdminCoursesPage({
  searchParams,
}: AdminCoursesPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const status = String(params.status || "").trim();
  const message = getMessage(params.message);
  const error = getError(params.error);

  const where = getStatusFilter(status);

  const [
    courses,
    allCount,
    publishedCount,
    draftCount,
    hiddenCount,
    archivedCount,
  ] = await Promise.all([
    prisma.course.findMany({
      where,
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
        _count: {
          select: {
            orderItems: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.course.count(),
    prisma.course.count({
      where: {
        status: CourseStatus.PUBLISHED,
        isPublished: true,
      },
    }),
    prisma.course.count({
      where: {
        status: CourseStatus.DRAFT,
      },
    }),
    prisma.course.count({
      where: {
        isPublished: false,
        NOT: {
          status: CourseStatus.ARCHIVED,
        },
      },
    }),
    prisma.course.count({
      where: {
        status: CourseStatus.ARCHIVED,
      },
    }),
  ]);

  const filterLinks = [
    {
      label: `الكل (${allCount})`,
      href: "/admin/courses",
      active: !status,
    },
    {
      label: `المنشورة (${publishedCount})`,
      href: "/admin/courses?status=published",
      active: status === "published",
    },
    {
      label: `المسودات (${draftCount})`,
      href: "/admin/courses?status=draft",
      active: status === "draft",
    },
    {
      label: `المخفية (${hiddenCount})`,
      href: "/admin/courses?status=hidden",
      active: status === "hidden",
    },
    {
      label: `المؤرشفة (${archivedCount})`,
      href: "/admin/courses?status=archived",
      active: status === "archived",
    },
  ];

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
              من هنا يمكنك إضافة الكورسات وتعديلها ونشرها أو إخفاؤها أو
              أرشفتها. الحذف النهائي متاح فقط للكورسات التي لا تحتوي على طلبات
              أو طلاب.
            </p>
          </div>

          <Link
            href="/admin/courses/new"
            className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-5 py-3 text-center text-sm font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
          >
            إضافة كورس جديد
          </Link>
        </div>

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

        <section className="mb-6 rounded-[2rem] border border-[var(--border-soft)] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {filterLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.active
                    ? "rounded-2xl bg-[var(--brand-700)] px-4 py-2 text-sm font-extrabold text-white"
                    : "rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-extrabold text-[var(--brand-900)] transition hover:-translate-y-0.5"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        {courses.length === 0 ? (
          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-extrabold">لا توجد كورسات</h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              لا توجد نتائج مطابقة للفلتر الحالي.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {courses.map((course) => {
              const lessonsCount = course.sections.reduce(
                (total, section) => total + section._count.lessons,
                0
              );

              const hasCommercialData =
                course._count.orderItems > 0 || course._count.enrollments > 0;

              const isArchived = course.status === CourseStatus.ARCHIVED;

              return (
                <article
                  key={course.id}
                  className={
                    isArchived
                      ? "rounded-[2rem] border border-amber-200 bg-amber-50/50 p-6 shadow-sm"
                      : "rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm"
                  }
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

                        <span
                          className={
                            isArchived
                              ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800"
                              : "rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]"
                          }
                        >
                          {getStatusLabel(course.status)}
                        </span>

                        <span className="rounded-full bg-[#f7e7f5] px-3 py-1 text-xs font-extrabold text-[var(--brand-500)]">
                          {course.isPublished ? "ظاهر للطلاب" : "مخفي"}
                        </span>

                        {hasCommercialData ? (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
                            عليه بيانات تجارية
                          </span>
                        ) : null}
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
                        <span>الطلبات: {course._count.orderItems}</span>
                        <span>الطلاب: {course._count.enrollments}</span>
                        <span dir="ltr">Slug: {course.slug}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0 lg:justify-end">
                      {!isArchived ? (
                        <Link
                          href={`/courses/${course.slug}`}
                          className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                        >
                          معاينة
                        </Link>
                      ) : null}

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

                      {!isArchived ? (
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
                      ) : null}

                      {!isArchived ? (
                        <form
                          action={`/api/admin/courses/${course.id}/archive`}
                          method="POST"
                        >
                          <button
                            type="submit"
                            className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-extrabold text-amber-800 transition hover:-translate-y-0.5"
                          >
                            أرشفة
                          </button>
                        </form>
                      ) : (
                        <form
                          action={`/api/admin/courses/${course.id}/unarchive`}
                          method="POST"
                        >
                          <button
                            type="submit"
                            className="w-full rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-extrabold text-green-700 transition hover:-translate-y-0.5"
                          >
                            استعادة من الأرشيف
                          </button>
                        </form>
                      )}

                      <form
                        action={`/api/admin/courses/${course.id}/delete`}
                        method="POST"
                      >
                        <button
                          type="submit"
                          className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700 transition hover:-translate-y-0.5"
                        >
                          حذف نهائي
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