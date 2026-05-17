import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type ConfirmOrderRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: ConfirmOrderRouteProps) {
  await requireRole("ADMIN");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    return NextResponse.redirect(new URL("/admin/orders", request.url));
  }

  if (order.paymentStatus !== "PENDING") {
    return NextResponse.redirect(new URL("/admin/orders", request.url));
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
      },
    });

    for (const item of order.items) {
      await tx.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: order.userId,
            courseId: item.courseId,
          },
        },
        update: {
          isActive: true,
          accessType: "PURCHASE",
          expiresAt: null,
        },
        create: {
          userId: order.userId,
          courseId: item.courseId,
          accessType: "PURCHASE",
          isActive: true,
          expiresAt: null,
        },
      });
    }
  });

  return NextResponse.redirect(new URL("/admin/orders?message=confirmed", request.url));
}