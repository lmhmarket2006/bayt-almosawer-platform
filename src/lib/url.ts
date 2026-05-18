import { NextRequest, NextResponse } from "next/server";

export function getBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

export function createAppUrl(
  request: NextRequest,
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>
) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getBaseUrl(request)}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url;
}

export function redirectTo(
  request: NextRequest,
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>
) {
  return NextResponse.redirect(createAppUrl(request, path, params));
}

export function redirectWithMessage(
  request: NextRequest,
  path: string,
  message: string
) {
  return redirectTo(request, path, {
    message,
  });
}

export function redirectWithError(
  request: NextRequest,
  path: string,
  error: string
) {
  return redirectTo(request, path, {
    error,
  });
}

export function redirectToAdminCourses(
  request: NextRequest,
  message = "updated"
) {
  return redirectWithMessage(request, "/admin/courses", message);
}

export function redirectToAdminCourseNew(
  request: NextRequest,
  error = "error"
) {
  return redirectWithError(request, "/admin/courses/new", error);
}

export function redirectToAdminCourseEdit(
  request: NextRequest,
  courseId: string,
  error = "error"
) {
  return redirectWithError(request, `/admin/courses/${courseId}/edit`, error);
}

export function redirectToAdminCourseCurriculum(
  request: NextRequest,
  courseId: string,
  message = "updated"
) {
  return redirectWithMessage(
    request,
    `/admin/courses/${courseId}/curriculum`,
    message
  );
}

export function redirectToAdminLessonEdit(
  request: NextRequest,
  lessonId: string,
  message = "updated"
) {
  return redirectWithMessage(request, `/admin/lessons/${lessonId}/edit`, message);
}

export function redirectToAdminOrders(
  request: NextRequest,
  message = "updated"
) {
  return redirectWithMessage(request, "/admin/orders", message);
}

export function redirectToAdminUser(
  request: NextRequest,
  userId: string,
  message = "updated"
) {
  return redirectWithMessage(request, `/admin/users/${userId}`, message);
}

export function redirectToAdminUsers(
  request: NextRequest,
  message = "updated"
) {
  return redirectWithMessage(request, "/admin/users", message);
}