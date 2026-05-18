import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAlert } from "@/components/AdminAlert";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getAdminError, getAdminMessage } from "@/lib/admin-messages";

type EditLessonPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

function getResourceTypeLabel(type: string) {
  const labels: Record<string, string> = {
    PDF: "PDF",
    ZIP: "ZIP",
    LINK: "رابط",
    OTHER: "ملف آخر",
  };

  return labels[type] ?? type;
}

export default async function EditLessonPage({
  params,
  searchParams,
}: EditLessonPageProps) {
  await requireRole("ADMIN");

  const { id } = await params;
  const query = await searchParams;

  const message = getAdminMessage(query.message);
  const error = getAdminError(query.error);

  const lesson = await prisma.lesson.findUnique({
    where: {
      id,
    },
    include: {
      section: {
        include: {
          course: true,
        },
      },
      resources: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <Link
            href={`/admin/courses/${lesson.section.courseId}/curriculum`}
            className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
          >
            ← العودة للمنهج
          </Link>

          <p className="font-bold text-[var(--brand-500)]">تعديل درس</p>

          <h1 className="mt-2 text-3xl font-extrabold">{lesson.title}</h1>

          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            الكورس: {lesson.section.course.title}
          </p>
        </div>

        {message ? <AdminAlert type="success">{message}</AdminAlert> : null}
        {error ? <AdminAlert type="error">{error}</AdminAlert> : null}

        <form
          action={`/api/admin/lessons/${lesson.id}/update`}
          method="POST"
          className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-extrabold">
                عنوان الدرس
              </label>
              <input
                name="title"
                required
                defaultValue={lesson.title}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                وصف الدرس
              </label>
              <textarea
                name="description"
                rows={5}
                defaultValue={lesson.description ?? ""}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 leading-8 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                رابط الفيديو
              </label>
              <input
                name="videoUrl"
                dir="ltr"
                defaultValue={lesson.videoUrl ?? ""}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                placeholder="YouTube / Vimeo / Embed / Direct URL"
              />

              <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">
                يمكنك استخدام رابط YouTube أو Vimeo أو رابط Embed أو رابط فيديو
                مباشر. سيتم تحسين المشغل في المرحلة التالية من الحزمة.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  مدة الدرس بالدقائق
                </label>
                <input
                  name="durationMinutes"
                  type="number"
                  min="0"
                  defaultValue={lesson.durationMinutes}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  ترتيب الدرس
                </label>
                <input
                  name="sortOrder"
                  type="number"
                  min="0"
                  defaultValue={lesson.sortOrder}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 text-sm font-extrabold">
              <input
                name="isFreePreview"
                type="checkbox"
                value="true"
                defaultChecked={lesson.isFreePreview}
                className="h-5 w-5"
              />
              درس مجاني للمعاينة
            </label>

            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>

        <section className="mt-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="font-bold text-[var(--brand-500)]">مرفقات الدرس</p>

            <h2 className="mt-2 text-2xl font-extrabold">
              ملفات PDF و ZIP وروابط خارجية
            </h2>

            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
              أضف روابط ملفات من Google Drive أو OneDrive أو Dropbox أو أي رابط
              خارجي. تأكد أن إعدادات المشاركة تسمح للطلاب بالفتح أو التحميل.
            </p>
          </div>

          <form
            action={`/api/admin/lessons/${lesson.id}/resources/create`}
            method="POST"
            className="mb-6 grid gap-4 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"
          >
            <div>
              <label className="mb-2 block text-sm font-extrabold">
                عنوان المرفق
              </label>
              <input
                name="title"
                required
                placeholder="مثال: ملخص الدرس PDF أو ملفات التطبيق العملي"
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                رابط المرفق
              </label>
              <input
                name="url"
                required
                dir="ltr"
                placeholder="https://drive.google.com/... أو https://onedrive.live.com/..."
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  نوع المرفق
                </label>
                <select
                  name="type"
                  defaultValue="PDF"
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                >
                  <option value="PDF">PDF</option>
                  <option value="ZIP">ZIP</option>
                  <option value="LINK">رابط</option>
                  <option value="OTHER">ملف آخر</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  ترتيب الظهور
                </label>
                <input
                  name="sortOrder"
                  type="number"
                  min="0"
                  defaultValue={0}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
            >
              إضافة المرفق
            </button>
          </form>

          {lesson.resources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-soft)] p-6 text-center text-sm font-bold text-[var(--text-muted)]">
              لا توجد مرفقات لهذا الدرس بعد.
            </div>
          ) : (
            <div className="grid gap-3">
              {lesson.resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-extrabold">{resource.title}</p>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                        {getResourceTypeLabel(resource.type)}
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
                        ترتيب: {resource.sortOrder}
                      </span>
                    </div>

                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block break-all text-xs text-[var(--text-muted)] transition hover:text-[var(--brand-600)]"
                      dir="ltr"
                    >
                      {resource.url}
                    </a>
                  </div>

                  <form
                    action={`/api/admin/lesson-resources/${resource.id}/delete`}
                    method="POST"
                  >
                    <button
                      type="submit"
                      className="rounded-2xl border border-red-100 bg-red-50 px-4 py-2 text-xs font-extrabold text-red-700 transition hover:-translate-y-0.5"
                    >
                      حذف المرفق
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}