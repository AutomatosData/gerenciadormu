import { NextRequest, NextResponse } from "next/server";
import { preferenceClient, getPlanoById } from "@/lib/mercadopago";
import { getUsuarioById } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const { planoId, userId } = await req.json();

    if (!planoId || !userId) {
      return NextResponse.json({ error: "Plano e usuário são obrigatórios" }, { status: 400 });
    }

    const plano = getPlanoById(planoId);
    if (!plano) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }

    const usuario = await getUsuarioById(userId);
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: plano.id,
            title: `Gerenciador MU - Plano ${plano.nome}`,
            description: plano.descricao,
            quantity: 1,
            unit_price: plano.preco,
            currency_id: "BRL",
          },
        ],
        payer: {
          name: usuario.nome,
          email: usuario.email,
        },
        metadata: {
          user_id: usuario.id,
          user_name: usuario.usuario,
          plano_id: plano.id,
          plano_nome: plano.nome,
          plano_dias: plano.dias,
        },
        back_urls: {
          success: `${baseUrl}/pagamento/resultado?status=success`,
          failure: `${baseUrl}/pagamento/resultado?status=failure`,
          pending: `${baseUrl}/pagamento/resultado?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/pagamento/webhook`,
        external_reference: `${usuario.id}_${plano.id}_${Date.now()}`,
      },
    });

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    return NextResponse.json({ error: "Erro ao criar pagamento" }, { status: 500 });
  }
}
