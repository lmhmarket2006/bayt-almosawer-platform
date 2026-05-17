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

export async function POST(request: NextRequest) {
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
  });

  if (existingPendingOrder) {
    return redirectWithQuery(request, "/student/orders", {
      message: "already-pending",
    });
  }

  const amount = course.salePrice ?? course.price;

  await prisma.order.create({
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

  return redirectWithQuery(request, "/student/orders", {
    message: "created",
  });
}