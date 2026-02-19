import { NextRequest, NextResponse } from "next/server";
import { getUsuariosByPai } from "@/lib/sheets";

export async function GET(req: NextRequest, { params }: { params: Promise<{ usuarioPai: string }> }) {
  try {
    const { usuarioPai } = await params;
    const usuarios = await getUsuariosByPai(decodeURIComponent(usuarioPai));
    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error("Get usuarios by pai error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
