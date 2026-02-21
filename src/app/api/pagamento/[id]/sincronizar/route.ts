import { NextRequest, NextResponse } from "next/server";
import { paymentClient } from "@/lib/mercadopago";
import { addPagamento, updatePagamentoStatus, updateUsuarioPlano } from "@/lib/sheets";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const payment = await paymentClient.get({ id });

    if (payment.status !== "approved") {
      return NextResponse.json({ status: payment.status, message: "Pagamento ainda não aprovado." });
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
    const metodoMap: Record<string, string> = {
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      bank_transfer: "Transferência",
      ticket: "Boleto",
      account_money: "Mercado Pago",
      pix: "PIX",
    };
    const metodo = metodoMap[payment.payment_type_id || ""] || payment.payment_type_id || "Mercado Pago";
    const paymentIdStr = String(payment.id);
    const externalRef = String(payment.external_reference || "");

    const updated = await updatePagamentoStatus(paymentIdStr, "Aprovado");
    if (!updated) {
      await addPagamento({ idUsuario: userId, idPagamento: paymentIdStr, dataPagamento, valor, metodo, status: "Aprovado", externalReference: externalRef });
    }
    await updateUsuarioPlano(userId, planoNome || "Premium", planoDias);

    return NextResponse.json({ status: "approved", userId, planoNome, planoDias });
  } catch (error) {
    console.error("Erro ao sincronizar pagamento:", error);
    return NextResponse.json({ error: "Erro ao sincronizar pagamento" }, { status: 500 });
  }
}
