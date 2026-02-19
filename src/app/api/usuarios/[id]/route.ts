import { NextRequest, NextResponse } from "next/server";
import { updateUsuario, getUsuarioById } from "@/lib/sheets";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUsuarioById(id);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();

    const updated = await updateUsuario(id, {
      nome: data.nome,
      usuario: data.usuario,
      email: data.email,
      whatsapp: data.whatsapp,
    });

    if (!updated) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
