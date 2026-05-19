import { PrismaClient, CourseStatus } from "@prisma/client";

const prisma = new PrismaClient();

const realCourseSlugs = [
  "mobile_makeup_photography",
  "makeup_tutorial_video",
  "food_lighting_photography",
  "high_end_retouching",
  "beauty_photography",
  "color_gel_portrait",
];

async function archiveAllNonTaswerakCourses() {
  const courses = await prisma.course.findMany({
    where: {
      slug: {
        notIn: realCourseSlugs,
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
      status: true,
      _count: {
        select: {
          orderItems: true,
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let archivedCount = 0;

  for (const course of courses) {
    await prisma.course.update({
      where: {
        id: course.id,
      },
      data: {
        isPublished: false,
        status: CourseStatus.ARCHIVED,
      },
    });

    archivedCount += 1;

    console.log(
      `Archived non-Taswerak course: ${course.title} / ${course.slug} / orders=${course._count.orderItems} / enrollments=${course._count.enrollments}`
    );
  }

  console.log(`Done. Archived non-Taswerak courses: ${archivedCount}`);
}

async function main() {
  console.log("Starting full design-stage cleanup...");
  await archiveAllNonTaswerakCourses();
  console.log("Design-stage cleanup completed.");
}

main()
  .catch((error) => {
    console.error("Design-stage cleanup failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });