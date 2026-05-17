import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type LearnCoursePageProps = {
  params: Promise<{
    courseSlug: string;
  }>;
};

export default async function LearnCoursePage({
  params,
}: LearnCoursePageProps) {
  const user = await requireUser();
  const { courseSlug } = await params;

  const course = await prisma.course.findUnique({
    where: {
      slug: courseSlug,
    },
    include: {
      sections: {
        include: {
          lessons: {
            include: {
              progresses: {
                where: {
                  userId: user.id,
                },
              },
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!course || !course.isPublished || course.status !== "PUBLISHED") {
    notFound();
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  if (!enrollment || !enrollment.isActive) {
    redirect("/student/my-courses");
  }

  const lessons = course.sections.flatMap((section) => section.lessons);

  if (lessons.length === 0) {
    return (
      <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-20">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-extrabold">{course.title}</h1>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            لا توجد دروس مضافة لهذا الكورس حتى الآن.
          </p>
          <Link
            href="/student/my-courses"
            className="mt-6 inline-flex rounded-2xl bg-gradient-to-l from-[var(--brand-400)] via-[var(--brand-500)] to-[var(--brand-700)] px-6 py-3 text-sm font-extrabold text-white"
          >
            العودة إلى كورساتي
          </Link>
        </div>
      </main>
    );
  }

  redirect(`/learn/${course.slug}/${lessons[0].id}`);
}