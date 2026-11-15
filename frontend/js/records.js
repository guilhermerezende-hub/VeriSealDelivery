// Conversões entre os dados da API (JSON do C#) e o que as telas mostram.
// Sem DOM: dá para testar no Node (tests/unit/records.test.js).

const pad = (n) => String(n).padStart(2, "0");
const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const SEAL_CODE_RE = /^VS-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const SEAL_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// "vs7k2m9qxa" -> "VS-7K2M-9QXA" (vai formatando enquanto a pessoa digita)
export function formatSealCode(value) {
  let s = String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (!s) return "";
  if (s.startsWith("VS")) s = s.slice(2);
  s = s.slice(0, 8);
  return "VS-" + s.slice(0, 4) + (s.length > 4 ? "-" + s.slice(4) : "");
}

export function randomSealCode(random = Math.random) {
  const part = () =>
    Array.from(
      { length: 4 },
      () => SEAL_CHARS[Math.floor(random() * SEAL_CHARS.length)],
    ).join("");
  return `VS-${part()}-${part()}`;
}

// "11987654321" -> "(11) 98765-4321"
export function formatPhone(value) {
  const d = String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Datas sem fuso, como o MySQL guarda: "2026-11-13" e "2026-11-13T18:30:00".
export const isoDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const isoDateTime = (d) =>
  `${isoDate(d)}T${hhmm(d)}:${pad(d.getSeconds())}`;

export function parseLocal(value) {
  const m =
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(
      String(value ?? ""),
    );
  if (!m) return null;
  return new Date(
    +m[1],
    +m[2] - 1,
    +m[3],
    +(m[4] ?? 0),
    +(m[5] ?? 0),
    +(m[6] ?? 0),
  );
}

export function brDate(value) {
  const d = parseLocal(value);
  return d
    ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
    : "";
}

export function brDateTime(value) {
  const d = parseLocal(value);
  return d ? `${brDate(value)} · ${hhmm(d)}` : "";
}

// "hoje · 18:30", "ontem · 19:30" ou "02/10/2026 · 21:42"
export function brWhen(value, now = new Date()) {
  const d = parseLocal(value);
  if (!d) return "";
  const day = (x) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86400000);
  if (diff === 0) return `hoje · ${hhmm(d)}`;
  if (diff === 1) return `ontem · ${hhmm(d)}`;
  return brDateTime(value);
}

// Lacre vindo da API -> registro no formato da tela de verificação
// (o mesmo formato dos lacres em js/products.js).
export function sealFromApi(lacre, now = new Date()) {
  return {
    product: lacre.produtoId,
    status: lacre.status,
    lot: lacre.lote,
    made: brDate(lacre.fabricadoEm),
    checks: Number.isSafeInteger(lacre.verificacoes) ? lacre.verificacoes : 0,
    sentAt: lacre.enviadoEm ? brWhen(lacre.enviadoEm, now) : undefined,
    openedAt: lacre.abertoEm ? brDateTime(lacre.abertoEm) : undefined,
  };
}
