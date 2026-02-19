import { NextRequest, NextResponse } from "next/server";
import { getUsuarioPai, getUsuariosByPai } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const { usuarioPai } = await req.json();

    if (!usuarioPai) {
      return NextResponse.json({ error: "Usuário Pai é obrigatório" }, { status: 400 });
    }

    const user = await getUsuarioPai(usuarioPai);
    if (!user) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    const usuarios = await getUsuariosByPai(usuarioPai);

    return NextResponse.json({ user, usuarios });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
