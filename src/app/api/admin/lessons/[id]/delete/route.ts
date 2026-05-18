import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type DeleteLessonRouteProps = {
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

function redirectToCurriculum(
  request: NextRequest,
  courseId: string,
  message: string
) {
  const url = new URL(
    `${getBaseUrl(request)}/admin/courses/${courseId}/curriculum`
  );

  url.searchParams.set("message", message);

  return NextResponse.redirect(url);
}

export async function POST(
  request: NextRequest,
  { params }: DeleteLessonRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: {
      id,
    },
    include: {
      section: {
        select: {
          courseId: true,
        },
      },
    },
  });

  if (!lesson) {
    return NextResponse.redirect(`${getBaseUrl(request)}/admin/courses`);
  }

  const courseId = lesson.section.courseId;

  await prisma.lesson.delete({
    where: {
      id: lesson.id,
    },
  });

  return redirectToCurriculum(request, courseId, "lesson-deleted");
}