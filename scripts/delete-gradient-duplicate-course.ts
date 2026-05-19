import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const targetTitlePart = "الكلر جيل";
const keepThumbnailUrl = "/course_images/course_06_color_gel_portrait.jpg";

async function deleteDuplicateGradientCourse() {
  const duplicateCourses = await prisma.course.findMany({
    where: {
      title: {
        contains: targetTitlePart,
      },
      OR: [
        {
          thumbnailUrl: null,
        },
        {
          thumbnailUrl: "",
        },
        {
          NOT: {
            thumbnailUrl: keepThumbnailUrl,
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnailUrl: true,
      _count: {
        select: {
          orderItems: true,
          enrollments: true,
          sections: true,
        },
      },
    },
  });

  if (duplicateCourses.length === 0) {
    console.log("No duplicate gradient course found.");
    return;
  }

  console.log("Duplicate courses found:");
  console.log(JSON.stringify(duplicateCourses, null, 2));

  for (const course of duplicateCourses) {
    console.log(`Deleting duplicate course: ${course.title} / ${course.slug}`);

    await prisma.$transaction(async (tx) => {
      const orderItems = await tx.orderItem.findMany({
        where: {
          courseId: course.id,
        },
        select: {
          orderId: true,
        },
      });

      const relatedOrderIds = Array.from(
        new Set(orderItems.map((item) => item.orderId))
      );

      await tx.lessonProgress.deleteMany({
        where: {
          lesson: {
            section: {
              courseId: course.id,
            },
          },
        },
      });

      await tx.lessonResource.deleteMany({
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

      await tx.enrollment.deleteMany({
        where: {
          courseId: course.id,
        },
      });

      await tx.orderItem.deleteMany({
        where: {
          courseId: course.id,
        },
      });

      for (const orderId of relatedOrderIds) {
        const remainingItems = await tx.orderItem.count({
          where: {
            orderId,
          },
        });

        if (remainingItems === 0) {
          await tx.order.delete({
            where: {
              id: orderId,
            },
          });
        }
      }

      await tx.course.delete({
        where: {
          id: course.id,
        },
      });
    });

    console.log(`Deleted duplicate course: ${course.title} / ${course.slug}`);
  }

  console.log("Duplicate gradient course cleanup completed.");
}

deleteDuplicateGradientCourse()
  .catch((error) => {
    console.error("Delete duplicate course failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });