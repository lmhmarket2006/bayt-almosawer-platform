import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@baytalmosawer.com";
  const adminPassword = "Admin@123456";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      name: "مدير منصة بيت المصور",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name: "مدير منصة بيت المصور",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  const photographyCategory = await prisma.category.upsert({
    where: {
      slug: "photography",
    },
    update: {
      name: "التصوير الفوتوغرافي",
      description: "كورسات متخصصة في أساسيات واحتراف التصوير.",
      isActive: true,
      sortOrder: 1,
    },
    create: {
      name: "التصوير الفوتوغرافي",
      slug: "photography",
      description: "كورسات متخصصة في أساسيات واحتراف التصوير.",
      isActive: true,
      sortOrder: 1,
    },
  });

  const lightingCategory = await prisma.category.upsert({
    where: {
      slug: "lighting",
    },
    update: {
      name: "الإضاءة",
      description: "كورسات عملية لفهم الإضاءة والتحكم بها داخل وخارج الاستوديو.",
      isActive: true,
      sortOrder: 2,
    },
    create: {
      name: "الإضاءة",
      slug: "lighting",
      description: "كورسات عملية لفهم الإضاءة والتحكم بها داخل وخارج الاستوديو.",
      isActive: true,
      sortOrder: 2,
    },
  });

  const contentCategory = await prisma.category.upsert({
    where: {
      slug: "content-creation",
    },
    update: {
      name: "صناعة المحتوى",
      description: "كورسات تساعد المصورين على بناء حضور رقمي وتسويق خدماتهم.",
      isActive: true,
      sortOrder: 3,
    },
    create: {
      name: "صناعة المحتوى",
      slug: "content-creation",
      description: "كورسات تساعد المصورين على بناء حضور رقمي وتسويق خدماتهم.",
      isActive: true,
      sortOrder: 3,
    },
  });

  const courseOne = await prisma.course.upsert({
    where: {
      slug: "professional-photography-basics",
    },
    update: {
      title: "أساسيات التصوير الاحترافي",
      subtitle: "ابدأ رحلتك في التصوير من الصفر بخطة واضحة وعملية.",
      description:
        "كورس عملي يساعدك على فهم أساسيات الكاميرا، التعريض، العدسات، تكوين الصورة، وكيفية الانتقال من التصوير العشوائي إلى التصوير الواعي. مناسب للمبتدئين والراغبين في بناء أساس قوي في التصوير.",
      thumbnailUrl: null,
      promoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      courseType: "RECORDED",
      level: "BEGINNER",
      language: "ar",
      price: 199,
      salePrice: null,
      status: "PUBLISHED",
      isPublished: true,
      categoryId: photographyCategory.id,
      createdById: admin.id,
    },
    create: {
      title: "أساسيات التصوير الاحترافي",
      slug: "professional-photography-basics",
      subtitle: "ابدأ رحلتك في التصوير من الصفر بخطة واضحة وعملية.",
      description:
        "كورس عملي يساعدك على فهم أساسيات الكاميرا، التعريض، العدسات، تكوين الصورة، وكيفية الانتقال من التصوير العشوائي إلى التصوير الواعي. مناسب للمبتدئين والراغبين في بناء أساس قوي في التصوير.",
      thumbnailUrl: null,
      promoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      courseType: "RECORDED",
      level: "BEGINNER",
      language: "ar",
      price: 199,
      salePrice: null,
      status: "PUBLISHED",
      isPublished: true,
      categoryId: photographyCategory.id,
      createdById: admin.id,
    },
  });

  const courseTwo = await prisma.course.upsert({
    where: {
      slug: "studio-lighting-mastery",
    },
    update: {
      title: "احتراف الإضاءة داخل الاستوديو",
      subtitle: "افهم الضوء والظل واصنع نتائج احترافية داخل الاستوديو.",
      description:
        "كورس متخصص في فهم مصادر الإضاءة، توزيع الإضاءة، قراءة الظلال، بناء المشهد، وتحقيق نتائج احترافية في تصوير البورتريه والمنتجات داخل الاستوديو.",
      thumbnailUrl: null,
      promoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      courseType: "RECORDED",
      level: "INTERMEDIATE",
      language: "ar",
      price: 499,
      salePrice: null,
      status: "PUBLISHED",
      isPublished: true,
      categoryId: lightingCategory.id,
      createdById: admin.id,
    },
    create: {
      title: "احتراف الإضاءة داخل الاستوديو",
      slug: "studio-lighting-mastery",
      subtitle: "افهم الضوء والظل واصنع نتائج احترافية داخل الاستوديو.",
      description:
        "كورس متخصص في فهم مصادر الإضاءة، توزيع الإضاءة، قراءة الظلال، بناء المشهد، وتحقيق نتائج احترافية في تصوير البورتريه والمنتجات داخل الاستوديو.",
      thumbnailUrl: null,
      promoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      courseType: "RECORDED",
      level: "INTERMEDIATE",
      language: "ar",
      price: 499,
      salePrice: null,
      status: "PUBLISHED",
      isPublished: true,
      categoryId: lightingCategory.id,
      createdById: admin.id,
    },
  });

  const courseThree = await prisma.course.upsert({
    where: {
      slug: "content-creation-for-photographers",
    },
    update: {
      title: "صناعة المحتوى للمصورين",
      subtitle: "حوّل مهارتك إلى محتوى يجذب العملاء ويزيد فرص البيع.",
      description:
        "كورس موجه للمصورين الذين يريدون بناء حضور رقمي قوي، إنتاج محتوى جذاب، تحسين طريقة عرض أعمالهم، وفهم أساسيات التسويق الشخصي عبر المنصات الرقمية.",
      thumbnailUrl: null,
      promoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      courseType: "RECORDED",
      level: "ADVANCED",
      language: "ar",
      price: 299,
      salePrice: null,
      status: "PUBLISHED",
      isPublished: true,
      categoryId: contentCategory.id,
      createdById: admin.id,
    },
    create: {
      title: "صناعة المحتوى للمصورين",
      slug: "content-creation-for-photographers",
      subtitle: "حوّل مهارتك إلى محتوى يجذب العملاء ويزيد فرص البيع.",
      description:
        "كورس موجه للمصورين الذين يريدون بناء حضور رقمي قوي، إنتاج محتوى جذاب، تحسين طريقة عرض أعمالهم، وفهم أساسيات التسويق الشخصي عبر المنصات الرقمية.",
      thumbnailUrl: null,
      promoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      courseType: "RECORDED",
      level: "ADVANCED",
      language: "ar",
      price: 299,
      salePrice: null,
      status: "PUBLISHED",
      isPublished: true,
      categoryId: contentCategory.id,
      createdById: admin.id,
    },
  });

  await seedCourseCurriculum(courseOne.id, [
    {
      title: "الانطلاقة",
      lessons: [
        "مقدمة الكورس وطريقة الاستفادة",
        "ما الذي تحتاجه قبل البدء؟",
        "فهم الكاميرا بدون تعقيد",
      ],
    },
    {
      title: "أساسيات الصورة",
      lessons: [
        "مثلث التعريض",
        "فتحة العدسة وعمق المجال",
        "سرعة الغالق وتجميد الحركة",
        "ISO وجودة الصورة",
      ],
    },
  ]);

  await seedCourseCurriculum(courseTwo.id, [
    {
      title: "فهم الإضاءة",
      lessons: [
        "طبيعة الضوء واتجاهه",
        "الضوء الناعم والضوء القاسي",
        "قراءة الظلال في الصورة",
      ],
    },
    {
      title: "تطبيقات داخل الاستوديو",
      lessons: [
        "إضاءة بورتريه بسيطة",
        "إضاءة منتجات احترافية",
        "أخطاء شائعة في الإضاءة",
      ],
    },
  ]);

  await seedCourseCurriculum(courseThree.id, [
    {
      title: "بناء حضورك الرقمي",
      lessons: [
        "كيف تختار زاوية محتواك؟",
        "تحويل الأعمال إلى قصص",
        "خطة محتوى أسبوعية للمصورين",
      ],
    },
    {
      title: "التسويق للمصور",
      lessons: [
        "كتابة عرض خدمتك بوضوح",
        "بناء صفحة أعمال مقنعة",
        "تحويل المتابع إلى عميل",
      ],
    },
  ]);

  console.log("Seed completed successfully.");
  console.log({
    adminEmail,
    adminPassword,
    courses: [courseOne.title, courseTwo.title, courseThree.title],
  });
}

async function seedCourseCurriculum(
  courseId: string,
  sections: Array<{
    title: string;
    lessons: string[];
  }>
) {
  await prisma.lesson.deleteMany({
    where: {
      section: {
        courseId,
      },
    },
  });

  await prisma.courseSection.deleteMany({
    where: {
      courseId,
    },
  });

  for (const [sectionIndex, section] of sections.entries()) {
    const createdSection = await prisma.courseSection.create({
      data: {
        courseId,
        title: section.title,
        sortOrder: sectionIndex + 1,
      },
    });

    for (const [lessonIndex, lessonTitle] of section.lessons.entries()) {
      await prisma.lesson.create({
        data: {
          sectionId: createdSection.id,
          title: lessonTitle,
          description: "شرح عملي ومنظم ضمن محتوى الكورس.",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          durationMinutes: 8 + lessonIndex * 3,
          isFreePreview: sectionIndex === 0 && lessonIndex === 0,
          sortOrder: lessonIndex + 1,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });