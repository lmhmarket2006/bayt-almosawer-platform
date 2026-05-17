import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type DeleteSectionRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

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
      courseId: true,
    },
  });

  if (!section) {
    return NextResponse.redirect(new URL("/admin/courses", request.url));
  }

  await prisma.courseSection.delete({
    where: {
      id,
    },
  });

  return NextResponse.redirect(
    new URL(`/admin/courses/${section.courseId}/curriculum`, request.url)
  );
}