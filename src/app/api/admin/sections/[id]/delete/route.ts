import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { redirectTo, redirectToAdminCourseCurriculum } from "@/lib/url";

type DeleteSectionRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest) {
  await requireRole("ADMIN");

  return redirectTo(request, "/admin/courses", {
    message: "use-delete-button",
  });
}

export async function POST(
  request: NextRequest,
  { params }: DeleteSectionRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;

  const section = await prisma.courseSection.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      courseId: true,
    },
  });

  if (!section) {
    return redirectTo(request, "/admin/courses", {
      message: "section-not-found",
    });
  }

  await prisma.courseSection.delete({
    where: {
      id: section.id,
    },
  });

  return redirectToAdminCourseCurriculum(
    request,
    section.courseId,
    "section-deleted"
  );
}