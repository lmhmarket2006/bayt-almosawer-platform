import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { redirectToAdminCourses, redirectWithError } from "@/lib/url";

type DeleteCourseRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest) {
  await requireRole("ADMIN");

  return redirectToAdminCourses(request, "use-delete-button");
}

export async function POST(
  request: NextRequest,
  { params }: DeleteCourseRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;

  try {
    const course = await prisma.course.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        _count: {
          select: {
            orderItems: true,
            enrollments: true,
            sections: true,
          },
        },
      },
    });

    if (!course) {
      return redirectWithError(request, "/admin/courses", "course-not-found");
    }

    const hasCommercialData =
      course._count.orderItems > 0 || course._count.enrollments > 0;

    if (hasCommercialData) {
      return redirectWithError(request, "/admin/courses", "course-has-data");
    }

    await prisma.$transaction([
      prisma.lessonResource.deleteMany({
        where: {
          lesson: {
            section: {
              courseId: course.id,
            },
          },
        },
      }),

      prisma.lessonProgress.deleteMany({
        where: {
          lesson: {
            section: {
              courseId: course.id,
            },
          },
        },
      }),

      prisma.lesson.deleteMany({
        where: {
          section: {
            courseId: course.id,
          },
        },
      }),

      prisma.courseSection.deleteMany({
        where: {
          courseId: course.id,
        },
      }),

      prisma.course.delete({
        where: {
          id: course.id,
        },
      }),
    ]);

    return redirectToAdminCourses(request, "course-deleted");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return redirectWithError(request, "/admin/courses", "course-not-found");
    }

    console.error("Delete course error:", error);

    return redirectWithError(request, "/admin/courses", "delete-course-failed");
  }
}