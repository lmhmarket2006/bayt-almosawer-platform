import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type CompleteLessonRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: CompleteLessonRouteProps
) {
  const user = await requireUser();
  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: {
      id,
    },
    include: {
      section: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!lesson) {
    return NextResponse.redirect(new URL("/student/my-courses", request.url));
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: lesson.section.courseId,
      },
    },
  });

  if (!enrollment || !enrollment.isActive) {
    return NextResponse.redirect(new URL("/student/my-courses", request.url));
  }

  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId: lesson.id,
      },
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
    },
    create: {
      userId: user.id,
      lessonId: lesson.id,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  const referer = request.headers.get("referer");
  const redirectUrl = referer || `/learn/${lesson.section.course.slug}/${lesson.id}`;

  return NextResponse.redirect(new URL(redirectUrl, request.url));
}