import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type GrantCourseRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function getBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

function redirectToUser(request: NextRequest, userId: string, message: string) {
  const url = new URL(`${getBaseUrl(request)}/admin/users/${userId}`);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

export async function POST(
  request: NextRequest,
  { params }: GrantCourseRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;
  const formData = await request.formData();
  const courseId = String(formData.get("courseId") || "").trim();

  if (!courseId) {
    return redirectToUser(request, id, "missing-course");
  }

  const [user, course] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id,
      },
    }),
    prisma.course.findUnique({
      where: {
        id: courseId,
      },
    }),
  ]);

  if (!user || user.role !== "STUDENT") {
    return redirectToUser(request, id, "invalid-user");
  }

  if (!course || !course.isPublished || course.status !== "PUBLISHED") {
    return redirectToUser(request, id, "invalid-course");
  }

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
    update: {
      isActive: true,
    },
    create: {
      userId: user.id,
      courseId: course.id,
      isActive: true,
    },
  });

  return redirectToUser(request, id, "course-granted");
}