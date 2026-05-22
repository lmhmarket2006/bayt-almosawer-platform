import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type InstructorApplyPageProps = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function InstructorApplyPage({
  searchParams,
}: InstructorApplyPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const isSuccess = params.success === "1";

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border-soft)] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="font-extrabold text-[var(--brand-900)]">
            منصة تصويرك
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/courses"
              className="text-sm font-bold text-[var(--text-muted)] transition hover:text-[var(--brand-700)]"
            >
              الكورسات
            </Link>

            <Link
              href={user ? "/student" : "/login"}
              className="rounded-xl bg-[var(--accent-500)] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[var(--accent-600)]"
            >
              {user ? "لوحتي" : "تسجيل الدخول"}
            </Link>
          </div>
        </div>
      </header>

      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-extrabold text-[var(--brand-700)] shadow-sm">
                انضم إلى منصة تصويرك
              </p>

              <h1 className="text-4xl font-extrabold leading-tight text-[var(--brand-900)] sm:text-5xl">
                شارك خبرتك كمدرب
                <span className="block text-[var(--brand-700)]">
                  وابدأ تقديم كورساتك
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base font-bold leading-8 text-[var(--text-muted)]">
                أرسل طلب الانضمام كمدرب، وسيتم مراجعته من إدارة المنصة. بعد
                الموافقة ستحصل على لوحة مدرب لإضافة الدورات ومتابعة الطلاب
                والمبيعات.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 shadow-sm">
                  <p className="text-2xl font-extrabold text-[var(--brand-700)]">
                    1
                  </p>
                  <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">
                    أرسل الطلب
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 shadow-sm">
                  <p className="text-2xl font-extrabold text-[var(--brand-700)]">
                    2
                  </p>
                  <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">
                    مراجعة الإدارة
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 shadow-sm">
                  <p className="text-2xl font-extrabold text-[var(--brand-700)]">
                    3
                  </p>
                  <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">
                    تفعيل لوحة المدرب
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-5 shadow-xl sm:p-7">
              {isSuccess ? (
                <div className="mb-6 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-bold leading-7 text-green-700">
                  تم إرسال طلب الانضمام كمدرب بنجاح. ستقوم الإدارة بمراجعته
                  والرد عليك لاحقًا.
                </div>
              ) : null}

              <form
                action="/api/instructor-applications/create"
                method="POST"
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-extrabold text-[var(--brand-900)]">
                    بيانات طلب الانضمام
                  </h2>
                  <p className="mt-2 text-sm font-bold leading-7 text-[var(--text-muted)]">
                    املأ البيانات التالية بدقة لمساعدة الإدارة في تقييم طلبك.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-extrabold text-[var(--brand-900)]">
                      الاسم الكامل *
                    </label>
                    <input
                      name="name"
                      required
                      defaultValue={user?.name ?? ""}
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
                      placeholder="مثال: أحمد زغلول"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-extrabold text-[var(--brand-900)]">
                      البريد الإلكتروني *
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      defaultValue={user?.email ?? ""}
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-extrabold text-[var(--brand-900)]">
                      رقم الجوال / واتساب
                    </label>
                    <input
                      name="phone"
                      defaultValue={user?.phone ?? ""}
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
                      placeholder="05xxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-extrabold text-[var(--brand-900)]">
                      التخصص
                    </label>
                    <input
                      name="specialty"
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
                      placeholder="تصوير منتجات، بورتريه، إضاءة، ريتاتش..."
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-extrabold text-[var(--brand-900)]">
                    نبذة عنك
                  </label>
                  <textarea
                    name="bio"
                    rows={4}
                    className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[var(--brand-500)]"
                    placeholder="اكتب نبذة مختصرة عنك وعن خبرتك..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-extrabold text-[var(--brand-900)]">
                    الخبرات العملية
                  </label>
                  <textarea
                    name="experience"
                    rows={4}
                    className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[var(--brand-500)]"
                    placeholder="اذكر خبراتك، أعمالك السابقة، الورش أو الدورات التي قدمتها..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-extrabold text-[var(--brand-900)]">
                      رابط معرض الأعمال
                    </label>
                    <input
                      name="portfolioUrl"
                      type="url"
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-extrabold text-[var(--brand-900)]">
                      رابط حساب اجتماعي
                    </label>
                    <input
                      name="socialUrl"
                      type="url"
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
                      placeholder="Instagram / YouTube / Behance..."
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-extrabold text-[var(--brand-900)]">
                    فكرة أول كورس تريد تقديمه
                  </label>
                  <textarea
                    name="proposedCourse"
                    rows={3}
                    className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[var(--brand-500)]"
                    placeholder="مثال: كورس تصوير منتجات للمبتدئين من الصفر..."
                  />
                </div>

                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4">
                  <h3 className="font-extrabold text-[var(--brand-900)]">
                    بيانات التحويل لاحقًا
                  </h3>
                  <p className="mt-1 text-xs font-bold leading-6 text-[var(--text-muted)]">
                    هذه البيانات اختيارية الآن، ويمكن تعديلها لاحقًا بعد قبولك
                    كمدرب.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <input
                      name="bankName"
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
                      placeholder="اسم البنك"
                    />

                    <input
                      name="bankAccountName"
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
                      placeholder="اسم صاحب الحساب"
                    />

                    <input
                      name="bankIban"
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)] sm:col-span-2"
                      placeholder="IBAN"
                    />

                    <textarea
                      name="payoutNotes"
                      rows={3}
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[var(--brand-500)] sm:col-span-2"
                      placeholder="أي ملاحظات تخص التحويلات أو الاتفاق..."
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs font-bold leading-6 text-amber-800">
                  بإرسال الطلب، أنت تقر بأن إدارة المنصة لها حق مراجعة الطلب
                  وقبوله أو رفضه، وأن نشر أي كورس لاحقًا سيكون بعد مراجعة
                  الإدارة.
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[var(--accent-500)] px-6 py-4 text-base font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--accent-600)]"
                >
                  إرسال طلب الانضمام
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}