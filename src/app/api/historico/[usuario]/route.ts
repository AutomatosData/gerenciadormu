import { NextRequest, NextResponse } from "next/server";
import { getHistoricoByUsuario } from "@/lib/sheets";

export async function GET(req: NextRequest, { params }: { params: Promise<{ usuario: string }> }) {
  try {
    const { usuario } = await params;
    const historico = await getHistoricoByUsuario(decodeURIComponent(usuario));
    return NextResponse.json({ historico });
  } catch (error) {
    console.error("Get historico error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
