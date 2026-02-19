import { NextRequest, NextResponse } from "next/server";
import { getPagamentosByUsuarioId } from "@/lib/sheets";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pagamentos = await getPagamentosByUsuarioId(id);
    return NextResponse.json({ pagamentos });
  } catch (error) {
    console.error("Get pagamentos error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
