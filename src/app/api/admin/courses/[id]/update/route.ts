import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type UpdateCourseRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function cleanSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toNumber(value: FormDataEntryValue | null) {
  const number = Number(value);

  if (Number.isNaN(number) || number < 0) {
    return 0;
  }

  return number;
}

export async function POST(
  request: NextRequest,
  { params }: UpdateCourseRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;
  const formData = await request.formData();

  const title = String(formData.get("title") || "").trim();
  const slug = cleanSlug(String(formData.get("slug") || ""));
  const subtitle = String(formData.get("subtitle") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();
  const level = String(formData.get("level") || "BEGINNER");
  const price = toNumber(formData.get("price"));
  const salePriceValue = String(formData.get("salePrice") || "").trim();
  const salePrice = salePriceValue ? toNumber(salePriceValue) : null;
  const promoVideoUrl = String(formData.get("promoVideoUrl") || "").trim();
  const isPublished = formData.get("isPublished") === "true";

  if (!title || !slug || !description) {
    return NextResponse.redirect(new URL(`/admin/courses/${id}/edit`, request.url));
  }

  const existingSlug = await prisma.course.findFirst({
    where: {
      slug,
      NOT: {
        id,
      },
    },
  });

  if (existingSlug) {
    return NextResponse.redirect(new URL(`/admin/courses/${id}/edit`, request.url));
  }

  await prisma.course.update({
    where: {
      id,
    },
    data: {
      title,
      slug,
      subtitle: subtitle || null,
      description,
      categoryId: categoryId || null,
      level: level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
      price,
      salePrice,
      promoVideoUrl: promoVideoUrl || null,
      status: isPublished ? "PUBLISHED" : "DRAFT",
      isPublished,
    },
  });

  return NextResponse.redirect(new URL("/admin/courses", request.url));
}