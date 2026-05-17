import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type ConfirmOrderRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function getBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

function redirectToOrders(request: NextRequest, message: string) {
  const url = new URL(`${getBaseUrl(request)}/admin/orders`);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

export async function POST(
  request: NextRequest,
  { params }: ConfirmOrderRouteProps
) {
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
    return redirectToOrders(request, "not-found");
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
        },
        create: {
          userId: order.userId,
          courseId: item.courseId,
          isActive: true,
        },
      });
    }
  });

  return redirectToOrders(request, "confirmed");
}