import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type CreateLessonRouteProps = {
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
  const url = new URL(`${getBaseUrl(request)}/admin/courses/${courseId}/curriculum`);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

export async function POST(
  request: NextRequest,
  { params }: CreateLessonRouteProps
) {
  await requireRole("ADMIN");

  const { id: sectionId } = await params;
  const formData = await request.formData();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const videoUrl = String(formData.get("videoUrl") || "").trim() || null;
  const durationMinutes = Number(formData.get("durationMinutes") || 0);
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isFreePreview = formData.get("isFreePreview") === "true";

  const section = await prisma.courseSection.findUnique({
    where: {
      id: sectionId,
    },
    select: {
      id: true,
      courseId: true,
    },
  });

  if (!section) {
    return NextResponse.redirect(`${getBaseUrl(request)}/admin/courses`);
  }

  if (!title) {
    return redirectToCurriculum(request, section.courseId, "lesson-title-required");
  }

  await prisma.lesson.create({
    data: {
      sectionId: section.id,
      title,
      description,
      videoUrl,
      durationMinutes: Number.isFinite(durationMinutes)
        ? durationMinutes
        : 0,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      isFreePreview,
    },
  });

  return redirectToCurriculum(request, section.courseId, "lesson-created");
}