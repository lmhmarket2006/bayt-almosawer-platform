import { CourseLevel, CourseStatus, CourseType, Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { redirectToAdminCourses, redirectToAdminCourseEdit } from "@/lib/url";

type UpdateCourseRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

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

function normalizeNumber(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/٫/g, ".")
    .replace(/٬/g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .replace(/[^\d.]/g, "");
}

function parseRequiredMoney(value: FormDataEntryValue | null) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return 0;
  }

  const normalizedValue = normalizeNumber(rawValue);

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.split(".").length > 2) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

function parseOptionalMoney(value: FormDataEntryValue | null) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return null;
  }

  const normalizedValue = normalizeNumber(rawValue);

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.split(".").length > 2) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

function getNullableText(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();

  return text || null;
}

export async function GET(
  request: NextRequest,
  { params }: UpdateCourseRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;

  return redirectToAdminCourseEdit(request, id, "use-edit-form");
}

export async function POST(
  request: NextRequest,
  { params }: UpdateCourseRouteProps
) {
  const { id } = await params;

  try {
    await requireRole("ADMIN");

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

    const price = parseRequiredMoney(formData.get("price"));
    const salePrice = parseOptionalMoney(formData.get("salePrice"));

    const isPublished = formData.get("isPublished") === "true";

    const course = await prisma.course.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return redirectToAdminCourses(request, "course-not-found");
    }

    if (!title || !description) {
      return redirectToAdminCourseEdit(request, id, "missing-required-fields");
    }

    if (price === null) {
      return redirectToAdminCourseEdit(request, id, "invalid-price");
    }

    if (salePrice !== null && salePrice > price) {
      return redirectToAdminCourseEdit(
        request,
        id,
        "sale-price-greater-than-price"
      );
    }

    const slug = createSlug(slugInput || title);

    if (!slug) {
      return redirectToAdminCourseEdit(request, id, "invalid-slug");
    }

    const existingCourse = await prisma.course.findFirst({
      where: {
        slug,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingCourse) {
      return redirectToAdminCourseEdit(request, id, "slug-exists");
    }

    await prisma.course.update({
      where: {
        id,
      },
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
      },
    });

    return redirectToAdminCourses(request, "course-updated");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return redirectToAdminCourseEdit(request, id, "slug-exists");
    }

    console.error("Update course error:", error);

    return redirectToAdminCourseEdit(request, id, "update-course-failed");
  }
}