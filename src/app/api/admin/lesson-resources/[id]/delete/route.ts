import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type DeleteLessonResourceRouteProps = {
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

function redirectToLesson(
  request: NextRequest,
  lessonId: string,
  message: string
) {
  const url = new URL(`${getBaseUrl(request)}/admin/lessons/${lessonId}/edit`);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

export async function POST(
  request: NextRequest,
  { params }: DeleteLessonResourceRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;

  const resource = await prisma.lessonResource.findUnique({
    where: {
      id,
    },
  });

  if (!resource) {
    return NextResponse.redirect(`${getBaseUrl(request)}/admin`);
  }

  await prisma.lessonResource.delete({
    where: {
      id: resource.id,
    },
  });

  return redirectToLesson(request, resource.lessonId, "resource-deleted");
}