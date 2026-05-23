import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RejectInstructorApplicationRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: RejectInstructorApplicationRouteProps
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
    const formData = await request.formData();
    const reviewNoteValue = formData.get("reviewNote");

    const reviewNote =
      typeof reviewNoteValue === "string" && reviewNoteValue.trim()
        ? reviewNoteValue.trim()
        : "تم رفض طلب الانضمام كمدرب.";

    const application = await prisma.instructorApplication.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
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

    await prisma.instructorApplication.update({
      where: {
        id,
      },
      data: {
        status: "REJECTED",
        reviewedById: user.id,
        reviewedAt: new Date(),
        reviewNote,
      },
    });

    return NextResponse.redirect(
      new URL("/admin/instructor-applications?success=rejected", request.url)
    );
  } catch (error) {
    console.error("Reject instructor application error:", error);

    return NextResponse.redirect(
      new URL("/admin/instructor-applications?error=server", request.url)
    );
  }
}