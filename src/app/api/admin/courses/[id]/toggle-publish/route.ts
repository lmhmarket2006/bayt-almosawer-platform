import { CourseStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type TogglePublishCourseRouteProps = {
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
    return redirectToCourses(request, "course-not-found");
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

  return redirectToCourses(
    request,
    nextIsPublished ? "course-published" : "course-hidden"
  );
}