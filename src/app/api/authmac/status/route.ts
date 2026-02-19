import { NextRequest, NextResponse } from "next/server";
import { updateAuthMacStatus } from "@/lib/sheets";

export async function PUT(req: NextRequest) {
  try {
    const { rowIndex, status } = await req.json();
    if (!rowIndex || !status) {
      return NextResponse.json({ error: "rowIndex e status são obrigatórios" }, { status: 400 });
    }
    if (status !== "Autorizado" && status !== "Não Autorizado") {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }
    await updateAuthMacStatus(rowIndex, status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update authmac status error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
