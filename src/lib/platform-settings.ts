import { prisma } from "@/lib/prisma";

export async function getPlatformSettings() {
  const settings = await prisma.platformSettings.findFirst();

  if (settings) {
    return settings;
  }

  return prisma.platformSettings.create({
    data: {
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
    },
  });
}

export async function getPlatformSiteName() {
  const settings = await getPlatformSettings();

  return settings.siteName || "منصة بيت المصور التعليمية";
}