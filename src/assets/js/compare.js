(function () {
  const form = document.querySelector("[data-filters]");
  const table = document.querySelector("[data-compare]");
  if (!form || !table) return;

  const items = Array.from(document.querySelectorAll(".compare-item"));
  const count = document.querySelector("[data-count]");
  const empty = document.querySelector("[data-empty]");
  const tbody = table.querySelector("tbody");
  const cardList = document.querySelector("[data-cards]");
  const aggButtons = Array.from(document.querySelectorAll("[data-sector]"));
  const state = { key: "name", dir: "asc" };
  const sanctionsOrder = { unknown: 0, low: 1, medium: 2, high: 3 };

  function asNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : -1;
  }

  function sectorCounts(item) {
    const counts = {};
    (item.dataset.sectorList || "")
      .split(",")
      .filter(Boolean)
      .forEach(function (id) {
        counts[id] = (counts[id] || 0) + 1;
      });
    return counts;
  }

  function matches(item) {
    const query = form.q.value.trim().toLowerCase();
    const haystack = [item.dataset.name, item.dataset.buyers, item.dataset.products]
      .join(" ")
      .toLowerCase();
    const categories = (item.dataset.categories || "").split(" ").filter(Boolean);
    const uses = (item.dataset.uses || "").split(" ").filter(Boolean);
    const sectors = (item.dataset.sectors || "").split(" ").filter(Boolean);

    return (
      (!query || haystack.includes(query)) &&
      (!form.category.value || categories.includes(form.category.value)) &&
      (!form.country.value || item.dataset.country === form.country.value) &&
      (!form.use.value || uses.includes(form.use.value)) &&
      (!form.sector.value || sectors.includes(form.sector.value)) &&
      (!form.sanctions.value || item.dataset.sanctions === form.sanctions.value) &&
      asNumber(item.dataset.transparency) >= asNumber(form.minTransparency.value) &&
      asNumber(item.dataset.financial) >= asNumber(form.minFinancial.value) &&
      asNumber(item.dataset.opsec) >= asNumber(form.minOpsec.value)
    );
  }

  function compareItems(a, b) {
    const key = state.key;
    let result = 0;
    if (key === "name" || key === "country") {
      result = (a.dataset[key] || "").localeCompare(b.dataset[key] || "", "en");
    } else if (key === "sanctions") {
      result = (sanctionsOrder[a.dataset.sanctions] ?? 0) - (sanctionsOrder[b.dataset.sanctions] ?? 0);
    } else {
      result = asNumber(a.dataset[key]) - asNumber(b.dataset[key]);
    }
    return state.dir === "asc" ? result : -result;
  }

  function apply() {
    const visibleRows = [];
    items.forEach(function (item) {
      const show = matches(item);
      item.hidden = !show;
      if (show && item.tagName === "TR") visibleRows.push(item);
    });

    items
      .filter(function (item) {
        return item.tagName === "TR";
      })
      .sort(compareItems)
      .forEach(function (row) {
        tbody.appendChild(row);
      });

    if (cardList) {
      items
        .filter(function (item) {
          return item.tagName !== "TR";
        })
        .sort(compareItems)
        .forEach(function (card) {
          cardList.appendChild(card);
        });
    }

    if (count) {
      count.textContent = visibleRows.length + (visibleRows.length === 1 ? " vendor" : " vendors");
    }
    if (empty) empty.hidden = visibleRows.length !== 0;

    const totals = {};
    visibleRows.forEach(function (row) {
      const counts = sectorCounts(row);
      Object.keys(counts).forEach(function (id) {
        if (!totals[id]) totals[id] = { customers: 0, vendors: 0 };
        totals[id].customers += counts[id];
        totals[id].vendors += 1;
      });
    });

    aggButtons.forEach(function (button) {
      const id = button.dataset.sector;
      const stat = totals[id] || { customers: 0, vendors: 0 };
      const row = button.closest("tr");
      const customerCell = row && row.querySelector("[data-agg-customers]");
      const vendorCell = row && row.querySelector("[data-agg-vendors]");
      if (customerCell) customerCell.textContent = String(stat.customers);
      if (vendorCell) vendorCell.textContent = String(stat.vendors);
      const pressed = form.sector.value === id;
      button.setAttribute("aria-pressed", pressed ? "true" : "false");
      if (row) row.classList.toggle("is-active", pressed);
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });
  form.addEventListener("input", apply);
  form.addEventListener("reset", function () {
    window.requestAnimationFrame(apply);
  });

  aggButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      form.sector.value = form.sector.value === button.dataset.sector ? "" : button.dataset.sector;
      apply();
    });
  });

  table.querySelectorAll("th button[data-sort]").forEach(function (button) {
    button.addEventListener("click", function () {
      const key = button.dataset.sort;
      if (state.key === key) {
        state.dir = state.dir === "asc" ? "desc" : "asc";
      } else {
        state.key = key;
        state.dir = key === "name" || key === "country" ? "asc" : "desc";
      }
      table.querySelectorAll("th").forEach(function (header) {
        header.removeAttribute("aria-sort");
      });
      const header = button.closest("th");
      if (header) header.setAttribute("aria-sort", state.dir === "asc" ? "ascending" : "descending");
      apply();
    });
  });

  apply();
})();
