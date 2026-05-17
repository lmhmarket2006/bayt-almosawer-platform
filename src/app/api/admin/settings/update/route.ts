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

function redirectToSettings(request: NextRequest, query?: string) {
  const url = new URL(`${getBaseUrl(request)}/admin/settings`);

  if (query) {
    const params = new URLSearchParams(query);
    params.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  await requireRole("ADMIN");

  const formData = await request.formData();

  const id = String(formData.get("id") || "").trim();

  const siteName = String(formData.get("siteName") || "").trim();

  if (!siteName) {
    return redirectToSettings(request, "error=missing-site-name");
  }

  const data = {
    siteName,
    supportEmail: String(formData.get("supportEmail") || "").trim() || null,
    supportPhone: String(formData.get("supportPhone") || "").trim() || null,
    whatsappNumber: String(formData.get("whatsappNumber") || "").trim() || null,
    bankName: String(formData.get("bankName") || "").trim() || null,
    bankAccountName:
      String(formData.get("bankAccountName") || "").trim() || null,
    bankAccountNumber:
      String(formData.get("bankAccountNumber") || "").trim() || null,
    bankIban: String(formData.get("bankIban") || "").trim() || null,
    orderInstructions:
      String(formData.get("orderInstructions") || "").trim() || null,
  };

  if (id) {
    const existingById = await prisma.platformSettings.findUnique({
      where: {
        id,
      },
    });

    if (existingById) {
      await prisma.platformSettings.update({
        where: {
          id,
        },
        data,
      });

      return redirectToSettings(request, "message=saved");
    }
  }

  const existingSettings = await prisma.platformSettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existingSettings) {
    await prisma.platformSettings.update({
      where: {
        id: existingSettings.id,
      },
      data,
    });
  } else {
    await prisma.platformSettings.create({
      data,
    });
  }

  return redirectToSettings(request, "message=saved");
}