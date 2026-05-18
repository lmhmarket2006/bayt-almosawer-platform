import Link from "next/link";
import { getPlatformSiteName } from "@/lib/platform-settings";

export default async function RefundPolicyPage() {
  const siteName = await getPlatformSiteName();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white shadow-sm">
          <div className="pointer-events-none absolute -right-20 top-8 h-72 w-72 rounded-full bg-[var(--brand-400)]/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-8 h-72 w-72 rounded-full bg-[var(--accent-500)]/15 blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <Link
              href="/"
              className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)] transition hover:text-[var(--accent-500)]"
            >
              ← العودة للرئيسية
            </Link>

            <p className="font-bold text-[var(--brand-500)]">
              سياسة الاسترداد
            </p>

            <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
              الاسترجاع والإلغاء في {siteName}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--text-muted)]">
              تهدف هذه السياسة إلى توضيح آلية التعامل مع طلبات الاسترداد أو
              الإلغاء الخاصة بالكورسات، خصوصًا عند الدفع اليدوي وفتح الوصول
              للمحتوى التعليمي.
            </p>
          </div>
        </section>

        <article className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 leading-8 shadow-sm sm:p-8">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-extrabold">قبل فتح الكورس</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                يمكن للطالب طلب إلغاء الطلب قبل تأكيد الدفع وفتح الكورس داخل
                الحساب. في هذه الحالة تتم مراجعة الطلب حسب حالة الدفع وبيانات
                التحويل.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">بعد فتح الكورس</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                بعد فتح الوصول إلى محتوى الكورس داخل حساب الطالب، قد لا يكون
                الاسترداد متاحًا إلا وفق تقدير الإدارة وحسب طبيعة الحالة، لأن
                المحتوى الرقمي يصبح متاحًا للمشاهدة والاستخدام.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">الطلبات قيد المراجعة</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                إذا كان الطلب لا يزال قيد المراجعة ولم يتم تأكيد الدفع بعد،
                يمكن للطالب التواصل مع الإدارة لطلب إلغاء الطلب أو تعديل بياناته
                قبل فتح الكورس.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">الحالات الاستثنائية</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                قد تنظر الإدارة في بعض الحالات الاستثنائية مثل وجود مشكلة تقنية
                تمنع الوصول للمحتوى، أو تكرار عملية دفع، أو خطأ واضح في الطلب،
                ويتم التعامل مع كل حالة بعد مراجعتها.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">طريقة طلب الاسترداد</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                يمكن التواصل مع الإدارة عبر صفحة التواصل، مع ذكر البريد المسجل،
                اسم الكورس، رقم الطلب إن وجد، وتوضيح سبب طلب الاسترداد أو
                الإلغاء.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">مدة المراجعة</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                تتم مراجعة طلبات الاسترداد أو الإلغاء من قبل الإدارة، وقد تختلف
                مدة المعالجة حسب طريقة الدفع وحالة الطلب وتوفر بيانات التحويل.
              </p>
            </section>
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5">
            <p className="text-sm font-bold leading-7 text-[var(--text-muted)]">
              باستخدامك لمنصة {siteName} وشراء الكورسات، فإنك تقر بفهمك لطبيعة
              المحتوى الرقمي وأن فتح الوصول للكورس قد يؤثر على إمكانية
              الاسترداد.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-2xl bg-gradient-to-l from-[var(--accent-400)] via-[var(--accent-500)] to-[var(--brand-700)] px-6 py-3 text-center text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
            >
              التواصل مع الإدارة
            </Link>

            <Link
              href="/courses"
              className="rounded-2xl border border-[var(--border-soft)] bg-white px-6 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)]"
            >
              تصفح الكورسات
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}