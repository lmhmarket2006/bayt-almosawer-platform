import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

function redirectWithError(request: NextRequest, path: string, message: string) {
  const url = new URL(path, request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!name || !email || !password || !confirmPassword) {
    return redirectWithError(
      request,
      "/register",
      "من فضلك أكمل جميع الحقول المطلوبة."
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
      phone: phone || null,
      passwordHash,
      role: "STUDENT",
    },
  });

  const token = await createSessionToken({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.redirect(new URL("/student", request.url));

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}