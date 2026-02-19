import { NextRequest, NextResponse } from "next/server";
import { paymentClient, getPlanoById } from "@/lib/mercadopago";
import { getUsuarioById, addPagamento } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const { planoId, userId } = await req.json();

    if (!planoId || !userId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const plano = getPlanoById(planoId);
    if (!plano) return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });

    const usuario = await getUsuarioById(userId);
    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const payment = await paymentClient.create({
      body: {
        transaction_amount: plano.preco,
        description: `Gerenciador MU - Plano ${plano.nome}`,
        payment_method_id: "pix",
        payer: {
          email: usuario.email,
          first_name: usuario.nome,
        },
        external_reference: `${usuario.id}_${plano.id}_${Date.now()}`,
        metadata: {
          user_id: usuario.id,
          user_name: usuario.usuario,
          plano_id: plano.id,
          plano_nome: plano.nome,
          plano_dias: plano.dias,
        },
      },
    });

    const txData = payment.point_of_interaction?.transaction_data;

    await addPagamento({
      idUsuario: usuario.id,
      idPagamento: String(payment.id),
      dataPagamento: new Date().toLocaleDateString("pt-BR"),
      valor: `R$ ${plano.preco.toFixed(2).replace(".", ",")}`,
      metodo: "PIX",
      status: "Pendente",
    });

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      qrCode: txData?.qr_code || null,
      qrCodeBase64: txData?.qr_code_base64 || null,
      ticketUrl: txData?.ticket_url || null,
    });
  } catch (error) {
    console.error("Erro ao criar pagamento PIX:", error);
    return NextResponse.json({ error: "Erro ao criar pagamento PIX" }, { status: 500 });
  }
}
