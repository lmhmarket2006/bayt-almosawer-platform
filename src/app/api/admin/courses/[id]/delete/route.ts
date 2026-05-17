import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type DeleteCourseRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: DeleteCourseRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;

  const relatedOrders = await prisma.orderItem.count({
    where: {
      courseId: id,
    },
  });

  const relatedEnrollments = await prisma.enrollment.count({
    where: {
      courseId: id,
    },
  });

  if (relatedOrders > 0 || relatedEnrollments > 0) {
    await prisma.course.update({
      where: {
        id,
      },
      data: {
        isPublished: false,
        status: "ARCHIVED",
      },
    });

    return NextResponse.redirect(new URL("/admin/courses", request.url));
  }

  await prisma.course.delete({
    where: {
      id,
    },
  });

  return NextResponse.redirect(new URL("/admin/courses", request.url));
}