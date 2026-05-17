import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type DeleteLessonRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

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
      section: true,
    },
  });

  if (!lesson) {
    return NextResponse.redirect(new URL("/admin/courses", request.url));
  }

  await prisma.lesson.delete({
    where: {
      id: lesson.id,
    },
  });

  return NextResponse.redirect(
    new URL(`/admin/courses/${lesson.section.courseId}/curriculum`, request.url)
  );
}