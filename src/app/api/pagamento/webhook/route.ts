import { NextRequest, NextResponse } from "next/server";
import { paymentClient } from "@/lib/mercadopago";
import { addPagamento, updateUsuarioPlano } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mercado Pago sends different notification types
    if (body.type === "payment" || body.action === "payment.updated" || body.action === "payment.created") {
      const paymentId = body.data?.id || body.id;

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

        // Calculate expiration date
        const expiraDate = new Date();
        expiraDate.setDate(expiraDate.getDate() + planoDias);
        const expiraStr = expiraDate.toLocaleDateString("pt-BR");

        // Format payment date
        const dataPagamento = new Date(payment.date_approved || payment.date_created || Date.now())
          .toLocaleDateString("pt-BR");

        // Format value
        const valor = `R$ ${(payment.transaction_amount || 0).toFixed(2).replace(".", ",")}`;

        // Determine payment method
        const metodo = mapPaymentMethod(payment.payment_type_id || "");

        // Add payment record to PAGAMENTOS sheet
        await addPagamento({
          idUsuario: userId,
          idPagamento: String(payment.id),
          dataPagamento,
          valor,
          metodo,
          status: "Aprovado",
        });

        // Update user plan in USUÁRIOS sheet
        await updateUsuarioPlano(userId, planoNome || "Premium", expiraStr);

        console.log(`Payment ${payment.id} approved for user ${userId}. Plan: ${planoNome}, Expires: ${expiraStr}`);
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
