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

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!name || !email || !password || !confirmPassword) {
    return redirectWithError(
      request,
      "/register",
      "من فضلك أكمل جميع الحقول."
    );
  }

  if (password.length < 8) {
    return redirectWithError(
      request,
      "/register",
      "كلمة المرور يجب ألا تقل عن 8 أحرف."
    );
  }

  if (password !== confirmPassword) {
    return redirectWithError(
      request,
      "/register",
      "كلمة المرور وتأكيدها غير متطابقين."
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return redirectWithError(
      request,
      "/register",
      "هذا البريد الإلكتروني مسجل بالفعل."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "STUDENT",
      isActive: true,
    },
  });

  const token = await createSessionToken({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const response = redirectTo(request, "/student");

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}