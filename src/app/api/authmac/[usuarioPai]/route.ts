import { NextRequest, NextResponse } from "next/server";
import { getAuthMacsByPai, addAuthMac } from "@/lib/sheets";

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

export async function POST(req: NextRequest, { params }: { params: Promise<{ usuarioPai: string }> }) {
  try {
    await params;
    const { idUsuario, mac, status } = await req.json();
    if (!idUsuario || !mac) {
      return NextResponse.json({ error: "ID do usuário e MAC são obrigatórios" }, { status: 400 });
    }
    const entry = await addAuthMac({ idUsuario, mac, status: status || "Não Autorizado" });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Add authmac error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
