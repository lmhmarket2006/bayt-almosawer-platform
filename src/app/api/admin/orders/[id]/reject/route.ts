import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type RejectOrderRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: RejectOrderRouteProps) {
  await requireRole("ADMIN");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
  });

  if (!order) {
    return NextResponse.redirect(new URL("/admin/orders", request.url));
  }

  if (order.paymentStatus !== "PENDING") {
    return NextResponse.redirect(new URL("/admin/orders", request.url));
  }

  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      paymentStatus: "REJECTED",
      orderStatus: "CANCELLED",
    },
  });

  return NextResponse.redirect(new URL("/admin/orders?message=rejected", request.url));
}