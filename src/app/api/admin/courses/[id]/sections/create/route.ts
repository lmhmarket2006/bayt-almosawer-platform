import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type CreateSectionRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function toNumber(value: FormDataEntryValue | null) {
  const number = Number(value);

  if (Number.isNaN(number) || number < 0) {
    return 0;
  }

  return number;
}

export async function POST(
  request: NextRequest,
  { params }: CreateSectionRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;
  const formData = await request.formData();

  const title = String(formData.get("title") || "").trim();
  const sortOrder = toNumber(formData.get("sortOrder"));

  if (!title) {
    return NextResponse.redirect(
      new URL(`/admin/courses/${id}/curriculum`, request.url)
    );
  }

  const course = await prisma.course.findUnique({
    where: {
      id,
    },
  });

  if (!course) {
    return NextResponse.redirect(new URL("/admin/courses", request.url));
  }

  await prisma.courseSection.create({
    data: {
      courseId: course.id,
      title,
      sortOrder,
    },
  });

  return NextResponse.redirect(
    new URL(`/admin/courses/${course.id}/curriculum`, request.url)
  );
}