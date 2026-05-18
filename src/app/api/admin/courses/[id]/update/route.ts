import { CourseLevel, CourseStatus, CourseType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type UpdateCourseRouteProps = {
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

function redirectToCourses(request: NextRequest, message: string) {
  const url = new URL(`${getBaseUrl(request)}/admin/courses`);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

function redirectToCourseEdit(
  request: NextRequest,
  courseId: string,
  message: string
) {
  const url = new URL(`${getBaseUrl(request)}/admin/courses/${courseId}/edit`);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

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

export async function POST(
  request: NextRequest,
  { params }: UpdateCourseRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;
  const formData = await request.formData();

  const title = String(formData.get("title") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim() || null;
  const description = String(formData.get("description") || "").trim();

  const thumbnailUrl =
    String(formData.get("thumbnailUrl") || "").trim() || null;
  const promoVideoUrl =
    String(formData.get("promoVideoUrl") || "").trim() || null;

  const courseType = getCourseType(String(formData.get("courseType") || ""));
  const level = getCourseLevel(String(formData.get("level") || ""));
  const language = String(formData.get("language") || "ar").trim() || "ar";

  const price = Number(formData.get("price") || 0);
  const salePriceValue = String(formData.get("salePrice") || "").trim();

  const isPublished = formData.get("isPublished") === "true";

  const course = await prisma.course.findUnique({
    where: {
      id,
    },
  });

  if (!course) {
    return redirectToCourses(request, "course-not-found");
  }

  if (!title || !description) {
    return redirectToCourseEdit(request, id, "missing-required-fields");
  }

  const slug = createSlug(slugInput || title);

  if (!slug) {
    return redirectToCourseEdit(request, id, "invalid-slug");
  }

  const existingCourse = await prisma.course.findFirst({
    where: {
      slug,
      NOT: {
        id,
      },
    },
  });

  if (existingCourse) {
    return redirectToCourseEdit(request, id, "slug-exists");
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
      price: Number.isFinite(price) ? price : 0,
      salePrice: salePriceValue ? Number(salePriceValue) : null,
      isPublished,
      status: isPublished ? CourseStatus.PUBLISHED : CourseStatus.DRAFT,
    },
  });

  return redirectToCourses(request, "course-updated");
}