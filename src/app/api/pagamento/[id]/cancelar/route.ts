import { NextRequest, NextResponse } from "next/server";
import { paymentClient } from "@/lib/mercadopago";
import { updatePagamentoStatus } from "@/lib/sheets";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await paymentClient.cancel({ id: Number(id) });
    await updatePagamentoStatus(id, "Cancelado");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao cancelar pagamento:", error);
    return NextResponse.json({ error: "Erro ao cancelar pagamento" }, { status: 500 });
  }
}
