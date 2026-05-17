import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

function getBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(`${getBaseUrl(request)}${path}`);
}

function redirectWithError(request: NextRequest, path: string, message: string) {
  const url = new URL(`${getBaseUrl(request)}${path}`);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return redirectWithError(
      request,
      "/login",
      "من فضلك أدخل البريد الإلكتروني وكلمة المرور."
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user || !user.isActive) {
    return redirectWithError(request, "/login", "بيانات الدخول غير صحيحة.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return redirectWithError(request, "/login", "بيانات الدخول غير صحيحة.");
  }

  const token = await createSessionToken({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const redirectPath = user.role === "ADMIN" ? "/admin" : "/student";

  const response = redirectTo(request, redirectPath);

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}