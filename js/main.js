/* ECO MIRAI — site behaviour: language switching, mobile nav, scroll effects */
(function () {
  "use strict";

  var STORAGE_KEY = "ecomirai.lang";
  var dict = window.ECOMIRAI_I18N || {};

  /* ---------- Language ---------- */
  function applyLanguage(lang) {
    var table = dict[lang];
    if (!table) return;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = table[el.getAttribute("data-i18n")];
      if (value !== undefined) el.textContent = value;
    });

    /* Textos que vivem em atributos (alt de imagem, aria-label de botão) */
    [["data-i18n-alt", "alt"], ["data-i18n-aria", "aria-label"]].forEach(function (pair) {
      document.querySelectorAll("[" + pair[0] + "]").forEach(function (el) {
        var value = table[el.getAttribute(pair[0])];
        if (value !== undefined) el.setAttribute(pair[1], value);
      });
    });

    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";

    /* Cada pagina declara <body data-page="..."> para receber seu proprio
       title/description; sem isso todas as paginas herdariam o mesmo texto. */
    var page = document.body.getAttribute("data-page") || "home";
    var title = table["meta." + page + ".title"];
    var descText = table["meta." + page + ".desc"];
    if (title) document.title = title;

    var desc = document.querySelector('meta[name="description"]');
    if (desc && descText) desc.setAttribute("content", descText);

    document.querySelectorAll(".langswitch__btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.lang === lang);
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage unavailable */ }
  }

  function initialLanguage() {
    var stored;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { stored = null; }
    if (stored && dict[stored]) return stored;
    return (navigator.language || "pt").toLowerCase().indexOf("pt") === 0 ? "pt" : "en";
  }

  document.querySelectorAll(".langswitch__btn").forEach(function (btn) {
    btn.addEventListener("click", function () { applyLanguage(btn.dataset.lang); });
  });

  applyLanguage(initialLanguage());

  /* ---------- Mobile navigation ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Menus suspensos ---------- */
  var groups = Array.prototype.slice.call(document.querySelectorAll(".nav__item--has-menu"));
  var hoverTimer = null;

  function isDesktopNav() {
    return window.matchMedia("(min-width: 861px)").matches;
  }

  function setGroup(group, open) {
    group.querySelector(".nav__toggle").setAttribute("aria-expanded", String(open));
    group.querySelector(".nav__menu").classList.toggle("is-open", open);
  }

  function closeGroups(except) {
    groups.forEach(function (g) { if (g !== except) setGroup(g, false); });
  }

  groups.forEach(function (group) {
    var toggle = group.querySelector(".nav__toggle");

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      closeGroups(group);
      setGroup(group, !open);
    });

    /* No desktop tambem abre ao passar o mouse; o atraso ao sair evita que o
       menu feche quando o ponteiro cruza a borda entre o botao e o painel. */
    group.addEventListener("mouseenter", function () {
      if (!isDesktopNav()) return;
      window.clearTimeout(hoverTimer);
      closeGroups(group);
      setGroup(group, true);
    });

    group.addEventListener("mouseleave", function () {
      if (!isDesktopNav()) return;
      hoverTimer = window.setTimeout(function () { setGroup(group, false); }, 180);
    });

    group.querySelectorAll(".nav__menu a").forEach(function (link) {
      link.addEventListener("click", function () { setGroup(group, false); });
    });
  });

  if (groups.length) {
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      groups.forEach(function (g) {
        if (g.querySelector(".nav__toggle").getAttribute("aria-expanded") !== "true") return;
        setGroup(g, false);
        g.querySelector(".nav__toggle").focus();
      });
    });

    document.addEventListener("click", function (event) {
      var navRoot = document.getElementById("nav");
      if (navRoot && !navRoot.contains(event.target)) closeGroups(null);
    });

    /* Ao cruzar o breakpoint, o estado do menu anterior nao faz mais sentido */
    window.addEventListener("resize", function () { closeGroups(null); });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.getElementById("header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Galeria: lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var shots = Array.prototype.slice.call(document.querySelectorAll(".gallery .shot"));

  if (lightbox && shots.length) {
    var lbImg = document.getElementById("lightboxImg");
    var lbCaption = document.getElementById("lightboxCaption");
    var lbClose = lightbox.querySelector('[data-lb="close"]');
    var current = 0;
    var lastFocus = null;
    var hideTimer = null;

    var showShot = function (index) {
      current = (index + shots.length) % shots.length;
      var img = shots[current].querySelector("img");
      var caption = shots[current].querySelector("figcaption");
      lbImg.src = img.getAttribute("src");
      lbImg.alt = img.getAttribute("alt") || "";
      lbCaption.textContent = caption ? caption.textContent : "";
    };

    var openLightbox = function (index) {
      window.clearTimeout(hideTimer);
      lastFocus = document.activeElement;
      showShot(index);
      lightbox.hidden = false;
      document.body.classList.add("is-locked");
      window.requestAnimationFrame(function () { lightbox.classList.add("is-open"); });
      lbClose.focus();
    };

    var closeLightbox = function () {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      hideTimer = window.setTimeout(function () { lightbox.hidden = true; }, 300);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    shots.forEach(function (shot, index) {
      var trigger = shot.querySelector(".shot__btn");
      if (trigger) trigger.addEventListener("click", function () { openLightbox(index); });
    });

    lightbox.addEventListener("click", function (event) {
      var action = event.target.closest ? event.target.closest("[data-lb]") : null;
      if (action) {
        var kind = action.getAttribute("data-lb");
        if (kind === "close") closeLightbox();
        if (kind === "prev") showShot(current - 1);
        if (kind === "next") showShot(current + 1);
        return;
      }
      /* clique no fundo escuro fecha */
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;

      if (event.key === "Escape") { closeLightbox(); return; }
      if (event.key === "ArrowLeft") { showShot(current - 1); return; }
      if (event.key === "ArrowRight") { showShot(current + 1); return; }

      /* Mantém o Tab preso ao diálogo enquanto ele estiver aberto */
      if (event.key !== "Tab") return;
      var focusable = lightbox.querySelectorAll("button");
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!lightbox.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var targets = document.querySelectorAll(
    ".sec-head, .about__text, .about__card, .vm__card, .value, .area, .sol-grid li, .shot, .kerui__text, .kerui__panel, .twocol > div, .dept, .contact__info"
  );

  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  targets.forEach(function (el, index) {
    el.classList.add("reveal");
    el.style.transitionDelay = (index % 6) * 60 + "ms";
    observer.observe(el);
  });
})();
