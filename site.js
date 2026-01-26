(function () {
  async function loadFragment(selector, url, position) {
    const res = await fetch(url, { cache: "no-store" });
    const html = await res.text();
    document.body.insertAdjacentHTML(position, `<div data-fragment="${selector}">${html}</div>`);
  }

  function normalizePath(pathname) {
    const p = pathname.split("?")[0].split("#")[0];
    const base = p.substring(p.lastIndexOf("/") + 1) || "index.html";
    return base.toLowerCase();
  }

  function setActiveNav() {
    const current = normalizePath(window.location.pathname);

    const links = document.querySelectorAll('[data-nav]');
    links.forEach((a) => {
      const target = (a.getAttribute("data-nav") || "").toLowerCase();
      if (target === current) {
        a.classList.add("is-active");
        a.setAttribute("aria-current", "page");
      } else {
        a.classList.remove("is-active");
        a.removeAttribute("aria-current");
      }
    });
  }

  function initMobileMenu() {
    const toggle = document.getElementById("menuToggle");
    const overlay = document.getElementById("mobileOverlay");
    const closeBtn = document.getElementById("menuClose");

    if (!toggle || !overlay || !closeBtn) return;

    function openMenu() {
      overlay.classList.add("is-open");
      document.body.classList.add("menu-open");
      toggle.setAttribute("aria-expanded", "true");
      overlay.setAttribute("aria-hidden", "false");
    }

    function closeMenu() {
      overlay.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      overlay.setAttribute("aria-hidden", "true");
    }

    function isOpen() {
      return overlay.classList.contains("is-open");
    }

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      isOpen() ? closeMenu() : openMenu();
    });

    closeBtn.addEventListener("click", () => closeMenu());

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) closeMenu();
    });

    overlay.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => closeMenu());
    });
  }

  function initCardScrollIn() {
    const cards = document.querySelectorAll(".image-card");
    if (!cards.length) return;

    if (!("IntersectionObserver" in window)) {
      cards.forEach(c => c.classList.add("is-visible"));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    cards.forEach(c => obs.observe(c));
  }

  async function init() {
    // load header/footer first to avoid flash and to ensure menu works
    await loadFragment("header", "header.html", "afterbegin");
    await loadFragment("footer", "footer.html", "beforeend");

    setActiveNav();
    initMobileMenu();
    initCardScrollIn();

    // reveal page after fragments are in place
    document.body.classList.add("site-ready");
  }

  init().catch(() => {
    // Fail open: show page even if fragments fail to load
    document.body.classList.add("site-ready");
  });
})();
