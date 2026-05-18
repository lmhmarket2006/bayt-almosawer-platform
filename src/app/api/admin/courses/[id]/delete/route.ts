import { CourseStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type DeleteCourseRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function getBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

function redirectToCourses(request: NextRequest, message: string) {
  const url = new URL(`${getBaseUrl(request)}/admin/courses`);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

// لو فتحت رابط API مباشرة في المتصفح
export async function GET(request: NextRequest) {
  await requireRole("ADMIN");
  return redirectToCourses(request, "use-delete-button");
}

export async function POST(
  request: NextRequest,
  { params }: DeleteCourseRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          orderItems: true,
          enrollments: true,
          sections: true,
        },
      },
    },
  });

  if (!course) {
    return redirectToCourses(request, "course-not-found");
  }

  const hasCommercialData =
    course._count.orderItems > 0 || course._count.enrollments > 0;

  // لو الكورس عليه طلبات أو طلاب، الأفضل تجاريًا عدم حذفه نهائيًا
  if (hasCommercialData) {
    await prisma.course.update({
      where: {
        id: course.id,
      },
      data: {
        isPublished: false,
        status: CourseStatus.ARCHIVED,
      },
    });

    return redirectToCourses(request, "course-archived");
  }

  await prisma.course.delete({
    where: {
      id: course.id,
    },
  });

  return redirectToCourses(request, "course-deleted");
}