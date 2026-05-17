import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type RejectOrderRouteProps = {
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
  { params }: RejectOrderRouteProps
) {
  await requireRole("ADMIN");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
  });

  if (!order) {
    return redirectToOrders(request, "not-found");
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

  return redirectToOrders(request, "rejected");
}