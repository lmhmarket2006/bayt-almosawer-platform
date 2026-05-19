import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getPlatformSettings } from "@/lib/platform-settings";

function formatPrice(value: unknown) {
  const price = Number(value);

  if (!price || price <= 0) {
    return "0 ريال";
  }

  return `${price.toLocaleString("ar-SA")} ريال`;
}

function getPaymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "بانتظار الدفع",
    PAID: "مدفوع",
    REJECTED: "مرفوض",
    REFUNDED: "مسترد",
  };

  return labels[status] ?? status;
}

function getOrderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "قيد المراجعة",
    CONFIRMED: "مؤكد",
    CANCELLED: "ملغي",
    REFUNDED: "مسترد",
  };

  return labels[status] ?? status;
}

function getCourseStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "مسودة",
    PENDING_REVIEW: "بانتظار المراجعة",
    PUBLISHED: "منشور",
    ARCHIVED: "مؤرشف",
  };

  return labels[status] ?? status;
}

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  const settings = await getPlatformSettings();
  const siteName = settings.siteName || "منصة بيت المصور التعليمية";

  const [
    usersCount,
    studentsCount,
    coursesCount,
    publishedCoursesCount,
    ordersCount,
    pendingOrdersCount,
    confirmedOrdersCount,
    enrollmentsCount,
    paidOrders,
    latestOrders,
    latestUsers,
    latestCourses,
    paidOrderItems,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        role: "STUDENT",
      },
    }),
    prisma.course.count(),
    prisma.course.count({
      where: {
        isPublished: true,
        status: "PUBLISHED",
      },
    }),
    prisma.order.count(),
    prisma.order.count({
      where: {
        paymentStatus: "PENDING",
      },
    }),
    prisma.order.count({
      where: {
        paymentStatus: "PAID",
      },
    }),
    prisma.enrollment.count(),
    prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
      },
      select: {
        finalAmount: true,
      },
    }),
    prisma.order.findMany({
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.course.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        isPublished: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          paymentStatus: "PAID",
        },
      },
      select: {
        price: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  const totalSales = paidOrders.reduce(
    (total, order) => total + Number(order.finalAmount),
    0
  );

  const bestSellingCourses = Object.values(
    paidOrderItems.reduce<
      Record<
        string,
        {
          id: string;
          title: string;
          slug: string;
          salesCount: number;
          totalRevenue: number;
        }
      >
    >((result, item) => {
      const course = item.course;

      if (!result[course.id]) {
        result[course.id] = {
          id: course.id,
          title: course.title,
          slug: course.slug,
          salesCount: 0,
          totalRevenue: 0,
        };
      }

      result[course.id].salesCount += 1;
      result[course.id].totalRevenue += Number(item.price);

      return result;
    }, {})
  )
    .sort((a, b) => {
      if (b.salesCount !== a.salesCount) {
        return b.salesCount - a.salesCount;
      }

      return b.totalRevenue - a.totalRevenue;
    })
    .slice(0, 5);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="p-6 sm:p-8">
              <p className="font-bold text-[var(--brand-500)]">
                لوحة الإدارة
              </p>

              <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
                مرحبًا بك في لوحة إدارة {siteName}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
                تابع المبيعات، الطلبات، الطلاب، الكورسات، وحالة المحتوى من مكان
                واحد.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/admin/courses"
                  className="rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-5 py-3 text-center text-sm font-extrabold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
                >
                  إدارة الكورسات
                </Link>

                <Link
                  href="/admin/orders"
                  className="rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                >
                  إدارة الطلبات
                </Link>

                <Link
                  href="/admin/users"
                  className="rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                >
                  إدارة المستخدمين
                </Link>

                <Link
                  href="/courses"
                  className="rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                >
                  معاينة الموقع
                </Link>

                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-extrabold text-red-700 transition hover:-translate-y-0.5 sm:w-auto"
                  >
                    تسجيل الخروج
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-[var(--brand-950)] p-6 text-white sm:p-8">
              <p className="text-sm font-bold text-white/60">ملخص مالي</p>

              <div className="mt-5 rounded-[1.5rem] bg-white/10 p-5">
                <p className="text-xs text-white/60">إجمالي المبيعات المؤكدة</p>
                <p className="mt-2 text-3xl font-extrabold">
                  {formatPrice(totalSales)}
                </p>
                <p className="mt-3 text-xs leading-6 text-white/60">
                  محسوبة من الطلبات التي حالتها مدفوعة فقط.
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/60">طلبات معلقة</p>
                  <p className="mt-1 text-2xl font-extrabold">
                    {pendingOrdersCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/60">طلبات مدفوعة</p>
                  <p className="mt-1 text-2xl font-extrabold">
                    {confirmedOrdersCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[var(--text-muted)]">
              المستخدمون
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--brand-700)]">
              {usersCount}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              إجمالي حسابات المنصة.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[var(--text-muted)]">
              الطلاب
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--brand-700)]">
              {studentsCount}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              عدد حسابات الطلاب.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[var(--text-muted)]">
              الكورسات المنشورة
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--brand-700)]">
              {publishedCoursesCount}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              من أصل {coursesCount} كورس.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[var(--text-muted)]">
              التسجيلات
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--brand-700)]">
              {enrollmentsCount}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              كورسات مفتوحة للطلاب.
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-[var(--brand-500)]">
                أفضل الكورسات مبيعًا
              </p>
              <h2 className="mt-1 text-2xl font-extrabold">
                الكورسات الأعلى أداءً
              </h2>
            </div>

            <Link
              href="/admin/orders"
              className="hidden text-sm font-extrabold text-[var(--brand-600)] sm:inline-flex"
            >
              مراجعة الطلبات ←
            </Link>
          </div>

          {bestSellingCourses.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--border-soft)] bg-[var(--surface-soft)] p-8 text-center">
              <h3 className="text-xl font-extrabold">
                لا توجد مبيعات مؤكدة بعد
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                عندما يتم تأكيد طلبات مدفوعة، ستظهر هنا الكورسات الأكثر مبيعًا.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {bestSellingCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-400)] to-[var(--accent-500)] text-sm font-extrabold text-white">
                      {index + 1}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                      {course.salesCount} مبيع
                    </span>
                  </div>

                  <h3 className="line-clamp-2 min-h-12 font-extrabold leading-6">
                    {course.title}
                  </h3>

                  <p className="mt-3 text-sm font-bold text-[var(--text-muted)]">
                    إجمالي المبيعات
                  </p>

                  <p className="mt-1 text-xl font-extrabold text-[var(--brand-900)]">
                    {formatPrice(course.totalRevenue)}
                  </p>

                  <Link
                    href={`/courses/${course.slug}`}
                    className="mt-4 inline-flex text-sm font-extrabold text-[var(--brand-600)] transition hover:text-[var(--accent-500)]"
                  >
                    معاينة الكورس ←
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-[var(--brand-500)]">
                  آخر الطلبات
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">
                  متابعة المبيعات
                </h2>
              </div>

              <Link
                href="/admin/orders"
                className="hidden text-sm font-extrabold text-[var(--brand-600)] sm:inline-flex"
              >
                عرض الكل ←
              </Link>
            </div>

            {latestOrders.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--border-soft)] bg-[var(--surface-soft)] p-8 text-center">
                <h3 className="text-xl font-extrabold">لا توجد طلبات بعد</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                  عندما يشتري طالب كورسًا سيظهر الطلب هنا.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-extrabold">{order.user.name}</p>
                        <p
                          className="mt-1 text-xs text-[var(--text-muted)]"
                          dir="ltr"
                        >
                          {order.user.email}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                          {getOrderStatusLabel(order.orderStatus)}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <p className="text-sm text-[var(--text-muted)]">
                        {order.items[0]?.course.title ?? "طلب شراء كورس"}
                      </p>

                      <strong className="text-[var(--brand-900)]">
                        {formatPrice(order.finalAmount)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <div className="mb-5">
              <p className="font-bold text-[var(--brand-500)]">روابط سريعة</p>
              <h2 className="mt-1 text-2xl font-extrabold">عمليات يومية</h2>
            </div>

            <div className="grid gap-3">
              <Link
                href="/admin/users"
                className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-extrabold">إدارة المستخدمين</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  تابع الطلاب والحسابات وافتح الكورسات يدويًا.
                </p>
              </Link>

              <Link
                href="/admin/settings"
                className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-extrabold">إعدادات المنصة</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  عدّل بيانات التواصل والتحويل البنكي وتعليمات الدفع.
                </p>
              </Link>

              <Link
                href="/admin/security"
                className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-extrabold">الأمان وكلمة المرور</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  غيّر كلمة مرور الأدمن قبل التشغيل التجاري.
                </p>
              </Link>

              <Link
                href="/admin/courses/new"
                className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-extrabold">إضافة كورس جديد</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  أنشئ كورسًا جديدًا ثم أضف المنهج والدروس.
                </p>
              </Link>

              <Link
                href="/admin/courses"
                className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-extrabold">إدارة المحتوى</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  عدّل الكورسات والأقسام والدروس.
                </p>
              </Link>

              <Link
                href="/admin/orders"
                className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-extrabold">مراجعة الطلبات</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  أكّد الدفع وافتح الكورسات للطلاب.
                </p>
              </Link>

              <Link
                href="/courses"
                className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-extrabold">معاينة واجهة البيع</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  شاهد صفحة الكورسات كما يراها الطالب.
                </p>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-[var(--brand-500)]">
                  آخر المستخدمين
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">
                  الحسابات الجديدة
                </h2>
              </div>

              <Link
                href="/admin/users"
                className="hidden text-sm font-extrabold text-[var(--brand-600)] sm:inline-flex"
              >
                إدارة المستخدمين ←
              </Link>
            </div>

            {latestUsers.length === 0 ? (
              <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-6 text-center text-sm font-bold text-[var(--text-muted)]">
                لا يوجد مستخدمون بعد.
              </div>
            ) : (
              <div className="space-y-3">
                {latestUsers.map((latestUser) => (
                  <div
                    key={latestUser.id}
                    className="flex flex-col justify-between gap-3 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-extrabold">{latestUser.name}</p>
                      <p
                        className="mt-1 text-xs text-[var(--text-muted)]"
                        dir="ltr"
                      >
                        {latestUser.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                        {latestUser.role}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                        {latestUser.isActive ? "نشط" : "موقوف"}
                      </span>

                      <Link
                        href={`/admin/users/${latestUser.id}`}
                        className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--brand-900)] transition hover:-translate-y-0.5"
                      >
                        التفاصيل
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-[var(--brand-500)]">
                  آخر الكورسات
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">
                  المحتوى المضاف
                </h2>
              </div>

              <Link
                href="/admin/courses"
                className="hidden text-sm font-extrabold text-[var(--brand-600)] sm:inline-flex"
              >
                إدارة الكورسات ←
              </Link>
            </div>

            {latestCourses.length === 0 ? (
              <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-6 text-center text-sm font-bold text-[var(--text-muted)]">
                لا توجد كورسات بعد.
              </div>
            ) : (
              <div className="space-y-3">
                {latestCourses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-extrabold">{course.title}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {course.category?.name ?? "بدون تصنيف"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                          {getCourseStatusLabel(course.status)}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--brand-600)]">
                          {course.isPublished ? "ظاهر" : "مخفي"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`/admin/courses/${course.id}/curriculum`}
                        className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-2.5 text-center text-xs font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                      >
                        المنهج
                      </Link>

                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-2.5 text-center text-xs font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                      >
                        تعديل
                      </Link>

                      <Link
                        href={`/courses/${course.slug}`}
                        className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-2.5 text-center text-xs font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5"
                      >
                        معاينة
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}