import { NextRequest, NextResponse } from "next/server";
import { getAuthMacsByPai } from "@/lib/sheets";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ usuarioPai: string }> }) {
  try {
    const { usuarioPai } = await params;
    const macs = await getAuthMacsByPai(decodeURIComponent(usuarioPai));
    return NextResponse.json({ macs });
  } catch (error) {
    console.error("Get authmac error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
