import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type DeleteSectionRouteProps = {
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

export async function GET(request: NextRequest) {
  await requireRole("ADMIN");

  return NextResponse.redirect(`${getBaseUrl(request)}/admin/courses`);
}

export async function POST(
  request: NextRequest,
  { params }: DeleteSectionRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;

  const section = await prisma.courseSection.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      courseId: true,
    },
  });

  if (!section) {
    return NextResponse.redirect(`${getBaseUrl(request)}/admin/courses`);
  }

  await prisma.courseSection.delete({
    where: {
      id: section.id,
    },
  });

  return redirectToCurriculum(request, section.courseId, "section-deleted");
}