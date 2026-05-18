import { CourseStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { redirectToAdminCourses } from "@/lib/url";

type ArchiveCourseRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest) {
  await requireRole("ADMIN");

  return redirectToAdminCourses(request, "use-archive-button");
}

export async function POST(
  request: NextRequest,
  { params }: ArchiveCourseRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!course) {
    return redirectToAdminCourses(request, "course-not-found");
  }

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