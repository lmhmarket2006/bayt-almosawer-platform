import { CourseStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { redirectToAdminCourses } from "@/lib/url";

type UnarchiveCourseRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest) {
  await requireRole("ADMIN");

  return redirectToAdminCourses(request, "use-unarchive-button");
}

export async function POST(
  request: NextRequest,
  { params }: UnarchiveCourseRouteProps
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
      status: CourseStatus.DRAFT,
    },
  });

  return redirectToAdminCourses(request, "course-unarchived");
}