import { NextRequest, NextResponse } from "next/server";
import { GET as baseGet } from "../route";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");

  if (!serviceId) {
    return NextResponse.json(
      { success: false, message: "serviceId es requerido" },
      { status: 400 },
    );
  }

  return baseGet(request);
}
