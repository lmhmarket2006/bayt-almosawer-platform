import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type TogglePublishRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: TogglePublishRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id,
    },
  });

  if (!course) {
    return NextResponse.redirect(new URL("/admin/courses", request.url));
  }

  const nextIsPublished = !course.isPublished;

  await prisma.course.update({
    where: {
      id,
    },
    data: {
      isPublished: nextIsPublished,
      status: nextIsPublished ? "PUBLISHED" : "DRAFT",
    },
  });

  return NextResponse.redirect(new URL("/admin/courses", request.url));
}