(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasIO = "IntersectionObserver" in window;

  // ---- Nav: transparente sobre o convite, sólida depois dele ou com o menu aberto ----
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  const backToTop = document.getElementById("back-to-top");
  const invite = document.querySelector(".invite");
  let pastTop = false;
  let pastInvite = false;

  const syncChrome = () => {
    const menuOpen = links && links.classList.contains("is-open");
    if (nav) nav.classList.toggle("is-solid", pastTop || menuOpen);
    if (backToTop) backToTop.classList.toggle("is-visible", pastInvite);
  };

  // Sentinela no topo e o próprio convite substituem um listener de scroll.
  if (hasIO) {
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none";
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry]) => {
      pastTop = !entry.isIntersecting;
      syncChrome();
    }).observe(sentinel);
    if (invite) {
      new IntersectionObserver(([entry]) => {
        pastInvite = !entry.isIntersecting;
        syncChrome();
      }).observe(invite);
    }
  }

  // ---- Menu mobile ----
  if (toggle && links) {
    const setMenu = (open) => {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.innerHTML = open
        ? '<svg class="icon"><use href="#i-close"/></svg>'
        : '<svg class="icon"><use href="#i-menu"/></svg>';
      syncChrome();
    };
    toggle.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
    links.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  }

  if (backToTop) {
    backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // ---- Títulos das seções: cada palavra em .w (mesmo flip-up da página Code) ----
  const splitWords = (node, counter) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            const w = document.createElement("span");
            w.className = "w";
            w.style.setProperty("--i", counter.i++);
            w.textContent = part;
            frag.appendChild(w);
          }
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        splitWords(child, counter);
      }
    });
  };

  if (!reduceMotion) {
    document.querySelectorAll("main section:not(.invite):not(.signup) h2").forEach((h2) => {
      splitWords(h2, { i: 0 });
      h2.classList.add("split");
    });
  }

  // ---- Reveal no scroll ----
  const revealEls = document.querySelectorAll(".reveal, .split");
  if (reduceMotion || !hasIO) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  // ---- Ficha do agente: passar o mouse (ou focar) numa pergunta sublinha a palavra dela na frase ----
  const spec = document.querySelector(".spec");
  if (spec) {
    const kws = Array.from(spec.querySelectorAll(".kw"));
    const mark = (id) => kws.forEach((kw) => kw.classList.toggle("is-hot", kw.dataset.kw === id));
    spec.querySelectorAll(".spec-item").forEach((item) => {
      const id = item.dataset.kw;
      item.addEventListener("mouseenter", () => mark(id));
      item.addEventListener("mouseleave", () => mark(null));
      item.addEventListener("focus", () => mark(id));
      item.addEventListener("blur", () => mark(null));
    });
  }
})();
