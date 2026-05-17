import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type RevokeCourseRouteProps = {
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
  { params }: RevokeCourseRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;
  const formData = await request.formData();
  const courseId = String(formData.get("courseId") || "").trim();

  if (!courseId) {
    return redirectToUser(request, id, "missing-course");
  }

  await prisma.enrollment.updateMany({
    where: {
      userId: id,
      courseId,
    },
    data: {
      isActive: false,
    },
  });

  return redirectToUser(request, id, "course-revoked");
}