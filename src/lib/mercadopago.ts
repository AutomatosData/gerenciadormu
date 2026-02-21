import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export const preferenceClient = new Preference(client);
export const paymentClient = new Payment(client);

export interface PlanoConfig {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  dias: number;
}

export const PLANOS: PlanoConfig[] = [
  {
    id: "semanal",
    nome: "Semanal",
    descricao: "Acesso completo por 7 dias",
    preco: 7.90,
    dias: 7,
  },
  {
    id: "mensal",
    nome: "Mensal",
    descricao: "Acesso completo por 30 dias",
    preco: 29.90,
    dias: 30,
  },
  {
    id: "trimestral",
    nome: "Trimestral",
    descricao: "Acesso completo por 90 dias",
    preco: 74.90,
    dias: 90,
  },
  {
    id: "semestral",
    nome: "Semestral",
    descricao: "Acesso completo por 180 dias",
    preco: 134.90,
    dias: 180,
  },
  {
    id: "anual",
    nome: "Anual",
    descricao: "Acesso completo por 365 dias",
    preco: 239.90,
    dias: 365,
  },
];

export function getPlanoById(id: string): PlanoConfig | undefined {
  return PLANOS.find((p) => p.id === id);
}
