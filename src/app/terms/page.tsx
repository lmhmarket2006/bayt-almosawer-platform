import Link from "next/link";
import { getPlatformSiteName } from "@/lib/platform-settings";

export default async function TermsPage() {
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
              الشروط والأحكام
            </p>

            <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
              شروط استخدام {siteName}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--text-muted)]">
              باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط والأحكام
              التي تنظم استخدام الكورسات والمحتوى والخدمات التعليمية.
            </p>
          </div>
        </section>

        <article className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 leading-8 shadow-sm sm:p-8">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-extrabold">الحسابات</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                يجب إدخال بيانات صحيحة عند التسجيل. يتحمل المستخدم مسؤولية
                الحفاظ على سرية بيانات الدخول وعدم مشاركتها مع الآخرين.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">الوصول إلى الكورسات</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                يتم فتح الوصول إلى الكورس بعد تأكيد الدفع من الإدارة. لا يجوز
                مشاركة محتوى الكورس أو إعادة نشره أو توزيعه دون إذن خطي من
                إدارة المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">طلبات الشراء والدفع</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                قد تعتمد المنصة على الدفع اليدوي أو التحويل البنكي. يتم تفعيل
                الوصول للكورس بعد مراجعة الطلب والتأكد من الدفع من قبل الإدارة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">استخدام المحتوى</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                المحتوى التعليمي مخصص للاستخدام الشخصي داخل حساب الطالب فقط.
                لا يسمح بتصوير المحتوى، مشاركته، نسخه، بيعه، أو إعادة نشره بأي
                وسيلة دون موافقة رسمية.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">الملكية الفكرية</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                جميع المواد التعليمية، الفيديوهات، النصوص، التصاميم، الملفات،
                والشروحات داخل المنصة مملوكة للمنصة أو لأصحابها، ولا يسمح
                باستخدامها خارج نطاق التعلم الشخصي.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">إيقاف أو تقييد الحساب</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                يحق لإدارة المنصة إيقاف أو تقييد أي حساب في حال إساءة
                الاستخدام، مشاركة بيانات الدخول، محاولة الوصول غير المصرح به،
                أو مخالفة شروط استخدام المحتوى.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">تعديل الشروط</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                يحق لإدارة المنصة تعديل هذه الشروط عند الحاجة، ويُعد استمرار
                استخدام المنصة موافقة على التحديثات المنشورة.
              </p>
            </section>
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5">
            <p className="text-sm font-bold leading-7 text-[var(--text-muted)]">
              استمرارك في استخدام {siteName} يعني موافقتك على هذه الشروط
              والأحكام والالتزام باستخدام المحتوى التعليمي بطريقة نظامية وشخصية.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}