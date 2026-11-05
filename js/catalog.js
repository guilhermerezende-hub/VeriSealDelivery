import { $, esc, safe } from "./ui.js";

export function createCatalog({
  CATS,
  PRODUCTS,
  catName,
  matches,
  pct,
  fullName,
  cardHTML,
}) {
  const filter = { cat: "all", brand: null, q: "", sort: "relevance" };
  const catFilter = $("#catFilter"),
    brandRow = $("#brandRow"),
    grid = $("#productGrid");
  const catalogSearch = $("#catalogSearch"),
    sortSelect = $("#sortSelect");
  function renderChips() {
    catFilter.innerHTML = [{ id: "all", name: "Todas" }, ...CATS]
      .map(
        (c) =>
          `<button class="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-[14px] font-semibold text-fg transition-colors duration-200 hover:border-fg-3 aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white" type="button" data-chip="${c.id}" aria-pressed="${filter.cat === c.id}">${esc(c.name)}</button>`,
      )
      .join("");
  }
  function renderBrands() {
    const brands =
      filter.cat === "all" || filter.cat === "kits"
        ? []
        : [
            ...new Set(
              PRODUCTS.filter((p) => p.category === filter.cat).map(
                (p) => p.brand,
              ),
            ),
          ];
    brandRow.hidden = brands.length < 2;
    if (brandRow.hidden) {
      brandRow.innerHTML = "";
      return;
    }
    brandRow.innerHTML =
      `<span class="mr-1 text-[14px] text-fg-2">Marcas:</span>` +
      [null, ...brands]
        .map(
          (b) =>
            `<button class="border-b-2 border-transparent py-1 text-[14px] font-bold tracking-[-.01em] text-fg-3 transition-colors duration-200 hover:text-fg aria-pressed:border-accent aria-pressed:text-accent" type="button" data-brand="${esc(b || "")}" aria-pressed="${filter.brand === b}">${esc(b || "Todas")}</button>`,
        )
        .join("");
  }
  function listProducts() {
    const arr = PRODUCTS.filter(
      (p) =>
        (filter.cat === "all" || p.category === filter.cat) &&
        (!filter.brand || p.brand === filter.brand) &&
        (!filter.q || matches(p, filter.q)),
    );
    const by = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      discount: (a, b) => pct(b) - pct(a),
      name: (a, b) => fullName(a).localeCompare(fullName(b), "pt-BR"),
    }[filter.sort];
    return by ? arr.sort(by) : arr;
  }
  function renderCatalog() {
    const arr = listProducts();
    grid.innerHTML = arr.map(cardHTML).join("");
    const n = arr.length;
    $("#resultCount").textContent =
      `${n} ${n === 1 ? "item" : "itens"}${filter.cat !== "all" ? " em " + catName[filter.cat] : ""}${filter.brand ? " · " + filter.brand : ""}${filter.q ? ` para “${filter.q}”` : ""}`;
    $("#emptyState").hidden = n > 0;
  }
  function setFilter(patch) {
    if ("cat" in patch && !("brand" in patch)) patch.brand = null;
    Object.assign(filter, patch);
    if (catalogSearch.value !== filter.q) catalogSearch.value = filter.q;
    renderChips();
    renderBrands();
    renderCatalog();
  }
  safe("catalog", () => {
    catFilter.addEventListener("click", (e) => {
      const b = e.target.closest("[data-chip]");
      if (b) setFilter({ cat: b.dataset.chip });
    });
    brandRow.addEventListener("click", (e) => {
      const b = e.target.closest("[data-brand]");
      if (b) setFilter({ brand: b.dataset.brand || null });
    });
    let t = 0;
    catalogSearch.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => setFilter({ q: catalogSearch.value.trim() }), 160);
    });
    sortSelect.addEventListener("change", () =>
      setFilter({ sort: sortSelect.value }),
    );
    $("#clearFilters").addEventListener("click", () => {
      sortSelect.value = "relevance";
      setFilter({ cat: "all", brand: null, q: "", sort: "relevance" });
    });
    setFilter({});
  });

  return { setFilter };
}
