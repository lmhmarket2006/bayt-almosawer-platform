import Link from "next/link";
import { getPlatformSiteName } from "@/lib/platform-settings";

export default async function PrivacyPage() {
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
              سياسة الخصوصية
            </p>

            <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
              حماية بياناتك داخل {siteName}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--text-muted)]">
              نلتزم بحماية خصوصية المستخدمين وتوضيح كيفية جمع البيانات
              واستخدامها عند التسجيل أو شراء الكورسات أو استخدام خدمات المنصة.
            </p>
          </div>
        </section>

        <article className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 leading-8 shadow-sm sm:p-8">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-extrabold">البيانات التي نجمعها</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                قد نجمع بيانات مثل الاسم، البريد الإلكتروني، رقم الجوال، بيانات
                الطلبات، وحالة الدفع، وذلك لتقديم الخدمة التعليمية وإدارة الوصول
                إلى الكورسات.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">استخدام البيانات</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                تُستخدم البيانات لإنشاء الحساب، متابعة الطلبات، فتح الكورسات بعد
                تأكيد الدفع، تحسين تجربة المستخدم، والتواصل بخصوص الخدمات
                المرتبطة بالمنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">حماية البيانات</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                نستخدم إجراءات تقنية وتنظيمية مناسبة لحماية الحسابات والبيانات،
                ولا نشارك بيانات المستخدمين مع أطراف خارجية إلا عند الحاجة
                القانونية أو التشغيلية الضرورية.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">بيانات الدفع والطلبات</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                قد يتم حفظ بيانات الطلبات وحالة الدفع لغرض مراجعة عمليات الشراء
                وفتح الكورسات داخل حساب الطالب بعد التأكد من إتمام الدفع.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">التواصل مع المستخدم</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                قد نستخدم البريد الإلكتروني أو رقم الجوال أو واتساب للتواصل معك
                بشأن طلبات الشراء، الدعم الفني، أو تحديثات مهمة متعلقة بحسابك أو
                كورساتك.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold">التحديثات</h2>
              <p className="mt-3 text-[var(--text-muted)]">
                قد يتم تحديث هذه السياسة من وقت لآخر، ويُعد استمرار استخدام
                المنصة موافقة على النسخة الأحدث من سياسة الخصوصية.
              </p>
            </section>
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5">
            <p className="text-sm font-bold leading-7 text-[var(--text-muted)]">
              باستخدامك لمنصة {siteName} فإنك توافق على سياسة الخصوصية وطريقة
              معالجة البيانات اللازمة لتقديم الخدمة التعليمية وإدارة الطلبات.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}