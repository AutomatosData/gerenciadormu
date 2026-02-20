import { NextRequest, NextResponse } from "next/server";
import { addSuporte } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const { usuarioPai, assunto, descricao, contato } = await req.json();

    if (!assunto || !descricao) {
      return NextResponse.json({ error: "Assunto e descrição são obrigatórios" }, { status: 400 });
    }

    await addSuporte({ usuarioPai: usuarioPai || "", assunto, descricao, contato });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao registrar suporte:", error);
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 });
  }
}
