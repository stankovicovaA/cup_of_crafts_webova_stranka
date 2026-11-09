const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const searchForm = document.querySelector(".site-search");
const searchInput = document.querySelector("#site-search-input");
const searchStatus = document.querySelector("#search-status");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Otvoriť navigáciu" : "Zatvoriť navigáciu");
    mainNav.classList.toggle("is-open", !isOpen);
  });

  mainNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Otvoriť navigáciu");
      mainNav.classList.remove("is-open");
    }
  });
}

if (searchForm && searchInput && searchStatus) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim().toLocaleLowerCase("sk");
    const sections = [...document.querySelectorAll(".searchable")];

    sections.forEach((section) => section.removeAttribute("data-search-match"));

    if (!query) {
      searchStatus.textContent = "Zadaj výraz, ktorý chceš na stránke nájsť.";
      searchInput.focus();
      return;
    }

    const match = sections.find((section) =>
      section.textContent.toLocaleLowerCase("sk").includes(query)
    );

    if (!match) {
      searchStatus.textContent = `Výraz „${searchInput.value.trim()}“ sa na stránke nenašiel.`;
      return;
    }

    match.setAttribute("data-search-match", "true");
    match.scrollIntoView({ behavior: "smooth", block: "center" });
    searchStatus.textContent = `Nájdené: ${match.querySelector("h1, h2")?.textContent ?? "sekcia stránky"}.`;
  });

  searchInput.addEventListener("input", () => {
    document.querySelectorAll("[data-search-match]").forEach((section) =>
      section.removeAttribute("data-search-match")
    );
    searchStatus.textContent = "";
  });
}