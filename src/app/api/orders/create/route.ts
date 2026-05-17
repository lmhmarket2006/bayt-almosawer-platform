import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return redirectTo(request, "/login");
  }

  if (user.role !== "STUDENT") {
    return redirectTo(request, "/courses");
  }

  const formData = await request.formData();
  const courseId = String(formData.get("courseId") || "").trim();

  if (!courseId) {
    return redirectTo(request, "/courses");
  }

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      isPublished: true,
      status: "PUBLISHED",
    },
  });

  if (!course) {
    return redirectTo(request, "/courses");
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
    return redirectTo(request, "/student/orders?message=already-enrolled");
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
    return redirectTo(request, "/student/orders?message=pending-exists");
  }

  const finalPrice = course.salePrice ?? course.price;

  await prisma.order.create({
    data: {
      userId: user.id,
      totalAmount: finalPrice,
      discountAmount: 0,
      finalAmount: finalPrice,
      orderStatus: "PENDING",
      paymentStatus: "PENDING",
      paymentMethod: "manual",
      items: {
        create: {
          courseId: course.id,
          price: finalPrice,
          platformShare: finalPrice,
          instructorShare: 0,
        },
      },
    },
  });

  return redirectTo(request, "/student/orders?message=created");
}