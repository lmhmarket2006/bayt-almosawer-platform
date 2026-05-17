import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

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

export async function POST(request: NextRequest) {
  const user = await requireRole("ADMIN");
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
    return NextResponse.redirect(new URL("/admin/courses/new", request.url));
  }

  const existing = await prisma.course.findUnique({
    where: {
      slug,
    },
  });

  if (existing) {
    return NextResponse.redirect(new URL("/admin/courses/new", request.url));
  }

  await prisma.course.create({
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
      courseType: "RECORDED",
      language: "ar",
      status: isPublished ? "PUBLISHED" : "DRAFT",
      isPublished,
      createdById: user.id,
    },
  });

  return NextResponse.redirect(new URL("/admin/courses", request.url));
}