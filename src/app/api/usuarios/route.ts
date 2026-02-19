import { NextRequest, NextResponse } from "next/server";
import { addUsuario, getUsuarioByUsuario, getUsuarioPai } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.usuarioPai) {
      return NextResponse.json({ error: "Usuário Pai é obrigatório" }, { status: 400 });
    }

    // If creating a parent account (cadastro page)
    if (data.isParent) {
      if (!data.nome || !data.email) {
        return NextResponse.json({ error: "Nome e E-mail são obrigatórios" }, { status: 400 });
      }

      const existingPai = await getUsuarioPai(data.usuarioPai);
      if (existingPai) {
        return NextResponse.json({ error: "Este nome de conta já está em uso" }, { status: 409 });
      }

      const user = await addUsuario({
        nome: data.nome,
        usuario: "",
        email: data.email,
        whatsapp: data.whatsapp || "",
        usuarioPai: data.usuarioPai,
      });

      return NextResponse.json({ user }, { status: 201 });
    }

    // Creating a child usuario under a parent
    if (!data.usuario) {
      return NextResponse.json({ error: "Nome de Usuário é obrigatório" }, { status: 400 });
    }

    const existingUser = await getUsuarioByUsuario(data.usuario);
    if (existingUser) {
      return NextResponse.json({ error: "Este nome de usuário já está em uso" }, { status: 409 });
    }

    const user = await addUsuario({
      nome: data.nome || "",
      usuario: data.usuario,
      email: data.email || "",
      whatsapp: data.whatsapp || "",
      usuarioPai: data.usuarioPai,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
