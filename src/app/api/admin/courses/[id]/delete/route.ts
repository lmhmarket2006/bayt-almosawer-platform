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
        enrollments: {
          select: {
            id: true,
            isActive: true,
          },
        },
        orderItems: {
          select: {
            id: true,
            order: {
              select: {
                id: true,
                orderStatus: true,
                paymentStatus: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return redirectWithError(request, "/admin/courses", "course-not-found");
    }

    const hasActiveStudents = course.enrollments.some(
      (enrollment) => enrollment.isActive
    );

    const hasRealPaidOrConfirmedOrders = course.orderItems.some((item) => {
      const order = item.order;

      return (
        order.paymentStatus === "PAID" ||
        order.orderStatus === "CONFIRMED"
      );
    });

    if (hasActiveStudents || hasRealPaidOrConfirmedOrders) {
      return redirectWithError(request, "/admin/courses", "course-has-data");
    }

    await prisma.$transaction(async (tx) => {
      const relatedOrderItems = await tx.orderItem.findMany({
        where: {
          courseId: course.id,
        },
        select: {
          id: true,
          orderId: true,
        },
      });

      const relatedOrderIds = Array.from(
        new Set(relatedOrderItems.map((item) => item.orderId))
      );

      await tx.orderItem.deleteMany({
        where: {
          courseId: course.id,
        },
      });

      for (const orderId of relatedOrderIds) {
        const remainingItemsCount = await tx.orderItem.count({
          where: {
            orderId,
          },
        });

        if (remainingItemsCount === 0) {
          await tx.order.delete({
            where: {
              id: orderId,
            },
          });
        }
      }

      await tx.lessonResource.deleteMany({
        where: {
          lesson: {
            section: {
              courseId: course.id,
            },
          },
        },
      });

      await tx.lessonProgress.deleteMany({
        where: {
          lesson: {
            section: {
              courseId: course.id,
            },
          },
        },
      });

      await tx.lesson.deleteMany({
        where: {
          section: {
            courseId: course.id,
          },
        },
      });

      await tx.courseSection.deleteMany({
        where: {
          courseId: course.id,
        },
      });

      await tx.course.delete({
        where: {
          id: course.id,
        },
      });
    });

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