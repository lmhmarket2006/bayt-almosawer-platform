import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 leading-8 shadow-sm sm:p-8">
        <Link
          href="/"
          className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
        >
          ← العودة للرئيسية
        </Link>

        <p className="font-bold text-[var(--brand-500)]">الشروط والأحكام</p>
        <h1 className="mt-2 text-3xl font-extrabold">استخدام المنصة</h1>

        <p className="mt-6 text-[var(--text-muted)]">
          باستخدامك منصة بيت المصور التعليمية، فإنك توافق على الالتزام بهذه
          الشروط والأحكام، والتي تنظم استخدام الكورسات والمحتوى والخدمات.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">الحسابات</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          يجب إدخال بيانات صحيحة عند التسجيل. يتحمل المستخدم مسؤولية الحفاظ على
          سرية بيانات الدخول وعدم مشاركتها مع الآخرين.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">الوصول إلى الكورسات</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          يتم فتح الوصول إلى الكورس بعد تأكيد الدفع من الإدارة. لا يجوز مشاركة
          محتوى الكورس أو إعادة نشره أو توزيعه دون إذن خطي.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">الملكية الفكرية</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          جميع المواد التعليمية، الفيديوهات، النصوص، والتصاميم داخل المنصة
          مملوكة للمنصة أو لأصحابها، ولا يسمح باستخدامها خارج نطاق التعلم الشخصي.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">تعديل الشروط</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          يحق لإدارة المنصة تعديل هذه الشروط عند الحاجة، ويُعد استمرار استخدام
          المنصة موافقة على التحديثات.
        </p>
      </article>
    </main>
  );
}