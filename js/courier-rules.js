import { validCep } from "./delivery.js";

export const digits = (value) => String(value ?? "").replace(/\D/g, "");

export const VEHICLES = Object.freeze({
  moto: { label: "Moto", license: "CNH categoria A" },
  bike: { label: "Bicicleta", license: "Sem CNH" },
  car: { label: "Carro", license: "CNH categoria B" },
});

export const SHIFTS = Object.freeze({
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  fds: "Fins de semana",
});

export const STEP_FIELDS = [
  ["name", "cpf", "birth", "phone", "email"],
  ["vehicle", "cep", "cnh", "plate", "shifts"],
  ["terms"],
];

export const needsLicense = (vehicle) =>
  vehicle === "moto" || vehicle === "car";

export const DEMO_CPFS = Object.freeze({
  52998224725: { birth: "15/04/1995", label: "maior de idade" },
  39053344705: { birth: "22/08/1988", label: "maior de idade" },
  12345678909: { birth: "03/11/2010", label: "menor de idade" },
});

export function cpfBirthCheck(cpf, birth, registry = DEMO_CPFS) {
  const record = registry[digits(cpf)];
  if (!record) return "unknown";
  const a = parseBirth(birth),
    b = parseBirth(record.birth);
  return a && b && a.getTime() === b.getTime() ? "ok" : "mismatch";
}

export function fmtCpf(value) {
  const d = digits(value).slice(0, 11);
  const head = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)]
    .filter(Boolean)
    .join(".");
  return d.length > 9 ? `${head}-${d.slice(9)}` : head;
}

export function validCpf(value) {
  const d = digits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (len) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10]);
}

export function fmtPhone(value) {
  const d = digits(value).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  const rest = d.slice(2);
  return `(${d.slice(0, 2)}) ${rest.length > 5 ? rest.slice(0, 5) + "-" + rest.slice(5) : rest}`;
}

export const validPhone = (value) => /^[1-9]{2}9\d{8}$/.test(digits(value));

export const validEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());

export function fmtDate(value) {
  const d = digits(value).slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join("/");
}

export function parseBirth(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value).trim());
  if (!match) return null;
  const [day, month, year] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
}

export function ageOn(birth, today = new Date()) {
  let age = today.getFullYear() - birth.getFullYear();
  const months = today.getMonth() - birth.getMonth();
  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const validCnh = (value) => {
  const d = digits(value);
  return d.length === 11 && !/^(\d)\1{10}$/.test(d);
};

export const fmtPlate = (value) =>
  String(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);
export const validPlate = (value) =>
  /^[A-Z]{3}\d[A-Z\d]\d{2}$/.test(fmtPlate(value));

export const firstName = (name) => String(name).trim().split(/\s+/)[0] || "";

const RULES = {
  name: ({ name = "" }) =>
    name.trim().split(/\s+/).filter(Boolean).length >= 2
      ? ""
      : "Informe nome e sobrenome.",
  cpf: ({ cpf = "" }) => {
    if (!digits(cpf)) return "Informe seu CPF.";
    if (!validCpf(cpf)) return "CPF inválido. Confira os números.";
    return cpfBirthCheck(cpf, "") === "unknown"
      ? "CPF não encontrado na base da demonstração. Use um CPF de exemplo."
      : "";
  },

  birth: ({ birth = "", cpf = "" }, today) => {
    if (!String(birth).trim()) return "Informe sua data de nascimento.";
    const date = parseBirth(birth);
    if (!date) return "Digite uma data válida no formato DD/MM/AAAA.";
    const age = ageOn(date, today);
    if (age < 0 || age > 100) return "Confira o ano de nascimento.";
    if (validCpf(cpf) && cpfBirthCheck(cpf, birth) === "mismatch")
      return "A data de nascimento não confere com a do CPF informado.";
    return age < 18 ? "É preciso ter 18 anos ou mais para se cadastrar." : "";
  },
  phone: ({ phone = "" }) =>
    !digits(phone)
      ? "Informe seu celular com DDD."
      : validPhone(phone)
        ? ""
        : "Digite um celular válido com DDD, como (11) 98765-4321.",
  email: ({ email = "" }) =>
    !String(email).trim()
      ? "Informe seu e-mail."
      : validEmail(email)
        ? ""
        : "Digite um e-mail válido, como voce@exemplo.com.",
  vehicle: ({ vehicle }) =>
    VEHICLES[vehicle] ? "" : "Escolha como você vai entregar.",
  cep: ({ cep = "", cepNotFound }) =>
    !validCep(cep)
      ? "Digite um CEP válido com 8 números."
      : cepNotFound
        ? "Não encontramos esse CEP. Confira os números."
        : "",
  cnh: ({ vehicle, cnh = "" }) =>
    !needsLicense(vehicle) || validCnh(cnh)
      ? ""
      : "Digite os 11 números da sua CNH.",
  plate: ({ vehicle, plate = "" }) =>
    !needsLicense(vehicle) || validPlate(plate)
      ? ""
      : "Digite a placa no formato ABC1D23 ou ABC1234.",
  shifts: ({ shifts = [] }) =>
    shifts.some((shift) => SHIFTS[shift])
      ? ""
      : "Escolha pelo menos um período.",
  terms: ({ terms }) =>
    terms ? "" : "Para enviar, confirme que leu e aceita os termos.",
};

export function validateStep(step, data, today = new Date()) {
  return Object.fromEntries(
    (STEP_FIELDS[step] || [])
      .map((field) => [field, RULES[field](data, today)])
      .filter(([, message]) => message),
  );
}
