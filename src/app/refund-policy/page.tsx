import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 leading-8 shadow-sm sm:p-8">
        <Link
          href="/"
          className="mb-5 inline-flex text-sm font-extrabold text-[var(--brand-600)]"
        >
          ← العودة للرئيسية
        </Link>

        <p className="font-bold text-[var(--brand-500)]">سياسة الاسترداد</p>
        <h1 className="mt-2 text-3xl font-extrabold">الاسترجاع والإلغاء</h1>

        <p className="mt-6 text-[var(--text-muted)]">
          تهدف هذه السياسة إلى توضيح آلية التعامل مع طلبات الاسترداد أو الإلغاء
          الخاصة بكورسات منصة بيت المصور التعليمية.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">قبل فتح الكورس</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          يمكن للطالب طلب إلغاء الطلب قبل تأكيد الدفع وفتح الكورس داخل الحساب.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">بعد فتح الكورس</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          بعد فتح الوصول إلى محتوى الكورس، قد لا يكون الاسترداد متاحًا إلا وفق
          تقدير الإدارة وحسب طبيعة الحالة.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">طريقة طلب الاسترداد</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          يمكن التواصل مع الإدارة عبر صفحة التواصل، مع ذكر البريد المسجل واسم
          الكورس ورقم الطلب إن وجد.
        </p>
      </article>
    </main>
  );
}