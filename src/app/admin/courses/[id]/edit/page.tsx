import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type EditCoursePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  await requireRole("ADMIN");

  const { id } = await params;

  const [course, categories] = await Promise.all([
    prisma.course.findUnique({
      where: {
        id,
      },
    }),
    prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    }),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <Link
            href="/admin/courses"
            className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
          >
            ← العودة للكورسات
          </Link>

          <p className="font-bold text-[var(--brand-500)]">تعديل كورس</p>
          <h1 className="mt-2 text-3xl font-extrabold">{course.title}</h1>
        </div>

        <form
          action={`/api/admin/courses/${course.id}/update`}
          method="POST"
          className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-extrabold">
                عنوان الكورس
              </label>
              <input
                name="title"
                required
                defaultValue={course.title}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                الرابط المختصر Slug
              </label>
              <input
                name="slug"
                required
                dir="ltr"
                defaultValue={course.slug}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                وصف مختصر
              </label>
              <input
                name="subtitle"
                defaultValue={course.subtitle ?? ""}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                الوصف الكامل
              </label>
              <textarea
                name="description"
                required
                rows={6}
                defaultValue={course.description}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 leading-8 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  التصنيف
                </label>
                <select
                  name="categoryId"
                  defaultValue={course.categoryId ?? ""}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                >
                  <option value="">بدون تصنيف</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  المستوى
                </label>
                <select
                  name="level"
                  defaultValue={course.level}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                >
                  <option value="BEGINNER">مبتدئ</option>
                  <option value="INTERMEDIATE">متوسط</option>
                  <option value="ADVANCED">متقدم</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  السعر
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={String(course.price)}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  سعر التخفيض
                </label>
                <input
                  name="salePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={course.salePrice ? String(course.salePrice) : ""}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                رابط الفيديو التعريفي
              </label>
              <input
                name="promoVideoUrl"
                dir="ltr"
                defaultValue={course.promoVideoUrl ?? ""}
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4">
              <input
                id="isPublished"
                name="isPublished"
                type="checkbox"
                value="true"
                defaultChecked={course.isPublished}
                className="h-5 w-5"
              />
              <label htmlFor="isPublished" className="text-sm font-extrabold">
                نشر الكورس للطلاب
              </label>
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}