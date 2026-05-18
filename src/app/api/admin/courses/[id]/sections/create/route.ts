import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type CreateSectionRouteProps = {
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
  { params }: CreateSectionRouteProps
) {
  await requireRole("ADMIN");

  const { id: courseId } = await params;
  const formData = await request.formData();

  const title = String(formData.get("title") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0);

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (!course) {
    return NextResponse.redirect(`${getBaseUrl(request)}/admin/courses`);
  }

  if (!title) {
    return redirectToCurriculum(request, courseId, "section-title-required");
  }

  await prisma.courseSection.create({
    data: {
      courseId,
      title,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });

  return redirectToCurriculum(request, courseId, "section-created");
}