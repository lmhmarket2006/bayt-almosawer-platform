import { prisma } from "@/lib/prisma";

const fallbackPlatformSettings = {
  id: "fallback",
  siteName: "منصة بيت المصور التعليمية",
  supportEmail: "",
  supportPhone: "",
  whatsappNumber: "",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  bankIban: "",
  orderInstructions:
    "بعد إنشاء طلب الشراء، يرجى تحويل قيمة الكورس على الحساب البنكي ثم التواصل مع الإدارة لإرسال إيصال التحويل. بعد التأكد من الدفع سيتم فتح الكورس داخل حساب الطالب.",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function getPlatformSettings() {
  try {
    const settings = await prisma.platformSettings.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (settings) {
      return settings;
    }

    return await prisma.platformSettings.create({
      data: {
        siteName: fallbackPlatformSettings.siteName,
        supportEmail: fallbackPlatformSettings.supportEmail,
        supportPhone: fallbackPlatformSettings.supportPhone,
        whatsappNumber: fallbackPlatformSettings.whatsappNumber,
        bankName: fallbackPlatformSettings.bankName,
        bankAccountName: fallbackPlatformSettings.bankAccountName,
        bankAccountNumber: fallbackPlatformSettings.bankAccountNumber,
        bankIban: fallbackPlatformSettings.bankIban,
        orderInstructions: fallbackPlatformSettings.orderInstructions,
      },
    });
  } catch {
    return fallbackPlatformSettings;
  }
}

export async function getPlatformSiteName() {
  const settings = await getPlatformSettings();

  return settings.siteName || fallbackPlatformSettings.siteName;
}