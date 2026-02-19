import { NextRequest, NextResponse } from "next/server";
import { paymentClient } from "@/lib/mercadopago";
import { getUsuarios } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioPai = searchParams.get("usuarioPai");

    if (!usuarioPai) {
      return NextResponse.json({ error: "usuarioPai é obrigatório" }, { status: 400 });
    }

    const todos = await getUsuarios();
    const filhos = todos.filter(
      (u) => u.usuarioPai.toLowerCase() === usuarioPai.toLowerCase() && u.usuario
    );

    const pendentes: PagamentoPendente[] = [];

    for (const u of filhos) {
      try {
        const result = await paymentClient.search({
          options: {
            external_reference: u.id,
            status: "pending",
          } as Record<string, string>,
        });

        const resultados = (result as { results?: MPPayment[] }).results || [];
        for (const p of resultados) {
          if (p.status !== "pending") continue;

          const isPix = p.payment_method_id === "pix";
          const pixData = isPix ? p.point_of_interaction?.transaction_data : undefined;

          pendentes.push({
            id: String(p.id),
            idUsuario: u.id,
            usuario: u.usuario,
            status: p.status,
            valor: p.transaction_amount || 0,
            metodo: p.payment_method_id || "",
            dataCriacao: p.date_created || "",
            planoNome: String(p.metadata?.plano_nome || ""),
            pixQrCode: pixData?.qr_code || null,
            pixQrCodeBase64: pixData?.qr_code_base64 || null,
            pixTicketUrl: pixData?.ticket_url || null,
          });
        }
      } catch {
        // Silently skip users with no payments
      }
    }

    return NextResponse.json({ pendentes });
  } catch (error) {
    console.error("Erro ao buscar pagamentos pendentes:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

interface MPPayment {
  id: number;
  status: string;
  transaction_amount: number;
  payment_method_id: string;
  date_created: string;
  metadata?: Record<string, unknown>;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
}

export interface PagamentoPendente {
  id: string;
  idUsuario: string;
  usuario: string;
  status: string;
  valor: number;
  metodo: string;
  dataCriacao: string;
  planoNome: string;
  pixQrCode: string | null;
  pixQrCodeBase64: string | null;
  pixTicketUrl: string | null;
}
