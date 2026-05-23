import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type ApproveInstructorApplicationRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: ApproveInstructorApplicationRouteProps
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const { id } = await params;

    const application = await prisma.instructorApplication.findUnique({
      where: {
        id,
      },
      include: {
        applicant: true,
      },
    });

    if (!application) {
      return NextResponse.redirect(
        new URL("/admin/instructor-applications?error=not_found", request.url)
      );
    }

    if (application.status !== "PENDING") {
      return NextResponse.redirect(
        new URL(
          "/admin/instructor-applications?error=already_reviewed",
          request.url
        )
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.instructorApplication.update({
        where: {
          id: application.id,
        },
        data: {
          status: "APPROVED",
          reviewedById: user.id,
          reviewedAt: new Date(),
          reviewNote: "تم قبول طلب الانضمام كمدرب.",
        },
      });

      if (application.applicantId) {
        await tx.user.update({
          where: {
            id: application.applicantId,
          },
          data: {
            role: "INSTRUCTOR",
          },
        });

        await tx.instructorProfile.upsert({
          where: {
            userId: application.applicantId,
          },
          update: {
            displayName: application.name,
            headline: application.specialty,
            bio: application.bio,
            specialty: application.specialty,
            portfolioUrl: application.portfolioUrl,
            socialUrl: application.socialUrl,
            bankName: application.bankName,
            bankAccountName: application.bankAccountName,
            bankIban: application.bankIban,
            payoutNotes: application.payoutNotes,
            isApproved: true,
            approvedAt: new Date(),
          },
          create: {
            userId: application.applicantId,
            displayName: application.name,
            headline: application.specialty,
            bio: application.bio,
            specialty: application.specialty,
            portfolioUrl: application.portfolioUrl,
            socialUrl: application.socialUrl,
            bankName: application.bankName,
            bankAccountName: application.bankAccountName,
            bankIban: application.bankIban,
            payoutNotes: application.payoutNotes,
            platformCommissionRate: 30,
            instructorCommissionRate: 70,
            isApproved: true,
            approvedAt: new Date(),
          },
        });
      }
    });

    return NextResponse.redirect(
      new URL("/admin/instructor-applications?success=approved", request.url)
    );
  } catch (error) {
    console.error("Approve instructor application error:", error);

    return NextResponse.redirect(
      new URL("/admin/instructor-applications?error=server", request.url)
    );
  }
}