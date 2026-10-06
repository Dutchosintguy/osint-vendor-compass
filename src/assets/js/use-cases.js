(function () {
  const select = document.querySelector("[data-use-filter]");
  if (!select) return;
  const sections = Array.from(document.querySelectorAll("[data-use-section]"));

  function apply() {
    const value = select.value;
    sections.forEach(function (section) {
      section.hidden = Boolean(value) && section.dataset.useSection !== value;
    });
  }

  select.addEventListener("change", apply);

  const hash = window.location.hash.replace("#", "");
  if (hash) {
    const match = sections.find(function (section) {
      return section.id === hash;
    });
    if (match) {
      select.value = match.dataset.useSection;
      apply();
    }
  }
})();
