import test from "node:test";
import assert from "node:assert/strict";
import {
  SEAL_CODE_RE,
  brDate,
  brDateTime,
  brWhen,
  formatPhone,
  formatSealCode,
  isoDate,
  isoDateTime,
  parseLocal,
  randomSealCode,
  sealFromApi,
} from "../../js/records.js";
import { API_LOCAL_URL, apiUrl } from "../../js/config.js";

test("código do lacre é formatado enquanto se digita e sorteado no padrão", () => {
  assert.equal(formatSealCode("vs7k2m9qxa"), "VS-7K2M-9QXA");
  assert.equal(formatSealCode(" vs-7k2m "), "VS-7K2M");
  assert.equal(formatSealCode("7K2M9QXA99"), "VS-7K2M-9QXA");
  assert.equal(formatSealCode(""), "");
  for (let i = 0; i < 50; i++) assert.match(randomSealCode(), SEAL_CODE_RE);
  assert.equal(
    randomSealCode(() => 0),
    "VS-AAAA-AAAA",
  );
});

test("celular ganha DDD e hífen", () => {
  assert.equal(formatPhone("11987654321"), "(11) 98765-4321");
  assert.equal(formatPhone("1132654321"), "(11) 3265-4321");
  assert.equal(formatPhone("11"), "(11");
  assert.equal(formatPhone(""), "");
});

test("datas da API são lidas sem fuso, como o MySQL guarda", () => {
  const d = new Date(2026, 10, 3, 9, 5, 7);
  assert.equal(isoDate(d), "2026-11-03");
  assert.equal(isoDateTime(d), "2026-11-03T09:05:07");
  assert.deepEqual(parseLocal("2026-11-03T09:05:07"), d);
  assert.equal(parseLocal("ontem"), null);
  assert.equal(brDate("2026-07-30"), "30/07/2026");
  assert.equal(brDateTime("2026-10-02T21:42:00"), "02/10/2026 · 21:42");
  const now = new Date(2026, 10, 13, 20, 0);
  assert.equal(brWhen("2026-11-13T18:30:00", now), "hoje · 18:30");
  assert.equal(brWhen("2026-11-12T19:30:00", now), "ontem · 19:30");
  assert.equal(brWhen("2026-11-01T08:00:00", now), "01/11/2026 · 08:00");
});

test("lacre da API vira o registro usado na tela de verificação", () => {
  const now = new Date(2026, 10, 13, 20, 0);
  assert.deepEqual(
    sealFromApi(
      {
        codigo: "VS-4HZP-1LCE",
        produtoId: "jw-black",
        lote: "L26-0730",
        fabricadoEm: "2026-07-30",
        status: "opened",
        enviadoEm: "2026-11-13T18:30:00",
        abertoEm: "2026-10-02T21:42:00",
        verificacoes: 7,
      },
      now,
    ),
    {
      product: "jw-black",
      status: "opened",
      lot: "L26-0730",
      made: "30/07/2026",
      checks: 7,
      sentAt: "hoje · 18:30",
      openedAt: "02/10/2026 · 21:42",
    },
  );
  const fresh = sealFromApi({ produtoId: "jack-7", status: "ok" }, now);
  assert.equal(fresh.checks, 0);
  assert.equal(fresh.sentAt, undefined);
});

test("API local no computador e endereço público na hospedagem", () => {
  assert.equal(apiUrl("127.0.0.1"), API_LOCAL_URL);
  assert.equal(apiUrl("localhost"), API_LOCAL_URL);
  assert.equal(apiUrl(""), API_LOCAL_URL);
  assert.equal(apiUrl("www.veriseal.com.br"), "");
});
