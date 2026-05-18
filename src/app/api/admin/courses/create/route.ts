import { CourseLevel, CourseStatus, CourseType, Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { redirectToAdminCourses, redirectToAdminCourseNew } from "@/lib/url";

function getCourseType(value: string): CourseType {
  if (value === "LIVE") return CourseType.LIVE;
  if (value === "IN_PERSON") return CourseType.IN_PERSON;

  return CourseType.RECORDED;
}

function getCourseLevel(value: string): CourseLevel {
  if (value === "INTERMEDIATE") return CourseLevel.INTERMEDIATE;
  if (value === "ADVANCED") return CourseLevel.ADVANCED;

  return CourseLevel.BEGINNER;
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseMoney(value: FormDataEntryValue | null) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return 0;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

function getNullableText(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();

  return text || null;
}

// لو تم فتح الرابط مباشرة من المتصفح
export async function GET(request: NextRequest) {
  await requireRole("ADMIN");

  return redirectToAdminCourseNew(request, "use-create-form");
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole("ADMIN");

    const formData = await request.formData();

    const title = String(formData.get("title") || "").trim();
    const slugInput = String(formData.get("slug") || "").trim();
    const subtitle = getNullableText(formData.get("subtitle"));
    const description = String(formData.get("description") || "").trim();

    const thumbnailUrl = getNullableText(formData.get("thumbnailUrl"));
    const promoVideoUrl = getNullableText(formData.get("promoVideoUrl"));

    const courseType = getCourseType(String(formData.get("courseType") || ""));
    const level = getCourseLevel(String(formData.get("level") || ""));
    const language = String(formData.get("language") || "ar").trim() || "ar";

    const price = parseMoney(formData.get("price"));
    const salePrice = formData.get("salePrice")
      ? parseMoney(formData.get("salePrice"))
      : null;

    const isPublished = formData.get("isPublished") === "true";

    if (!title || !description) {
      return redirectToAdminCourseNew(request, "missing-required-fields");
    }

    if (price === null || salePrice === null) {
      return redirectToAdminCourseNew(request, "invalid-price");
    }

    if (salePrice !== null && salePrice > price) {
      return redirectToAdminCourseNew(request, "sale-price-greater-than-price");
    }

    const slug = createSlug(slugInput || title);

    if (!slug) {
      return redirectToAdminCourseNew(request, "invalid-slug");
    }

    const existingCourse = await prisma.course.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existingCourse) {
      return redirectToAdminCourseNew(request, "slug-exists");
    }

    await prisma.course.create({
      data: {
        title,
        slug,
        subtitle,
        description,
        thumbnailUrl,
        promoVideoUrl,
        courseType,
        level,
        language,
        price,
        salePrice,
        isPublished,
        status: isPublished ? CourseStatus.PUBLISHED : CourseStatus.DRAFT,
        createdById: admin.id,
      },
    });

    return redirectToAdminCourses(request, "course-created");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return redirectToAdminCourseNew(request, "slug-exists");
    }

    console.error("Create course error:", error);

    return redirectToAdminCourseNew(request, "create-course-failed");
  }
}