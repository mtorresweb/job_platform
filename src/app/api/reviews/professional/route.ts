import { NextRequest, NextResponse } from "next/server";
import { GET as baseGet } from "../route";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const professionalId = searchParams.get("professionalId");

  if (!professionalId) {
    return NextResponse.json(
      { success: false, message: "professionalId es requerido" },
      { status: 400 },
    );
  }

  return baseGet(request);
}
