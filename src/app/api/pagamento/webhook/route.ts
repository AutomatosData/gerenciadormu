import { NextRequest, NextResponse } from "next/server";
import { paymentClient } from "@/lib/mercadopago";
import { addPagamento, updatePagamentoStatus, updateUsuarioPlano } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Webhook recebido:", JSON.stringify(body));

    // Suporta todos os formatos de notificação do Mercado Pago:
    // 1. Novo formato: { type: "payment", data: { id: "..." } }
    // 2. Formato action: { action: "payment.updated", data: { id: "..." } }
    // 3. Formato IPN antigo: { topic: "payment", resource: "/v1/payments/123" ou "123" }
    const isPaymentNotification =
      body.type === "payment" ||
      body.action === "payment.updated" ||
      body.action === "payment.created" ||
      body.topic === "payment";

    if (isPaymentNotification) {
      // Extrair ID do pagamento de qualquer formato
      let paymentId = body.data?.id || body.id;
      if (!paymentId && body.resource) {
        // IPN antigo: resource pode ser "/v1/payments/123456" ou só "123456"
        const match = String(body.resource).match(/(\d+)$/);
        paymentId = match ? match[1] : null;
      }

      if (!paymentId) {
        console.log("Webhook recebido sem payment ID:", body);
        return NextResponse.json({ received: true });
      }

      // Fetch payment details from Mercado Pago
      const payment = await paymentClient.get({ id: paymentId });

      if (payment.status === "approved") {
        const metadata = payment.metadata || {};
        const userId = String(metadata.user_id || "");
        const planoNome = String(metadata.plano_nome || "");
        const planoDias = Number(metadata.plano_dias || 30);

        if (!userId) {
          console.error("Payment approved but no user_id in metadata:", payment.id);
          return NextResponse.json({ received: true });
        }

        // Format payment date
        const dataPagamento = new Date(payment.date_approved || payment.date_created || Date.now())
          .toLocaleDateString("pt-BR");

        // Format value
        const valor = `R$ ${(payment.transaction_amount || 0).toFixed(2).replace(".", ",")}`;

        // Determine payment method
        const metodo = mapPaymentMethod(payment.payment_type_id || "");

        // Update existing record or insert new one
        const paymentIdStr = String(payment.id);
        const externalRef = String(payment.external_reference || "");
        const updated = await updatePagamentoStatus(paymentIdStr, "Aprovado");
        if (!updated) {
          await addPagamento({
            idUsuario: userId,
            idPagamento: paymentIdStr,
            dataPagamento,
            valor,
            metodo,
            status: "Aprovado",
            externalReference: externalRef,
          });
        }

        // Update user plan in USUÁRIOS sheet (lógica de expiração inteligente em updateUsuarioPlano)
        await updateUsuarioPlano(userId, planoNome || "Premium", planoDias);

        console.log(`Payment ${payment.id} approved for user ${userId}. Plan: ${planoNome}, Days: ${planoDias}`);
      } else {
        console.log(`Payment ${payment.id} status: ${payment.status}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    // Always return 200 to Mercado Pago to avoid retries on our errors
    return NextResponse.json({ received: true });
  }
}

export async function GET(req: NextRequest) {
  // Validação de URL pelo Mercado Pago + sync manual: /api/pagamento/webhook?id=123456&secret=SEU_SECRET
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("id");
  const secret = searchParams.get("secret");

  if (!paymentId) {
    return NextResponse.json({ ok: true });
  }

  if (secret !== process.env.MP_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const payment = await paymentClient.get({ id: paymentId });
    if (payment.status !== "approved") {
      return NextResponse.json({ status: payment.status, message: "Pagamento não aprovado" });
    }

    const metadata = payment.metadata || {};
    const userId = String(metadata.user_id || "");
    const planoNome = String(metadata.plano_nome || "");
    const planoDias = Number(metadata.plano_dias || 30);

    if (!userId) {
      return NextResponse.json({ error: "user_id não encontrado no metadata" }, { status: 400 });
    }

    const dataPagamento = new Date(payment.date_approved || payment.date_created || Date.now())
      .toLocaleDateString("pt-BR");
    const valor = `R$ ${(payment.transaction_amount || 0).toFixed(2).replace(".", ",")}`;
    const metodo = mapPaymentMethod(payment.payment_type_id || "");
    const paymentIdStr = String(payment.id);
    const externalRef = String(payment.external_reference || "");

    const updated = await updatePagamentoStatus(paymentIdStr, "Aprovado");
    if (!updated) {
      await addPagamento({ idUsuario: userId, idPagamento: paymentIdStr, dataPagamento, valor, metodo, status: "Aprovado", externalReference: externalRef });
    }
    await updateUsuarioPlano(userId, planoNome || "Premium", planoDias);

    return NextResponse.json({ ok: true, paymentId: paymentIdStr, userId, planoNome, planoDias, updated });
  } catch (error) {
    console.error("Sync manual error:", error);
    return NextResponse.json({ error: "Erro ao sincronizar pagamento" }, { status: 500 });
  }
}

function mapPaymentMethod(paymentTypeId: string): string {
  const map: Record<string, string> = {
    credit_card: "Cartão de Crédito",
    debit_card: "Cartão de Débito",
    bank_transfer: "Transferência",
    ticket: "Boleto",
    account_money: "Mercado Pago",
    pix: "PIX",
  };
  return map[paymentTypeId] || paymentTypeId || "Mercado Pago";
}
