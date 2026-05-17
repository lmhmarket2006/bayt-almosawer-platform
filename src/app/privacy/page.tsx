import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 leading-8 shadow-sm sm:p-8">
        <Link
          href="/"
          className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
        >
          ← العودة للرئيسية
        </Link>

        <p className="font-bold text-[var(--brand-500)]">سياسة الخصوصية</p>
        <h1 className="mt-2 text-3xl font-extrabold">حماية بياناتك</h1>

        <p className="mt-6 text-[var(--text-muted)]">
          نلتزم في منصة بيت المصور التعليمية بحماية خصوصية المستخدمين. توضح هذه
          السياسة كيفية جمع البيانات واستخدامها عند التسجيل أو شراء الكورسات أو
          استخدام خدمات المنصة.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">البيانات التي نجمعها</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          قد نجمع بيانات مثل الاسم، البريد الإلكتروني، بيانات الطلبات، وحالة
          الدفع، وذلك لتقديم الخدمة التعليمية وإدارة الوصول إلى الكورسات.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">استخدام البيانات</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          تُستخدم البيانات لإنشاء الحساب، متابعة الطلبات، فتح الكورسات بعد تأكيد
          الدفع، تحسين تجربة المستخدم، والتواصل بخصوص الخدمات المرتبطة بالمنصة.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">حماية البيانات</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          نستخدم إجراءات تقنية وتنظيمية مناسبة لحماية الحسابات والبيانات، ولا
          نشارك بيانات المستخدمين مع أطراف خارجية إلا عند الحاجة القانونية أو
          التشغيلية الضرورية.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">التحديثات</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          قد يتم تحديث هذه السياسة من وقت لآخر، ويُعد استمرار استخدام المنصة
          موافقة على النسخة الأحدث.
        </p>
      </article>
    </main>
  );
}