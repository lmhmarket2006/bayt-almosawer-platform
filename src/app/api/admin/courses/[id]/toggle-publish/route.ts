import { CourseStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { redirectToAdminCourses } from "@/lib/url";

type TogglePublishCourseRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: TogglePublishCourseRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id,
    },
  });

  if (!course) {
    return redirectToAdminCourses(request, "course-not-found");
  }

  const nextIsPublished = !course.isPublished;

  await prisma.course.update({
    where: {
      id: course.id,
    },
    data: {
      isPublished: nextIsPublished,
      status: nextIsPublished ? CourseStatus.PUBLISHED : CourseStatus.DRAFT,
    },
  });

  return redirectToAdminCourses(
    request,
    nextIsPublished ? "course-published" : "course-hidden"
  );
}