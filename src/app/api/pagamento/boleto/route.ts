import { NextRequest, NextResponse } from "next/server";
import { paymentClient, getPlanoById } from "@/lib/mercadopago";
import { getUsuarioById, getUsuarios, addPagamento } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const { planoId, userId, cpf } = await req.json();

    if (!planoId || !userId || !cpf) {
      return NextResponse.json({ error: "Dados incompletos (planoId, userId, cpf)" }, { status: 400 });
    }

    const plano = getPlanoById(planoId);
    if (!plano) return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });

    const usuario = await getUsuarioById(userId);
    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Filho pode não ter email — buscar a conta pai
    let payerEmail = usuario.email;
    let payerNome = usuario.nome || usuario.usuarioPai || "Usuário";
    if (!payerEmail && usuario.usuarioPai) {
      const todos = await getUsuarios();
      const pai = todos.find((u) =>
        u.usuarioPai === "" &&
        u.email &&
        (u.nome.toLowerCase() === usuario.usuarioPai.toLowerCase() ||
          u.usuario.toLowerCase() === usuario.usuarioPai.toLowerCase())
      );
      if (pai) { payerEmail = pai.email; payerNome = pai.nome || payerNome; }
    }
    if (!payerEmail) payerEmail = "suporte@gerenciadormu.com.br";
    if (!payerNome) payerNome = "Usuário";

    const payment = await paymentClient.create({
      body: {
        transaction_amount: plano.preco,
        description: `Gerenciador MU - Plano ${plano.nome}`,
        payment_method_id: "bolbradesco",
        payer: {
          email: payerEmail,
          first_name: payerNome.split(" ")[0],
          last_name: payerNome.split(" ").slice(1).join(" ") || payerNome.split(" ")[0],
          identification: {
            type: "CPF",
            number: cpf.replace(/\D/g, ""),
          },
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

    await addPagamento({
      idUsuario: usuario.id,
      idPagamento: String(payment.id),
      dataPagamento: new Date().toLocaleDateString("pt-BR"),
      valor: `R$ ${plano.preco.toFixed(2).replace(".", ",")}`,
      metodo: "Boleto",
      status: "Pendente",
    });

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      boletoUrl: payment.transaction_details?.external_resource_url || null,
      barcode: (payment as unknown as { barcode?: { content?: string } }).barcode?.content || null,
    });
  } catch (error) {
    console.error("Erro ao criar boleto:", error);
    return NextResponse.json({ error: "Erro ao criar boleto" }, { status: 500 });
  }
}
