import { LessonResourceType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type CreateLessonResourceRouteProps = {
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

function getResourceType(value: string): LessonResourceType {
  if (value === "PDF") return LessonResourceType.PDF;
  if (value === "ZIP") return LessonResourceType.ZIP;
  if (value === "OTHER") return LessonResourceType.OTHER;

  return LessonResourceType.LINK;
}

function isValidExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function POST(
  request: NextRequest,
  { params }: CreateLessonResourceRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;
  const formData = await request.formData();

  const title = String(formData.get("title") || "").trim();
  const url = String(formData.get("url") || "").trim();
  const type = getResourceType(String(formData.get("type") || "LINK"));
  const sortOrderValue = Number(formData.get("sortOrder") || 0);

  if (!title || !url || !isValidExternalUrl(url)) {
    return redirectToLesson(request, id, "invalid-resource");
  }

  const lesson = await prisma.lesson.findUnique({
    where: {
      id,
    },
  });

  if (!lesson) {
    return redirectToLesson(request, id, "lesson-not-found");
  }

  await prisma.lessonResource.create({
    data: {
      lessonId: id,
      title,
      url,
      type,
      sortOrder: Number.isFinite(sortOrderValue) ? sortOrderValue : 0,
    },
  });

  return redirectToLesson(request, id, "resource-created");
}