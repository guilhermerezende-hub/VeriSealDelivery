import test from "node:test";
import assert from "node:assert/strict";
import {
  ageOn,
  fmtCpf,
  fmtDate,
  fmtPhone,
  fmtPlate,
  parseBirth,
  validCpf,
  validPhone,
  validPlate,
  validateStep,
} from "../js/courier-rules.js";

const today = new Date(2026, 10, 10);

test("CPF recebe máscara e confere os dígitos verificadores", () => {
  assert.equal(fmtCpf("52998224725"), "529.982.247-25");
  assert.equal(fmtCpf("52998"), "529.98");
  assert.equal(fmtCpf("529.982.247-2599"), "529.982.247-25");
  assert.equal(validCpf("529.982.247-25"), true);
  for (const value of ["529.982.247-24", "111.111.111-11", "5299822472", ""])
    assert.equal(validCpf(value), false);
});

test("celular exige DDD sem zero e o nono dígito", () => {
  assert.equal(fmtPhone("11987654321"), "(11) 98765-4321");
  assert.equal(fmtPhone("119"), "(11) 9");
  assert.equal(validPhone("(11) 98765-4321"), true);
  for (const value of ["(11) 8765-4321", "(01) 98765-4321", "11 3876 5432"])
    assert.equal(validPhone(value), false);
});

test("data de nascimento rejeita datas inexistentes e menores de 18 anos", () => {
  assert.equal(fmtDate("01021990"), "01/02/1990");
  assert.equal(parseBirth("31/02/1990"), null);
  assert.equal(parseBirth("1990-02-01"), null);
  assert.equal(ageOn(parseBirth("10/11/2008"), today), 18);
  assert.equal(ageOn(parseBirth("11/11/2008"), today), 17);
  const birth = (value) => validateStep(0, { birth: value }, today).birth;
  assert.equal(birth("10/11/2008"), undefined);
  assert.match(birth("11/11/2008"), /18 anos/);
  assert.match(birth("29/02/2001"), /data válida/);
  assert.match(birth("01/01/2030"), /ano de nascimento/);
});

test("placa aceita os formatos antigo e Mercosul", () => {
  assert.equal(fmtPlate("abc-1d23"), "ABC1D23");
  assert.equal(validPlate("ABC1D23"), true);
  assert.equal(validPlate("abc-1234"), true);
  assert.equal(validPlate("AB12345"), false);
});

test("cada etapa só aponta os próprios campos", () => {
  const filled = {
    name: "Maria Souza",
    cpf: "529.982.247-25",
    birth: "15/04/1995",
    phone: "(31) 99876-5432",
    email: "maria@exemplo.com",
  };
  assert.deepEqual(validateStep(0, filled, today), {});
  assert.deepEqual(Object.keys(validateStep(0, {}, today)), [
    "name",
    "cpf",
    "birth",
    "phone",
    "email",
  ]);
  assert.match(validateStep(0, { ...filled, name: "Maria" }).name, /sobrenome/);
  assert.deepEqual(validateStep(2, { terms: true }), {});
  assert.ok(validateStep(2, { terms: false }).terms);
});

test("CNH e placa são exigidas só para moto e carro", () => {
  const base = { cep: "30140-071", shifts: ["noite"] };
  assert.deepEqual(validateStep(1, { ...base, vehicle: "bike" }), {});
  assert.deepEqual(Object.keys(validateStep(1, { ...base, vehicle: "moto" })), [
    "cnh",
    "plate",
  ]);
  assert.deepEqual(
    validateStep(1, {
      ...base,
      vehicle: "car",
      cnh: "12345678901",
      plate: "ABC1D23",
    }),
    {},
  );
  assert.deepEqual(
    Object.keys(validateStep(1, { vehicle: "", cep: "123", shifts: [] })),
    ["vehicle", "cep", "shifts"],
  );
  assert.match(
    validateStep(1, { ...base, vehicle: "bike", cepNotFound: true }).cep,
    /Não encontramos/,
  );
});
