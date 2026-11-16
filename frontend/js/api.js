import { apiUrl } from "./config.js";
import { store } from "./storage.js";

// Conversa com a API em C# (backend/src/VeriSealApi), sempre em JSON.
// status 0 = não houve resposta (API fora do ar, sem internet ou tempo esgotado).
export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const OFFLINE_MESSAGE =
  "Não foi possível conectar ao servidor. Confira a conexão e tente de novo.";

function messageFrom(data, status) {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (data && typeof data === "object") {
    if (data.errors && typeof data.errors === "object") {
      const first = Object.values(data.errors).flat()[0];
      if (first) return String(first);
    }
    if (status < 500 && (data.detail || data.title))
      return String(data.detail || data.title);
  }
  return status >= 500
    ? "O servidor não conseguiu concluir agora. Tente de novo em instantes."
    : `Não foi possível concluir (erro ${status}).`;
}

// token = login do administrador (rotas do painel); vai no cabeçalho Authorization.
export async function request(
  path,
  { method = "GET", body, timeout = 12000, baseUrl = apiUrl(), token } = {},
) {
  if (!baseUrl) throw new ApiError(OFFLINE_MESSAGE, 0);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(baseUrl + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(OFFLINE_MESSAGE, 0);
  } finally {
    clearTimeout(timer);
  }
  const text = response.status === 204 ? "" : await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!response.ok)
    throw new ApiError(messageFrom(data, response.status), response.status);
  return data;
}

// Login do administrador guardado neste navegador: { token, nome, email }.
// O token vale 12 horas; depois disso a API responde 401 e o painel pede a senha de novo.
export const adminSession = {
  get() {
    const s = store.get("admin", null);
    return s && typeof s.token === "string" && s.token ? s : null;
  },
  set(session) {
    store.set("admin", session);
  },
  clear() {
    store.set("admin", null);
  },
};

const seal = (code) => `/lacres/${encodeURIComponent(code)}`;

export const api = {
  adminLogin: (email, senha, opts) =>
    request("/admin/login", {
      ...opts,
      method: "POST",
      body: { email, senha },
    }),
  adminMe: (opts) => request("/admin/eu", opts),
  adminLogout: (opts) => request("/admin/sair", { ...opts, method: "POST" }),

  createOrder: (order, opts) =>
    request("/pedidos", { ...opts, method: "POST", body: order }),
  listOrders: (opts) => request("/pedidos", opts),
  updateOrderStatus: (id, status, opts) =>
    request(`/pedidos/${id}/status`, {
      ...opts,
      method: "PUT",
      body: { status },
    }),

  listClients: (opts) => request("/clientes", opts),
  createClient: (client, opts) =>
    request("/clientes", { ...opts, method: "POST", body: client }),
  updateClient: (id, client, opts) =>
    request(`/clientes/${id}`, { ...opts, method: "PUT", body: client }),
  deleteClient: (id, opts) =>
    request(`/clientes/${id}`, { ...opts, method: "DELETE" }),

  listSeals: (opts) => request("/lacres", opts),
  createSeal: (data, opts) =>
    request("/lacres", { ...opts, method: "POST", body: data }),
  updateSeal: (code, data, opts) =>
    request(seal(code), { ...opts, method: "PUT", body: data }),
  deleteSeal: (code, opts) =>
    request(seal(code), { ...opts, method: "DELETE" }),
  checkSeal: (code, origin, opts) =>
    request(`${seal(code)}/verificacoes`, {
      ...opts,
      method: "POST",
      body: { origem: origin },
    }),

  listReports: (opts) => request("/avisos", opts),
  reportSeal: (code, reason, opts) =>
    request("/avisos", {
      ...opts,
      method: "POST",
      body: { lacreCodigo: code, motivo: reason },
    }),
};
