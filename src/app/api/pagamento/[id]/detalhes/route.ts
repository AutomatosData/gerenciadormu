import { NextRequest, NextResponse } from "next/server";
import { paymentClient } from "@/lib/mercadopago";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payment = await paymentClient.get({ id: Number(id) });

    const isPix = payment.payment_method_id === "pix";
    const isBoleto = payment.payment_type_id === "ticket";
    const txData = payment.point_of_interaction?.transaction_data;

    return NextResponse.json({
      id: String(payment.id),
      status: payment.status,
      metodo: payment.payment_method_id || "",
      valor: payment.transaction_amount || 0,
      dataCriacao: payment.date_created || "",
      planoNome: String(payment.metadata?.plano_nome || ""),
      pixQrCode: isPix ? (txData?.qr_code || null) : null,
      pixQrCodeBase64: isPix ? (txData?.qr_code_base64 || null) : null,
      pixTicketUrl: isPix ? (txData?.ticket_url || null) : null,
      boletoUrl: isBoleto ? (payment.transaction_details?.external_resource_url || null) : null,
      barcode: isBoleto
        ? ((payment as unknown as { barcode?: { content?: string } }).barcode?.content || null)
        : null,
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes do pagamento:", error);
    return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
  }
}
