import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

function getBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(`${getBaseUrl(request)}${path}`);
}

function redirectWithQuery(
  request: NextRequest,
  path: string,
  params: Record<string, string>
) {
  const url = new URL(`${getBaseUrl(request)}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return NextResponse.redirect(url);
}

function getCourseAmount(course: { price: unknown; salePrice: unknown }) {
  const salePrice = course.salePrice === null ? null : Number(course.salePrice);
  const price = Number(course.price);

  const amount = salePrice !== null ? salePrice : price;

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return amount;
}

// لو تم فتح رابط API مباشرة من المتصفح
export async function GET(request: NextRequest) {
  return redirectWithQuery(request, "/courses", {
    error: "use-buy-button",
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const formData = await request.formData();
    const courseId = String(formData.get("courseId") || "").trim();

    if (!courseId) {
      return redirectWithQuery(request, "/courses", {
        error: "missing-course",
      });
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        salePrice: true,
        isPublished: true,
        status: true,
      },
    });

    if (!course || !course.isPublished || course.status !== "PUBLISHED") {
      return redirectWithQuery(request, "/courses", {
        error: "course-not-available",
      });
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (existingEnrollment?.isActive) {
      return redirectTo(request, `/learn/${course.slug}`);
    }

    const existingPendingOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        paymentStatus: "PENDING",
        items: {
          some: {
            courseId: course.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (existingPendingOrder) {
      return redirectWithQuery(request, "/student/orders", {
        message: "already-pending",
      });
    }

    const existingPaidOrConfirmedOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        OR: [
          {
            paymentStatus: "PAID",
          },
          {
            orderStatus: "CONFIRMED",
          },
        ],
        items: {
          some: {
            courseId: course.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (existingPaidOrConfirmedOrder) {
      return redirectWithQuery(request, "/student/orders", {
        message: "already-purchased",
      });
    }

    const amount = getCourseAmount(course);

    if (amount === null) {
      return redirectWithQuery(request, `/courses/${course.slug}`, {
        error: "invalid-course-price",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          userId: user.id,
          totalAmount: amount,
          finalAmount: amount,
          paymentStatus: "PENDING",
          orderStatus: "PENDING",
          items: {
            create: {
              courseId: course.id,
              price: amount,
            },
          },
        },
      });
    });

    return redirectWithQuery(request, "/student/orders", {
      message: "created",
    });
  } catch (error) {
    console.error("Create order error:", error);

    return redirectWithQuery(request, "/courses", {
      error: "create-order-failed",
    });
  }
}