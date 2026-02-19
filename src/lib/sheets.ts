import { google } from "googleapis";
import path from "path";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || "11dbjQFSt9qTA_t4RQu3JH7_SfDhXhY8OB8hC5mQnLIo";

async function getAuthClient() {
  const credentialsPath = path.join(process.cwd(), "credentials.json");
  
  // Try to use credentials file first (for local development)
  try {
    const fs = require('fs');
    if (fs.existsSync(credentialsPath)) {
      const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      return auth;
    }
  } catch (error) {
    console.log("Credentials file not found, checking environment variables");
  }
  
  // Try GOOGLE_CREDENTIALS (full JSON) - preferred for Vercel
  const googleCredentials = process.env.GOOGLE_CREDENTIALS;
  if (googleCredentials) {
    try {
      const credentials = JSON.parse(googleCredentials);
      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      return auth;
    } catch (parseError) {
      console.error("Error parsing GOOGLE_CREDENTIALS:", parseError);
    }
  }
  
  // Fall back to individual environment variables
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  
  if (!privateKey || !clientEmail) {
    throw new Error("Missing Google credentials. Please set either GOOGLE_CREDENTIALS (JSON) or GOOGLE_PRIVATE_KEY and GOOGLE_CLIENT_EMAIL environment variables.");
  }
  
  const auth = new google.auth.GoogleAuth({
    credentials: {
      private_key: privateKey,
      client_email: clientEmail,
      client_id: process.env.GOOGLE_CLIENT_ID,
      type: "service_account",
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth;
}

async function getSheetsClient() {
  const auth = await getAuthClient();
  return google.sheets({ version: "v4", auth });
}

// ==================== USUÁRIOS ====================

export interface Usuario {
  id: string;
  nome: string;
  usuario: string;
  email: string;
  plano: string;
  expira: string;
  whatsapp: string;
  usuarioPai: string;
}

export async function getUsuarios(): Promise<Usuario[]> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "USUÁRIOS!A2:H",
  });
  const rows = res.data.values || [];
  return rows.map((row) => ({
    id: row[0] || "",
    nome: row[1] || "",
    usuario: row[2] || "",
    email: row[3] || "",
    plano: row[4] || "",
    expira: row[5] || "",
    whatsapp: row[6] || "",
    usuarioPai: row[7] || "",
  }));
}

export async function getUsuarioPai(usuarioPai: string): Promise<Usuario | null> {
  const usuarios = await getUsuarios();
  return usuarios.find((u) => u.usuarioPai.toLowerCase() === usuarioPai.toLowerCase() && u.usuarioPai !== "") || null;
}

export async function getUsuariosByPai(usuarioPai: string): Promise<Usuario[]> {
  const usuarios = await getUsuarios();
  return usuarios.filter((u) => u.usuarioPai.toLowerCase() === usuarioPai.toLowerCase());
}

export async function getUsuarioByUsuario(usuario: string): Promise<Usuario | null> {
  const usuarios = await getUsuarios();
  return usuarios.find((u) => u.usuario.toLowerCase() === usuario.toLowerCase()) || null;
}

export async function getUsuarioById(id: string): Promise<Usuario | null> {
  const usuarios = await getUsuarios();
  return usuarios.find((u) => u.id === id) || null;
}

export async function addUsuario(data: { nome: string; usuario: string; email: string; whatsapp: string; usuarioPai: string }): Promise<Usuario> {
  const sheets = await getSheetsClient();
  const usuarios = await getUsuarios();
  
  const maxId = usuarios.reduce((max, u) => {
    const num = parseInt(u.id, 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const newId = String(maxId + 1);

  const newUser: Usuario = {
    id: newId,
    nome: data.nome,
    usuario: data.usuario,
    email: data.email,
    plano: "Free",
    expira: "",
    whatsapp: data.whatsapp,
    usuarioPai: data.usuarioPai,
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "USUÁRIOS!A:H",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[newUser.id, newUser.nome, newUser.usuario, newUser.email, newUser.plano, newUser.expira, newUser.whatsapp, newUser.usuarioPai]],
    },
  });

  return newUser;
}

export async function updateUsuario(id: string, data: { nome?: string; usuario?: string; email?: string; whatsapp?: string }): Promise<Usuario | null> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "USUÁRIOS!A2:H",
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return null;

  const row = rows[rowIndex];
  const updated: Usuario = {
    id: row[0],
    nome: data.nome ?? row[1] ?? "",
    usuario: data.usuario ?? row[2] ?? "",
    email: data.email ?? row[3] ?? "",
    plano: row[4] ?? "",
    expira: row[5] ?? "",
    whatsapp: data.whatsapp ?? row[6] ?? "",
    usuarioPai: row[7] ?? "",
  };

  const sheetRow = rowIndex + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `USUÁRIOS!A${sheetRow}:H${sheetRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[updated.id, updated.nome, updated.usuario, updated.email, updated.plano, updated.expira, updated.whatsapp, updated.usuarioPai]],
    },
  });

  return updated;
}

export async function updateUsuarioPlano(id: string, plano: string, expira: string): Promise<void> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "USUÁRIOS!A2:H",
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return;

  const row = rows[rowIndex];
  const sheetRow = rowIndex + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `USUÁRIOS!A${sheetRow}:H${sheetRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[row[0], row[1], row[2], row[3], plano, expira, row[6], row[7]]],
    },
  });
}

// ==================== PAGAMENTOS ====================

export interface Pagamento {
  idUsuario: string;
  idPagamento: string;
  dataPagamento: string;
  valor: string;
  metodo: string;
  status: string;
}

export async function addPagamento(data: Pagamento): Promise<void> {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "PAGAMENTOS!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[data.idUsuario, data.idPagamento, data.dataPagamento, data.valor, data.metodo, data.status]],
    },
  });
}

export async function getPagamentosByUsuarioId(idUsuario: string): Promise<Pagamento[]> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "PAGAMENTOS!A2:F",
  });
  const rows = res.data.values || [];
  return rows
    .filter((row) => row[0] === idUsuario)
    .map((row) => ({
      idUsuario: row[0] || "",
      idPagamento: row[1] || "",
      dataPagamento: row[2] || "",
      valor: row[3] || "",
      metodo: row[4] || "",
      status: row[5] || "",
    }));
}

// ==================== AUTHMAC ====================

export interface AuthMac {
  rowIndex: number;
  usuario: string;
  mac: string;
  status: "Autorizado" | "Não Autorizado";
}

export async function getAuthMacsByPai(usuarioPai: string): Promise<AuthMac[]> {
  const usuarios = await getUsuarios();
  const nomes = usuarios
    .filter((u) => u.usuarioPai.toLowerCase() === usuarioPai.toLowerCase() && u.usuario)
    .map((u) => u.usuario.toLowerCase());
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "AUTHMAC!A2:C",
  });
  const rows = res.data.values || [];
  return rows
    .map((row, i) => ({
      rowIndex: i + 2,
      usuario: row[0] || "",
      mac: row[1] || "",
      status: (row[2] || "Não Autorizado") as AuthMac["status"],
    }))
    .filter((r) => nomes.includes(r.usuario.toLowerCase()));
}

export async function updateAuthMacStatus(rowIndex: number, status: AuthMac["status"]): Promise<void> {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `AUTHMAC!C${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[status]] },
  });
}

// ==================== HISTÓRICO ====================

export interface HistoricoLogin {
  horario: string;
  usuario: string;
  ip: string;
  mac: string;
}

export async function getHistoricoByUsuario(usuario: string): Promise<HistoricoLogin[]> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Histórico!A2:D",
  });
  const rows = res.data.values || [];
  return rows
    .filter((row) => row[1]?.toLowerCase() === usuario.toLowerCase())
    .map((row) => ({
      horario: row[0] || "",
      usuario: row[1] || "",
      ip: row[2] || "",
      mac: row[3] || "",
    }));
}
