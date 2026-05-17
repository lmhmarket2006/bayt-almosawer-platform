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

export async function POST(request: NextRequest) {
  await requireRole("ADMIN");

  const formData = await request.formData();

  const id = String(formData.get("id") || "").trim();

  const data = {
    siteName: String(formData.get("siteName") || "").trim(),
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

  if (!data.siteName) {
    return NextResponse.redirect(`${getBaseUrl(request)}/admin/settings`);
  }

  if (id) {
    await prisma.platformSettings.update({
      where: {
        id,
      },
      data,
    });
  } else {
    await prisma.platformSettings.create({
      data,
    });
  }

  return NextResponse.redirect(`${getBaseUrl(request)}/admin/settings`);
}