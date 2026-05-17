import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type ToggleUserRouteProps = {
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

function redirectToUser(request: NextRequest, userId: string, message: string) {
  const url = new URL(`${getBaseUrl(request)}/admin/users/${userId}`);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

export async function POST(
  request: NextRequest,
  { params }: ToggleUserRouteProps
) {
  const admin = await requireRole("ADMIN");
  const { id } = await params;

  if (admin.id === id) {
    return redirectToUser(request, id, "cannot-toggle-self");
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return NextResponse.redirect(`${getBaseUrl(request)}/admin/users`);
  }

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      isActive: !user.isActive,
    },
  });

  return redirectToUser(
    request,
    id,
    user.isActive ? "user-disabled" : "user-enabled"
  );
}