import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const adminEmail = "admin@taswerak.com";
const adminPassword = "Admin@123456";
const adminName = "مدير منصة تصويرك";

async function ensureAdminUser() {
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      name: adminName,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    select: {
      id: true,
      email: true,
    },
  });

  console.log(`Admin ready: ${admin.email}`);
}

async function ensurePlatformSettings() {
  const existingSettings = await prisma.platformSettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
  });

  if (existingSettings) {
    await prisma.platformSettings.update({
      where: {
        id: existingSettings.id,
      },
      data: {
        siteName: "منصة تصويرك",
        supportEmail: "support@taswerak.com",
        supportPhone: "",
        whatsappNumber: "",
        orderInstructions:
          "بعد إرسال طلب شراء الكورس، يرجى تحويل المبلغ وإرسال إثبات الدفع للإدارة ليتم فتح الكورس داخل حسابك.",
      },
    });

    console.log("Platform settings updated.");
    return;
  }

  await prisma.platformSettings.create({
    data: {
      siteName: "منصة تصويرك",
      supportEmail: "support@taswerak.com",
      supportPhone: "",
      whatsappNumber: "",
      orderInstructions:
        "بعد إرسال طلب شراء الكورس، يرجى تحويل المبلغ وإرسال إثبات الدفع للإدارة ليتم فتح الكورس داخل حسابك.",
    },
  });

  console.log("Platform settings created.");
}

async function main() {
  console.log("Seeding production base data...");

  await ensureAdminUser();
  await ensurePlatformSettings();

  console.log("Production base seed completed successfully.");
  console.log("Admin login:");
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error("Production base seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });