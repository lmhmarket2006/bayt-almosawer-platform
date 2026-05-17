import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export default async function NewCoursePage() {
  await requireRole("ADMIN");

  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

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

          <p className="font-bold text-[var(--brand-500)]">إضافة كورس</p>
          <h1 className="mt-2 text-3xl font-extrabold">كورس جديد</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            أدخل بيانات الكورس الأساسية. إدارة الأقسام والدروس ستكون في الخطوة
            التالية من هذه الحزمة.
          </p>
        </div>

        <form
          action="/api/admin/courses/create"
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
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                placeholder="مثال: أساسيات التصوير الاحترافي"
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
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                placeholder="professional-photography-basics"
              />
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                استخدم حروف إنجليزية صغيرة وشرطات فقط.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold">
                وصف مختصر
              </label>
              <input
                name="subtitle"
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                placeholder="سطر قصير يظهر في كروت الكورسات"
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
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 leading-8 outline-none transition focus:border-[var(--brand-500)]"
                placeholder="اكتب وصف الكورس بالتفصيل..."
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-extrabold">
                  التصنيف
                </label>
                <select
                  name="categoryId"
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
                  defaultValue="BEGINNER"
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
                  defaultValue="0"
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
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                  placeholder="اتركه فارغًا إن لم يوجد"
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
                className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--brand-500)]"
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4">
              <input
                id="isPublished"
                name="isPublished"
                type="checkbox"
                value="true"
                className="h-5 w-5"
              />
              <label htmlFor="isPublished" className="text-sm font-extrabold">
                نشر الكورس مباشرة للطلاب
              </label>
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
            >
              حفظ الكورس
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}