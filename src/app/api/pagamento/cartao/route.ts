import { NextRequest, NextResponse } from "next/server";
import { paymentClient, getPlanoById } from "@/lib/mercadopago";
import { getUsuarioById, addPagamento, updateUsuarioPlano } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, planoId, userId, installments, paymentMethodId, issuerId, email } = body;

    if (!token || !planoId || !userId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const plano = getPlanoById(planoId);
    if (!plano) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }

    const usuario = await getUsuarioById(userId);
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const payment = await paymentClient.create({
      body: {
        transaction_amount: plano.preco,
        token,
        description: `Gerenciador MU - Plano ${plano.nome}`,
        installments: installments || 1,
        payment_method_id: paymentMethodId,
        issuer_id: issuerId,
        payer: {
          email: email || usuario.email,
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

    if (payment.status === "approved") {
      const expiraDate = new Date();
      expiraDate.setDate(expiraDate.getDate() + plano.dias);
      const expiraStr = expiraDate.toLocaleDateString("pt-BR");
      const dataPagamento = new Date().toLocaleDateString("pt-BR");
      const valor = `R$ ${plano.preco.toFixed(2).replace(".", ",")}`;

      await addPagamento({
        idUsuario: usuario.id,
        idPagamento: String(payment.id),
        dataPagamento,
        valor,
        metodo: "Cartão de Crédito",
      });

      await updateUsuarioPlano(usuario.id, plano.nome, expiraStr);
    }

    return NextResponse.json({
      status: payment.status,
      statusDetail: payment.status_detail,
      id: payment.id,
    });
  } catch (error) {
    console.error("Erro ao processar pagamento com cartão:", error);
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 });
  }
}
