import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getPlatformSiteName } from "@/lib/platform-settings";

type LessonWatchPageProps = {
  params: Promise<{
    courseSlug: string;
    lessonId: string;
  }>;
};

type VideoSource =
  | {
      type: "iframe";
      url: string;
      provider: "YouTube" | "Vimeo" | "Embed";
    }
  | {
      type: "video";
      url: string;
      provider: "Video";
    }
  | {
      type: "none";
      url: "";
      provider: "None";
    }
  | {
      type: "invalid";
      url: string;
      provider: "Invalid";
    };

function getResourceTypeLabel(type: string) {
  const labels: Record<string, string> = {
    PDF: "PDF",
    ZIP: "ZIP",
    LINK: "رابط",
    OTHER: "ملف آخر",
  };

  return labels[type] ?? type;
}

function getResourceButtonLabel(type: string) {
  const labels: Record<string, string> = {
    PDF: "فتح ملف PDF",
    ZIP: "تحميل ZIP",
    LINK: "فتح الرابط",
    OTHER: "فتح الملف",
  };

  return labels[type] ?? "فتح الملف";
}

function getResourceBadgeClass(type: string) {
  if (type === "PDF") {
    return "bg-red-50 text-red-700";
  }

  if (type === "ZIP") {
    return "bg-blue-50 text-blue-700";
  }

  if (type === "LINK") {
    return "bg-green-50 text-green-700";
  }

  return "bg-[var(--brand-50)] text-[var(--brand-700)]";
}

function getYouTubeId(url: URL) {
  if (url.hostname.includes("youtu.be")) {
    return url.pathname.split("/").filter(Boolean)[0] ?? "";
  }

  if (url.hostname.includes("youtube.com")) {
    if (url.pathname.startsWith("/watch")) {
      return url.searchParams.get("v") ?? "";
    }

    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/").filter(Boolean)[1] ?? "";
    }

    if (url.pathname.startsWith("/shorts/")) {
      return url.pathname.split("/").filter(Boolean)[1] ?? "";
    }
  }

  return "";
}

function getVimeoId(url: URL) {
  if (!url.hostname.includes("vimeo.com")) {
    return "";
  }

  if (url.hostname.includes("player.vimeo.com")) {
    const parts = url.pathname.split("/").filter(Boolean);
    const videoIndex = parts.indexOf("video");

    if (videoIndex >= 0 && parts[videoIndex + 1]) {
      return parts[videoIndex + 1];
    }
  }

  return url.pathname.split("/").filter(Boolean)[0] ?? "";
}

function isDirectVideoUrl(url: URL) {
  const pathname = url.pathname.toLowerCase();

  return (
    pathname.endsWith(".mp4") ||
    pathname.endsWith(".webm") ||
    pathname.endsWith(".ogg")
  );
}

function normalizeVideoSource(value?: string | null): VideoSource {
  const rawUrl = String(value || "").trim();

  if (!rawUrl) {
    return {
      type: "none",
      url: "",
      provider: "None",
    };
  }

  try {
    const url = new URL(rawUrl);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return {
        type: "invalid",
        url: rawUrl,
        provider: "Invalid",
      };
    }

    const youtubeId = getYouTubeId(url);

    if (youtubeId) {
      return {
        type: "iframe",
        url: `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`,
        provider: "YouTube",
      };
    }

    const vimeoId = getVimeoId(url);

    if (vimeoId) {
      return {
        type: "iframe",
        url: `https://player.vimeo.com/video/${vimeoId}`,
        provider: "Vimeo",
      };
    }

    if (isDirectVideoUrl(url)) {
      return {
        type: "video",
        url: rawUrl,
        provider: "Video",
      };
    }

    if (
      rawUrl.includes("/embed/") ||
      rawUrl.includes("player.") ||
      rawUrl.includes("iframe")
    ) {
      return {
        type: "iframe",
        url: rawUrl,
        provider: "Embed",
      };
    }

    return {
      type: "invalid",
      url: rawUrl,
      provider: "Invalid",
    };
  } catch {
    return {
      type: "invalid",
      url: rawUrl,
      provider: "Invalid",
    };
  }
}

function getVideoProviderLabel(source: VideoSource) {
  const labels: Record<string, string> = {
    YouTube: "YouTube",
    Vimeo: "Vimeo",
    Embed: "Embed",
    Video: "ملف فيديو مباشر",
    None: "لا يوجد فيديو",
    Invalid: "رابط غير صالح",
  };

  return labels[source.provider] ?? source.provider;
}

function VideoPlayer({
  source,
  title,
}: {
  source: VideoSource;
  title: string;
}) {
  if (source.type === "none") {
    return (
      <div className="flex aspect-video items-center justify-center p-8 text-center text-white">
        <div>
          <p className="text-xl font-extrabold">لا يوجد فيديو لهذا الدرس</p>
          <p className="mt-3 text-sm leading-7 text-white/60">
            يمكن للإدارة إضافة رابط فيديو من صفحة تعديل الدرس.
          </p>
        </div>
      </div>
    );
  }

  if (source.type === "invalid") {
    return (
      <div className="flex aspect-video items-center justify-center p-8 text-center text-white">
        <div>
          <p className="text-xl font-extrabold">رابط الفيديو غير مدعوم</p>
          <p className="mt-3 text-sm leading-7 text-white/60">
            استخدم رابط YouTube أو Vimeo أو رابط Embed أو ملف فيديو مباشر بصيغة
            MP4 / WebM.
          </p>
        </div>
      </div>
    );
  }

  if (source.type === "video") {
    return (
      <video
        src={source.url}
        className="aspect-video w-full bg-black"
        controls
        controlsList="nodownload"
        preload="metadata"
      >
        المتصفح لا يدعم تشغيل الفيديو.
      </video>
    );
  }

  return (
    <iframe
      src={source.url}
      title={title}
      className="aspect-video w-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}

export default async function LessonWatchPage({
  params,
}: LessonWatchPageProps) {
  const user = await requireUser();
  const siteName = await getPlatformSiteName();
  const { courseSlug, lessonId } = await params;

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
              resources: {
                orderBy: [
                  {
                    sortOrder: "asc",
                  },
                  {
                    createdAt: "asc",
                  },
                ],
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
  const currentLessonIndex = lessons.findIndex(
    (lesson) => lesson.id === lessonId
  );
  const currentLesson = lessons[currentLessonIndex];

  if (!currentLesson) {
    notFound();
  }

  const videoSource = normalizeVideoSource(currentLesson.videoUrl);

  const completedLessonsCount = lessons.filter(
    (lesson) => lesson.progresses.length > 0 && lesson.progresses[0].isCompleted
  ).length;

  const progress =
    lessons.length > 0
      ? Math.round((completedLessonsCount / lessons.length) * 100)
      : 0;

  const previousLesson = lessons[currentLessonIndex - 1];
  const nextLesson = lessons[currentLessonIndex + 1];

  const isCompleted =
    currentLesson.progresses.length > 0 &&
    currentLesson.progresses[0].isCompleted;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 sm:px-8 lg:px-20 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-5 rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <Link
                href="/student/my-courses"
                className="mb-3 inline-flex text-sm font-extrabold text-[var(--brand-700)] transition hover:text-[var(--accent-500)]"
              >
                ← العودة إلى كورساتي
              </Link>

              <p className="font-bold text-[var(--brand-500)]">
                مشاهدة الدرس
              </p>

              <h1 className="mt-2 text-2xl font-extrabold leading-tight text-[var(--brand-900)] lg:text-3xl">
                {course.title}
              </h1>

              <p className="mt-2 text-sm font-bold text-[var(--text-muted)]">
                {siteName}
              </p>
            </div>

            <div className="w-full lg:w-80">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
                <span>تقدمك في الكورس</span>
                <span>{progress}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[var(--brand-50)]">
                <div
                  className="h-full rounded-full bg-[var(--brand-700)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">
                {completedLessonsCount} درس مكتمل من أصل {lessons.length}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <section className="overflow-hidden rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
            <div className="overflow-hidden rounded-[1.25rem] bg-[var(--brand-950)] shadow-xl shadow-black/10 sm:rounded-[1.5rem]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-4 py-3 text-white">
                <div>
                  <p className="text-xs font-bold text-white/50">مشغل الدرس</p>
                  <p className="mt-1 text-sm font-extrabold">
                    {getVideoProviderLabel(videoSource)}
                  </p>
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/80">
                  {currentLesson.durationMinutes > 0
                    ? `${currentLesson.durationMinutes} دقيقة`
                    : "بدون مدة"}
                </span>
              </div>

              <VideoPlayer source={videoSource} title={currentLesson.title} />
            </div>

            {videoSource.type === "invalid" ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
                رابط الفيديو الحالي غير قابل للتشغيل داخل المشغل. من لوحة
                الإدارة استخدم رابط YouTube عادي، أو Vimeo، أو رابط Embed، أو
                ملف MP4 مباشر.
              </div>
            ) : null}

            <div className="mt-5 sm:mt-6">
              <p className="font-bold text-[var(--brand-500)]">
                الدرس {currentLessonIndex + 1} من {lessons.length}
              </p>

              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-[var(--brand-900)] sm:text-3xl">
                {currentLesson.title}
              </h2>

              {currentLesson.description ? (
                <p className="mt-4 leading-8 text-[var(--text-muted)]">
                  {currentLesson.description}
                </p>
              ) : (
                <p className="mt-4 leading-8 text-[var(--text-muted)]">
                  لا يوجد وصف مضاف لهذا الدرس حاليًا.
                </p>
              )}
            </div>

            <section className="mt-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 sm:p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-bold text-[var(--brand-500)]">
                    مرفقات الدرس
                  </p>
                  <h3 className="mt-1 text-xl font-extrabold text-[var(--brand-900)]">
                    ملفات وموارد إضافية
                  </h3>
                </div>

                <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[var(--brand-700)]">
                  {currentLesson.resources.length} مرفق
                </span>
              </div>

              {currentLesson.resources.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-[var(--border-soft)] bg-white p-5 text-center text-sm font-bold text-[var(--text-muted)]">
                  لا توجد مرفقات لهذا الدرس حاليًا.
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {currentLesson.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border-soft)] bg-white p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-extrabold text-[var(--brand-900)]">
                            {resource.title}
                          </p>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-extrabold ${getResourceBadgeClass(
                              resource.type
                            )}`}
                          >
                            {getResourceTypeLabel(resource.type)}
                          </span>
                        </div>

                        <p
                          className="mt-2 break-all text-xs text-[var(--text-muted)]"
                          dir="ltr"
                        >
                          {resource.url}
                        </p>
                      </div>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-[var(--accent-500)] px-5 py-3 text-center text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--accent-600)]"
                      >
                        {getResourceButtonLabel(resource.type)}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-4 text-xs leading-6 text-[var(--text-muted)]">
                إذا كان الرابط من Google Drive أو OneDrive ولم يفتح، تأكد أن
                إعدادات مشاركة الملف تسمح بالوصول لمن لديه الرابط.
              </p>
            </section>

            <div className="mt-6 flex flex-col justify-between gap-3 border-t border-[var(--border-soft)] pt-5 sm:flex-row">
              <div className="grid grid-cols-2 gap-2 sm:flex">
                {previousLesson ? (
                  <Link
                    href={`/learn/${course.slug}/${previousLesson.id}`}
                    className="rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)]"
                  >
                    السابق
                  </Link>
                ) : (
                  <span className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 text-center text-sm font-bold text-[var(--text-muted)]">
                    السابق
                  </span>
                )}

                {nextLesson ? (
                  <Link
                    href={`/learn/${course.slug}/${nextLesson.id}`}
                    className="rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-center text-sm font-extrabold text-[var(--brand-900)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-400)]"
                  >
                    التالي
                  </Link>
                ) : (
                  <span className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 text-center text-sm font-bold text-[var(--text-muted)]">
                    التالي
                  </span>
                )}
              </div>

              <form
                action={`/api/lessons/${currentLesson.id}/complete`}
                method="POST"
              >
                <button
                  type="submit"
                  className={
                    isCompleted
                      ? "w-full rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-extrabold text-green-700 transition hover:-translate-y-0.5 sm:w-auto"
                      : "w-full rounded-xl bg-[var(--accent-500)] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--accent-600)] sm:w-auto"
                  }
                >
                  {isCompleted ? "تم إكمال الدرس" : "تحديد الدرس كمكتمل"}
                </button>
              </form>
            </div>
          </section>

          <aside className="h-fit rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5 lg:sticky lg:top-6">
            <div className="mb-5 rounded-[1.5rem] bg-[var(--brand-950)] p-5 text-white">
              <p className="text-sm font-bold text-white/60">محتوى الكورس</p>

              <h3 className="mt-2 text-xl font-extrabold">الدروس والأقسام</h3>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/60">
                  <span>التقدم</span>
                  <span>{progress}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[var(--accent-500)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-sm text-[var(--text-muted)]">
              اختر أي درس للانتقال إليه مباشرة.
            </p>

            <div className="mt-5 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              {course.sections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"
                >
                  <h4 className="mb-3 font-extrabold text-[var(--brand-900)]">
                    {sectionIndex + 1}. {section.title}
                  </h4>

                  <div className="space-y-2">
                    {section.lessons.map((lesson) => {
                      const lessonCompleted =
                        lesson.progresses.length > 0 &&
                        lesson.progresses[0].isCompleted;

                      const isCurrentLesson = lesson.id === currentLesson.id;

                      return (
                        <Link
                          key={lesson.id}
                          href={`/learn/${course.slug}/${lesson.id}`}
                          className={
                            isCurrentLesson
                              ? "block rounded-xl bg-[var(--brand-700)] px-4 py-3 text-sm font-bold text-white shadow-sm"
                              : "block rounded-xl bg-white px-4 py-3 text-sm font-bold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:shadow-sm"
                          }
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="leading-6">{lesson.title}</span>

                            <span
                              className={
                                lessonCompleted
                                  ? "shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700"
                                  : isCurrentLesson
                                    ? "shrink-0 text-xs text-white/80"
                                    : "shrink-0 text-xs text-[var(--text-muted)]"
                              }
                            >
                              {lessonCompleted
                                ? "✓"
                                : `${lesson.durationMinutes} د`}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}