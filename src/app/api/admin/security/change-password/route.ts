import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

function getBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

function redirectToSecurity(request: NextRequest, params: Record<string, string>) {
  const url = new URL(`${getBaseUrl(request)}/admin/security`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  const user = await requireRole("ADMIN");

  const formData = await request.formData();

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return redirectToSecurity(request, {
      error: "missing-fields",
    });
  }

  if (newPassword.length < 8) {
    return redirectToSecurity(request, {
      error: "password-too-short",
    });
  }

  if (newPassword !== confirmPassword) {
    return redirectToSecurity(request, {
      error: "password-mismatch",
    });
  }

  if (currentPassword === newPassword) {
    return redirectToSecurity(request, {
      error: "same-password",
    });
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!dbUser || !dbUser.isActive) {
    return redirectToSecurity(request, {
      error: "missing-fields",
    });
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    dbUser.passwordHash
  );

  if (!isCurrentPasswordValid) {
    return redirectToSecurity(request, {
      error: "wrong-current-password",
    });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: dbUser.id,
    },
    data: {
      passwordHash,
    },
  });

  return redirectToSecurity(request, {
    message: "password-updated",
  });
}