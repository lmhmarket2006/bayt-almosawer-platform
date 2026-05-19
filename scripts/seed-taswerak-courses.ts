import { PrismaClient, CourseLevel, CourseStatus, CourseType } from "@prisma/client";

const prisma = new PrismaClient();

function createLessonTitle(courseTitle: string, index: number) {
  return `المحاضرة ${index}: ${courseTitle}`;
}

const categories = [
  {
    name: "التصوير الفوتوغرافي",
    slug: "photography",
    description: "دورات متخصصة في أساسيات وتقنيات التصوير الفوتوغرافي.",
    sortOrder: 1,
  },
  {
    name: "الفيديو والمونتاج",
    slug: "video_editing",
    description: "دورات تصوير الفيديو وصناعة المحتوى والمونتاج.",
    sortOrder: 2,
  },
  {
    name: "تصوير الأطعمة",
    slug: "food_photography",
    description: "دورات متخصصة في تصوير الأطعمة والإضاءة التجارية.",
    sortOrder: 3,
  },
  {
    name: "تصوير البورتريه",
    slug: "portrait_photography",
    description: "دورات تصوير الأشخاص والجمال والبورتريه داخل الاستديو.",
    sortOrder: 4,
  },
  {
    name: "تصوير الفيديو",
    slug: "video_production",
    description: "دورات متخصصة في إنتاج الفيديو والريلز والمحتوى المرئي.",
    sortOrder: 5,
  },
  {
    name: "تعديل البشرة",
    slug: "retouching",
    description: "دورات احترافية في الريتاتش وتعديل البشرة.",
    sortOrder: 6,
  },
];

const courses = [
  {
    title: "تصوير الميكب بالجوال",
    slug: "mobile_makeup_photography",
    categorySlug: "video_editing",
    instructor: "تصويرك",
    lessonCount: 11,
    level: CourseLevel.BEGINNER,
    price: 199,
    salePrice: 49,
    thumbnailUrl: "/course_images/course_01_mobile_makeup.jpg",
    description:
      "دورة عملية لتعلّم تصوير الميكب بالجوال بطريقة منظمة تساعدك على إنتاج محتوى واضح وجذاب مناسب للسوشيال ميديا.",
  },
  {
    title: "تعلم أسرار تصوير فيديوهات الميكب توتريال والفاينل لوك باحترافية",
    slug: "makeup_tutorial_video",
    categorySlug: "video_editing",
    instructor: "أحمد زغلول",
    lessonCount: 9,
    level: CourseLevel.BEGINNER,
    price: 899,
    salePrice: 49,
    thumbnailUrl: "/course_images/course_02_makeup_video.jpg",
    description:
      "دورة متخصصة للمصورين وصناع المحتوى لتعلّم تصوير فيديوهات الميكب توتريال والفاينل لوك باحترافية، مع التركيز على الإضاءة والزوايا وطريقة عرض التفاصيل.",
  },
  {
    title: "تعلم تصوير وتكنيكات الإضاءة الاحترافية في تصوير الأطعمة",
    slug: "food_lighting_photography",
    categorySlug: "food_photography",
    instructor: "تصويرك",
    lessonCount: 14,
    level: CourseLevel.BEGINNER,
    price: 899,
    salePrice: 199,
    thumbnailUrl: "/course_images/course_03_food_photography.jpg",
    description:
      "دورة لتعلّم أساسيات وتكنيكات تصوير الأطعمة والإضاءة الاحترافية، مع تطبيقات تساعد المصور على إبراز جمال الطعام بطريقة تجارية جذابة.",
  },
  {
    title: "تعديل البشرة الاحترافي High-End Retouching",
    slug: "high_end_retouching",
    categorySlug: "retouching",
    instructor: "أحمد زغلول",
    lessonCount: 15,
    level: CourseLevel.ADVANCED,
    price: 1099,
    salePrice: 199,
    thumbnailUrl: "/course_images/course_04_high_end_retouching.jpg",
    description:
      "دورة احترافية في تعديل البشرة High-End Retouching للمصورين الراغبين في الوصول إلى نتائج متقدمة في تحرير الصور ومعالجة تفاصيل البشرة.",
  },
  {
    title: "تعلم تصوير الجمال Beauty Photography",
    slug: "beauty_photography",
    categorySlug: "portrait_photography",
    instructor: "أحمد زغلول",
    lessonCount: 12,
    level: CourseLevel.ADVANCED,
    price: 1299,
    salePrice: 199,
    thumbnailUrl: "/course_images/course_05_beauty_photography.jpg",
    description:
      "دورة متخصصة في تصوير الجمال Beauty Photography، تركز على الإضاءة، البوزات، التكوين، وإخراج صور احترافية مناسبة لعلامات التجميل ومجلات الموضة.",
  },
  {
    title: "تعلم استخدام الكلر جيل في تصوير البورتريه داخل الاستديو",
    slug: "color_gel_portrait",
    categorySlug: "photography",
    instructor: "أحمد زغلول",
    lessonCount: 14,
    level: CourseLevel.BEGINNER,
    price: 899,
    salePrice: 199,
    thumbnailUrl: "/course_images/course_06_color_gel_portrait.jpg",
    description:
      "دورة عملية لتعلّم استخدام الكلر جيل في تصوير البورتريه داخل الاستديو، وإضافة لمسات إبداعية على الإضاءة والخلفيات والمزاج البصري للصورة.",
  },
];

async function getAdminId() {
  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
    select: {
      id: true,
    },
  });

  return admin?.id ?? null;
}

async function seedCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        description: category.description,
        isActive: true,
        sortOrder: category.sortOrder,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        isActive: true,
        sortOrder: category.sortOrder,
      },
    });
  }
}

async function seedCourses() {
  const adminId = await getAdminId();

  for (const courseData of courses) {
    const category = await prisma.category.findUnique({
      where: {
        slug: courseData.categorySlug,
      },
      select: {
        id: true,
      },
    });

    const course = await prisma.course.upsert({
      where: {
        slug: courseData.slug,
      },
      update: {
        title: courseData.title,
        subtitle: `المدرب: ${courseData.instructor}`,
        description: `${courseData.description}\n\nالمدرب: ${courseData.instructor}`,
        thumbnailUrl: courseData.thumbnailUrl,
        courseType: CourseType.RECORDED,
        level: courseData.level,
        language: "ar",
        price: courseData.price,
        salePrice: courseData.salePrice,
        status: CourseStatus.PUBLISHED,
        isPublished: true,
        categoryId: category?.id ?? null,
      },
      create: {
        title: courseData.title,
        slug: courseData.slug,
        subtitle: `المدرب: ${courseData.instructor}`,
        description: `${courseData.description}\n\nالمدرب: ${courseData.instructor}`,
        thumbnailUrl: courseData.thumbnailUrl,
        promoVideoUrl: null,
        courseType: CourseType.RECORDED,
        level: courseData.level,
        language: "ar",
        price: courseData.price,
        salePrice: courseData.salePrice,
        status: CourseStatus.PUBLISHED,
        isPublished: true,
        categoryId: category?.id ?? null,
        createdById: adminId,
      },
      select: {
        id: true,
        title: true,
      },
    });

    const existingLessonsCount = await prisma.lesson.count({
      where: {
        section: {
          courseId: course.id,
        },
      },
    });

    if (existingLessonsCount === 0) {
      const section = await prisma.courseSection.create({
        data: {
          courseId: course.id,
          title: "محتوى الدورة",
          sortOrder: 1,
        },
      });

      await prisma.lesson.createMany({
        data: Array.from({ length: courseData.lessonCount }).map((_, index) => ({
          sectionId: section.id,
          title: createLessonTitle(courseData.title, index + 1),
          description:
            "محتوى تدريبي سيتم تحديثه بالفيديو والملفات الخاصة بهذه المحاضرة.",
          videoUrl: null,
          durationMinutes: 0,
          isFreePreview: index === 0,
          sortOrder: index + 1,
        })),
      });
    }
  }
}

async function archiveEmptyDemoCourses() {
  const realSlugs = courses.map((course) => course.slug);

  const candidateCourses = await prisma.course.findMany({
    where: {
      slug: {
        notIn: realSlugs,
      },
      orderItems: {
        none: {},
      },
      enrollments: {
        none: {},
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      sections: {
        select: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
    },
  });

  for (const course of candidateCourses) {
    const lessonsCount = course.sections.reduce(
      (total, section) => total + section._count.lessons,
      0
    );

    const looksLikeDemo =
      lessonsCount === 0 ||
      course.title.trim().length <= 4 ||
      course.slug.includes("test") ||
      course.slug.includes("demo");

    if (looksLikeDemo) {
      await prisma.course.update({
        where: {
          id: course.id,
        },
        data: {
          isPublished: false,
          status: CourseStatus.ARCHIVED,
        },
      });

      console.log(`Archived demo course: ${course.title}`);
    }
  }
}

async function main() {
  console.log("Seeding Taswerak categories...");
  await seedCategories();

  console.log("Seeding Taswerak courses...");
  await seedCourses();

  console.log("Archiving empty/demo courses...");
  await archiveEmptyDemoCourses();

  console.log("Taswerak seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Taswerak seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });