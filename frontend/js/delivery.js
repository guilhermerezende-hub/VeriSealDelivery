import { ETA } from "./config.js";

export function fmtCep(value) {
  const digits = String(value).replace(/\D/g, "").slice(0, 8);
  return digits.length > 5
    ? digits.slice(0, 5) + "-" + digits.slice(5)
    : digits;
}

export function validCep(value) {
  return (
    /^\d{5}-?\d{3}$/.test(String(value)) &&
    !/^(\d)\1{7}$/.test(String(value).replace("-", ""))
  );
}

export const placeLabel = (address) =>
  address.bairro || address.city || address.cep;
export const cityUf = (address) =>
  address.city ? address.city + (address.uf ? "/" + address.uf : "") : "";
export const etaText = () => ETA;

export async function lookupCep(
  value,
  fetcher = globalThis.fetch,
  timeoutMs = 4500,
) {
  if (!validCep(value)) return { error: "Digite um CEP válido com 8 números." };
  const digits = String(value).replace(/\D/g, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("CEP service unavailable");
    const data = await response.json();
    if (data.erro)
      return {
        error: "Não encontramos esse CEP. Confira os números.",
        notFound: true,
      };
    if (
      typeof data.localidade !== "string" ||
      !data.localidade ||
      !/^[A-Z]{2}$/.test(data.uf)
    ) {
      throw new Error("Invalid address response");
    }
    return {
      cep: fmtCep(digits),
      street: typeof data.logradouro === "string" ? data.logradouro : "",
      bairro: typeof data.bairro === "string" ? data.bairro : "",
      city: data.localidade,
      uf: data.uf,
      coverage: "unconfirmed",
    };
  } catch {
    return {
      error:
        "Não foi possível consultar o CEP. Tente novamente.",
    };
  } finally {
    clearTimeout(timer);
  }
}

export function restoreAddress(saved) {
  if (!saved || !validCep(saved.cep)) return null;
  return Object.fromEntries(
    ["cep", "street", "bairro", "city", "uf"].map((key) => [
      key,
      typeof saved[key] === "string" ? saved[key] : "",
    ]),
  );
}

export function deliveryMsg(address) {
  const where = [address.bairro, cityUf(address)].filter(Boolean).join(", ");
  return `Entregamos ${where ? "em " + where : "no seu endereço"} · ${etaText()}.`;
}
