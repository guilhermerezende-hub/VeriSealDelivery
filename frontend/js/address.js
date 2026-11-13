import { $, esc, safe, setState } from "./ui.js";
import { store } from "./storage.js";
import {
  fmtCep,
  placeLabel,
  lookupCep,
  deliveryMsg,
  restoreAddress,
} from "./delivery.js";

export function createAddressController({
  isBagOpen,
  renderBag,
  openLayer,
  closeLayer,
}) {
  const pending = new WeakMap();
  let addr = restoreAddress(store.get("addr", null));
  function setAddr(a) {
    addr = a;
    store.set("addr", a);
    updateAddrUI();
  }
  function updateAddrUI() {
    $("#locText").innerHTML = addr
      ? `Entregar em <b class="text-fg">${esc(placeLabel(addr))}</b>`
      : "Consultar endereço";
    $("#heroCepForm").classList.toggle("has-cep", !!addr);
    const info = $("#heroCepInfo");
    if (addr) {
      info.textContent = deliveryMsg(addr);
      setState(info, "ok");
      $("#heroCep").value = addr.cep;
    }
    if (isBagOpen()) renderBag();
  }
  function maskCep(input) {
    input.addEventListener("input", () => {
      input.value = fmtCep(input.value);
      input.classList.remove("invalid");
    });
  }
  async function submitCep(input, info) {
    setState(info, "");
    info.textContent = "Consultando o CEP…";
    const requestedValue = input.value;
    const request = Symbol();
    pending.set(input, request);
    const r = await lookupCep(requestedValue);
    if (pending.get(input) !== request || input.value !== requestedValue)
      return null;
    if (r.error) {
      info.textContent = r.error;
      setState(info, "err");
      input.classList.add("invalid");
      input.focus();
      return null;
    }
    setAddr(r);
    info.textContent = deliveryMsg(r);
    setState(info, "ok");
    return r;
  }

  safe("cep", () => {
    const heroIn = $("#heroCep"),
      addrIn = $("#addrCep");
    maskCep(heroIn);
    maskCep(addrIn);
    $("#heroCepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      submitCep(heroIn, $("#heroCepInfo"));
    });
    $("#addrForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const r = await submitCep(addrIn, $("#addrInfo"));
      if (r) setTimeout(() => closeLayer($("#addressSheet")), 1100);
    });
    updateAddrUI();
  });
  function openAddress() {
    const input = $("#addrCep"),
      info = $("#addrInfo");
    input.value = addr ? addr.cep : "";
    info.textContent = addr ? deliveryMsg(addr) : "";
    setState(info, addr ? "ok" : "");
    openLayer($("#addressSheet"), input);
  }

  return {
    get address() {
      return addr;
    },
    setAddr,
    openAddress,
    maskCep,
    submitCep,
  };
}
