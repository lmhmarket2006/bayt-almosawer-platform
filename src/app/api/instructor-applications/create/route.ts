import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const formData = await request.formData();

    const name = getStringValue(formData, "name");
    const email = getStringValue(formData, "email");
    const phone = getStringValue(formData, "phone");
    const specialty = getStringValue(formData, "specialty");
    const bio = getStringValue(formData, "bio");
    const experience = getStringValue(formData, "experience");
    const portfolioUrl = getStringValue(formData, "portfolioUrl");
    const socialUrl = getStringValue(formData, "socialUrl");
    const proposedCourse = getStringValue(formData, "proposedCourse");

    const bankName = getStringValue(formData, "bankName");
    const bankAccountName = getStringValue(formData, "bankAccountName");
    const bankIban = getStringValue(formData, "bankIban");
    const payoutNotes = getStringValue(formData, "payoutNotes");

    if (!name || !email) {
      return NextResponse.json(
        {
          ok: false,
          message: "الاسم والبريد الإلكتروني مطلوبان.",
        },
        { status: 400 }
      );
    }

    const existingPendingApplication =
      await prisma.instructorApplication.findFirst({
        where: {
          email,
          status: "PENDING",
        },
        select: {
          id: true,
        },
      });

    if (existingPendingApplication) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "يوجد طلب انضمام قيد المراجعة بنفس البريد الإلكتروني بالفعل.",
        },
        { status: 409 }
      );
    }

    await prisma.instructorApplication.create({
      data: {
        applicantId: user?.id ?? null,
        name,
        email,
        phone: phone || null,
        specialty: specialty || null,
        bio: bio || null,
        experience: experience || null,
        portfolioUrl: portfolioUrl || null,
        socialUrl: socialUrl || null,
        proposedCourse: proposedCourse || null,
        bankName: bankName || null,
        bankAccountName: bankAccountName || null,
        bankIban: bankIban || null,
        payoutNotes: payoutNotes || null,
        status: "PENDING",
      },
    });

    return NextResponse.redirect(
      new URL("/instructor/apply?success=1", request.url)
    );
  } catch (error) {
    console.error("Create instructor application error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "حدث خطأ أثناء إرسال طلب الانضمام. حاول مرة أخرى.",
      },
      { status: 500 }
    );
  }
}