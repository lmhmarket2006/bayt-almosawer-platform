import { NextRequest, NextResponse } from "next/server";

type UrlParams = Record<string, string | number | boolean | null | undefined>;

export function getBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    return `${forwardedProto || "https"}://${forwardedHost}`;
  }

  const host = request.headers.get("host");

  if (host) {
    const proto =
      host.includes("localhost") || host.includes("127.0.0.1")
        ? "http"
        : "https";

    return `${proto}://${host}`;
  }

  return request.nextUrl.origin;
}

export function createAppUrl(
  request: NextRequest,
  path: string,
  params?: UrlParams
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
  params?: UrlParams
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

/**
 * Auth redirects
 */
export function redirectToLogin(
  request: NextRequest,
  error?: string
) {
  return error
    ? redirectWithError(request, "/login", error)
    : redirectTo(request, "/login");
}

export function redirectToRegister(
  request: NextRequest,
  error?: string
) {
  return error
    ? redirectWithError(request, "/register", error)
    : redirectTo(request, "/register");
}

export function redirectToStudent(request: NextRequest) {
  return redirectTo(request, "/student");
}

export function redirectToStudentOrders(
  request: NextRequest,
  message = "updated"
) {
  return redirectWithMessage(request, "/student/orders", message);
}

export function redirectToStudentMyCourses(request: NextRequest) {
  return redirectTo(request, "/student/my-courses");
}

/**
 * Admin course redirects
 */
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

/**
 * Admin lesson redirects
 */
export function redirectToAdminLessonEdit(
  request: NextRequest,
  lessonId: string,
  message = "updated"
) {
  return redirectWithMessage(
    request,
    `/admin/lessons/${lessonId}/edit`,
    message
  );
}

/**
 * Admin order redirects
 */
export function redirectToAdminOrders(
  request: NextRequest,
  message = "updated"
) {
  return redirectWithMessage(request, "/admin/orders", message);
}

/**
 * Admin user redirects
 */
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

/**
 * Admin settings/security redirects
 */
export function redirectToAdminSettings(
  request: NextRequest,
  message = "saved"
) {
  return redirectWithMessage(request, "/admin/settings", message);
}

export function redirectToAdminSettingsError(
  request: NextRequest,
  error = "error"
) {
  return redirectWithError(request, "/admin/settings", error);
}

export function redirectToAdminSecurity(
  request: NextRequest,
  params?: UrlParams
) {
  return redirectTo(request, "/admin/security", params);
}