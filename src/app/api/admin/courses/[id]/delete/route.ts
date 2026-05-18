import { CourseStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { redirectToAdminCourses } from "@/lib/url";

type DeleteCourseRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

// لو فتحت رابط API مباشرة في المتصفح
export async function GET(request: NextRequest) {
  await requireRole("ADMIN");

  return redirectToAdminCourses(request, "use-delete-button");
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
    return redirectToAdminCourses(request, "course-not-found");
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

    return redirectToAdminCourses(request, "course-archived");
  }

  await prisma.course.delete({
    where: {
      id: course.id,
    },
  });

  return redirectToAdminCourses(request, "course-deleted");
}