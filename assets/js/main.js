/* ==========================================================
   AL Importaciones — sitio público
   Lee data/content.json y pinta la página. Cada botón de compra
   abre WhatsApp con el pedido ya escrito.
   ========================================================== */
(function () {
  "use strict";

  /* ---------- Íconos (SVG en línea) ---------- */
  const ICONS = {
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
    left: '<path d="M15 18l-6-6 6-6"/>',
    right: '<path d="M9 18l6-6-6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    plane: '<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    truck: '<path d="M1 4h13v11H1zM14 8h4l4 4v3h-8z"/><circle cx="5.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    headset: '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M21 15a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2zM3 15a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2z"/><path d="M18 17v1a3 3 0 0 1-3 3h-3"/>',
    diamond: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M12 21L8 9l4-6 4 6z"/>',
    wave: '<path d="M2 12h2M6 8v8M10 4v16M14 7v10M18 9v6M22 12h-2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    spatial: '<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8"/>',
    touch: '<path d="M9 11V5a2 2 0 0 1 4 0v6"/><path d="M13 10a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.6-2.8L4 15.5a2 2 0 0 1 3-2.6L9 15"/>',
    bluetooth: '<path d="M7 7l10 10-5 5V2l5 5L7 17"/>',
    battery: '<rect x="6" y="4" width="12" height="18" rx="2"/><path d="M10 2h4M9 10h6M9 14h6M9 18h6"/>',
    drop: '<path d="M12 2.7l5.7 5.7a8 8 0 1 1-11.4 0z"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    watch: '<rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 6l1-4h4l1 4M9 18l1 4h4l1-4M12 9v3l2 1"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>',
    whatsapp: '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.1.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" fill="currentColor" stroke="none"/>'
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.star}</svg>`;

  /* ---------- Utilidades ---------- */
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const paragraphs = (s) =>
    String(s || "").split(/\n\s*\n/).filter(Boolean).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  const slug = (s) =>
    String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "producto";

  /* "89900" -> "$89.900"; un texto como "Desde $50.000" se deja igual. */
  function money(v) {
    const s = String(v == null ? "" : v).trim();
    if (!s) return "";
    const digits = s.replace(/[$\s.,]/g, "");
    if (/^\d+$/.test(digits)) return "$" + Number(digits).toLocaleString("es-CO");
    return s;
  }

  let C = null; // contenido
  const waNumber = () => String((C.site && C.site.whatsapp) || "").replace(/\D/g, "");
  /* Sin número configurado, wa.me deja elegir el contacto: el botón nunca queda roto. */
  const waLink = (text) => `https://wa.me/${waNumber()}${text ? "?text=" + encodeURIComponent(text) : ""}`;

  const productUrl = (p) => location.href.split("#")[0] + "#p/" + p._id;

  function buyText(p, qty = 1, option = "") {
    const tpl = C.site.buyMessage || "Hola 👋 Quiero comprar: {producto}{opcion} · Cantidad: {cantidad} · Precio: {precio}";
    const price = money(p.price);
    return tpl
      .replace(/\{producto\}/g, p.name + (p.subtitle ? ` – ${p.subtitle}` : ""))
      .replace(/\{opcion\}/g, option ? ` (${option})` : "")
      .replace(/\{cantidad\}/g, String(qty))
      .replace(/\{precio\}/g, price ? (qty > 1 && /^\$/.test(price) ? `${price} c/u` : price) : "a consultar")
      .replace(/\{enlace\}/g, productUrl(p));
  }
  const askText = (p) => `Hola 👋 Quiero saber si tienen disponible: ${p.name}${p.subtitle ? ` – ${p.subtitle}` : ""}.`;

  const products = () => (C.products || []).filter((p) => p && p.name);
  const firstImage = (p) => (p.images || []).find(Boolean) || C.site.logo;

  /* ---------- Cabecera ---------- */
  function renderHeader() {
    const spot = spotlightProduct();
    const links = [
      ["#productos", "Productos"],
      ...(spot ? [["#destacado", "Destacado"]] : []),
      ["#confianza", "Garantía"],
      ...(C.wholesale && C.wholesale.show ? [["#mayoristas", "Al por mayor"]] : [])
    ];
    const el = document.getElementById("site-header");
    el.innerHTML = `
      <div class="container">
        <a class="brand" href="#inicio" aria-label="${esc(C.site.name)} — inicio">
          <img src="${esc(C.site.logo)}" alt="" width="64" height="30">
          <span class="brand-text"><strong><span class="gold-text">${esc(C.site.name.split(" ")[0])}</span> ${esc(C.site.name.split(" ").slice(1).join(" "))}</strong><span>${esc(C.site.tagline)}</span></span>
        </a>
        <button class="menu-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav">${icon("menu")}</button>
        <nav class="nav" id="nav" aria-label="Principal">
          ${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}
          <a class="btn btn-gold btn-sm" href="${esc(waLink(C.site.askMessage))}" target="_blank" rel="noopener">${icon("whatsapp")} Escríbenos</a>
        </nav>
      </div>`;
    const toggle = el.querySelector(".menu-toggle");
    const nav = el.querySelector(".nav");
    const setOpen = (open) => {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      toggle.innerHTML = icon(open ? "close" : "menu");
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    const onScroll = () => el.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Secciones ---------- */
  function heroHtml() {
    const h = C.hero || {};
    return `
      <section class="hero" id="inicio">
        <div class="container hero-grid">
          <div class="hero-copy reveal">
            ${h.eyebrow ? `<p class="eyebrow">${esc(h.eyebrow)}</p>` : ""}
            ${h.script ? `<p class="script">${esc(h.script)}</p>` : ""}
            <h1>${esc(h.title)}</h1>
            ${h.text ? `<p class="lead">${esc(h.text)}</p>` : ""}
            <div class="hero-actions">
              <a class="btn btn-gold" href="#productos">${esc(h.button || "Ver productos")} ${icon("arrow")}</a>
              <a class="btn btn-outline" href="${esc(waLink(C.site.askMessage))}" target="_blank" rel="noopener">${icon("whatsapp")} WhatsApp</a>
            </div>
          </div>
          ${h.image ? `<div class="hero-media reveal"><img src="${esc(h.image)}" alt="Productos de ${esc(C.site.name)}" width="1600" height="900"></div>` : ""}
        </div>
      </section>`;
  }

  function benefitsHtml() {
    const items = (C.benefits || []).filter((b) => b.title);
    if (!items.length) return "";
    return `
      <section class="benefits" aria-label="Beneficios">
        <div class="container benefits-row">
          ${items.map((b) => `<div class="benefit">${icon(b.icon)}<span>${esc(b.title)}</span></div>`).join("")}
        </div>
      </section>`;
  }

  function priceHtml(p, cls = "") {
    const price = money(p.price);
    const old = money(p.oldPrice);
    if (!price) return `<p class="price ${cls}"><span class="ask">Consultar precio</span></p>`;
    return `<p class="price ${cls}">${old ? `<s>${esc(old)}</s>` : ""}<strong>${esc(price)}</strong></p>`;
  }

  function cardHtml(p) {
    const soldOut = p.available === false;
    return `
      <article class="product-card reveal${soldOut ? " sold-out" : ""}" data-cat="${esc(p.category || "")}">
        <a class="product-media" href="#p/${esc(p._id)}" aria-label="Ver ${esc(p.name)}">
          <img src="${esc(firstImage(p))}" alt="${esc(p.name)}" loading="lazy">
          ${soldOut ? '<span class="badge badge-dark">Agotado</span>' : p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
        </a>
        <div class="product-body">
          ${p.category ? `<p class="product-cat">${esc(p.category)}</p>` : ""}
          <h3><a href="#p/${esc(p._id)}">${esc(p.name)}</a></h3>
          ${p.subtitle ? `<p class="product-sub">${esc(p.subtitle)}</p>` : ""}
          ${priceHtml(p)}
          <div class="product-actions">
            <a class="btn btn-outline btn-sm" href="#p/${esc(p._id)}">Ver detalles</a>
            ${soldOut
              ? `<a class="btn btn-ghost btn-sm" href="${esc(waLink(askText(p)))}" target="_blank" rel="noopener">${icon("whatsapp")} Preguntar</a>`
              : `<a class="btn btn-gold btn-sm" href="${esc(waLink(buyText(p)))}" target="_blank" rel="noopener">${icon("whatsapp")} Comprar</a>`}
          </div>
        </div>
      </article>`;
  }

  function catalogHtml() {
    const list = products();
    const cats = [...new Set(list.map((p) => (p.category || "").trim()).filter(Boolean))];
    const cat = C.catalog || {};
    return `
      <section class="section" id="productos">
        <div class="container">
          <header class="section-head reveal">
            ${cat.eyebrow ? `<p class="eyebrow">${esc(cat.eyebrow)}</p>` : ""}
            <h2>${esc(cat.title || "Productos")}</h2>
            ${cat.text ? `<p class="lead">${esc(cat.text)}</p>` : ""}
          </header>
          ${cats.length > 1 ? `
          <div class="chips" role="group" aria-label="Filtrar por categoría">
            <button type="button" class="chip" aria-pressed="true" data-cat="">Todos</button>
            ${cats.map((c) => `<button type="button" class="chip" aria-pressed="false" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}
          </div>` : ""}
          <div class="product-grid">
            ${list.length ? list.map(cardHtml).join("") : '<p class="empty">Pronto publicaremos nuestros productos. Escríbenos por WhatsApp.</p>'}
          </div>
        </div>
      </section>`;
  }

  function spotlightProduct() {
    if (!C.spotlight || !C.spotlight.show) return null;
    return products().find((p) => p.featured) || null;
  }

  function spotlightHtml() {
    const p = spotlightProduct();
    if (!p) return "";
    const s = C.spotlight;
    const feats = (p.features || []).filter((f) => f.title);
    const hl = (p.highlights || []).filter((x) => x.title || x.image);
    const price = money(p.price);
    return `
      <section class="section spotlight" id="destacado">
        <div class="container">
          <div class="spot-grid">
            <div class="spot-main reveal">
              ${s.script ? `<p class="script">${esc(s.script)}</p>` : ""}
              ${p.category ? `<p class="eyebrow">${esc(p.category)}</p>` : ""}
              <h2 class="spot-title">${esc(p.name)}</h2>
              ${p.subtitle ? `<p class="spot-sub">${esc(p.subtitle)}</p>` : ""}
              ${p.description ? `<div class="spot-desc">${paragraphs(p.description)}</div>` : ""}
              <div class="spot-media">
                <img src="${esc(firstImage(p))}" alt="${esc(p.name)}" loading="lazy">
              </div>
              <div class="spot-buy">
                <div class="price-tag">
                  <span>${esc(p.badge || (price ? "Precio" : ""))}</span>
                  <strong>${esc(price || "Consulta el precio")}</strong>
                </div>
                <div class="spot-buy-actions">
                  <a class="btn btn-gold" href="${esc(waLink(buyText(p)))}" target="_blank" rel="noopener">${icon("whatsapp")} ¡Lo quiero!</a>
                  <a class="btn btn-outline" href="#p/${esc(p._id)}">Ver fotos</a>
                </div>
                ${s.secondScript ? `<p class="script small">${esc(s.secondScript)}</p>` : ""}
              </div>
            </div>
            ${feats.length ? `
            <ul class="feature-list reveal">
              ${feats.map((f) => `<li>${icon(f.icon)}<div><strong>${esc(f.title)}</strong>${f.text ? `<span>${esc(f.text)}</span>` : ""}</div></li>`).join("")}
            </ul>` : ""}
          </div>
          ${hl.length ? `
          <div class="highlights">
            ${hl.map((x) => `
              <figure class="highlight reveal">
                ${x.image ? `<img src="${esc(x.image)}" alt="" loading="lazy">` : ""}
                <figcaption><strong>${esc(x.title)}</strong>${x.text ? `<span>${esc(x.text)}</span>` : ""}</figcaption>
              </figure>`).join("")}
          </div>` : ""}
        </div>
      </section>`;
  }

  function trustHtml() {
    const t = C.trust || {};
    const items = (t.items || []).filter((x) => x.title);
    if (!items.length) return "";
    return `
      <section class="section trust" id="confianza">
        <div class="container">
          <div class="trust-grid">
            ${items.map((x) => `
              <div class="trust-item reveal">
                <span class="ring">${icon(x.icon)}</span>
                <strong>${esc(x.title)}</strong>
                ${x.text ? `<span>${esc(x.text)}</span>` : ""}
              </div>`).join("")}
          </div>
          ${t.slogan ? `<p class="slogan reveal"><span>${esc(t.slogan)}</span></p>` : ""}
        </div>
      </section>`;
  }

  function wholesaleHtml() {
    const w = C.wholesale;
    if (!w || !w.show) return "";
    return `
      <section class="section wholesale" id="mayoristas">
        <div class="container">
          <div class="wholesale-card reveal">
            <div>
              ${w.script ? `<p class="script">${esc(w.script)}</p>` : ""}
              <h2>${esc(w.title)}</h2>
              ${w.text ? `<p class="lead">${esc(w.text)}</p>` : ""}
            </div>
            <a class="btn btn-gold" href="${esc(waLink(w.message || C.site.askMessage))}" target="_blank" rel="noopener">${icon("whatsapp")} ${esc(w.button || "Escríbenos")}</a>
          </div>
        </div>
      </section>`;
  }

  function renderFooter() {
    const s = C.site;
    document.getElementById("site-footer").innerHTML = `
      <div class="site-footer">
        <div class="container footer-grid">
          <div class="footer-brand">
            <img src="${esc(s.logo)}" alt="${esc(s.name)}" width="120" height="56">
            <p>${esc(s.description)}</p>
          </div>
          <div class="footer-links">
            ${s.instagram ? `<a href="${esc(s.instagram)}" target="_blank" rel="noopener">${icon("instagram")} ${esc(s.instagramHandle || "Instagram")}</a>` : ""}
            <a href="${esc(waLink(s.askMessage))}" target="_blank" rel="noopener">${icon("whatsapp")} Escríbenos y asegura el tuyo</a>
            ${s.footerText ? `<p>${icon("plane")} ${esc(s.footerText)}</p>` : ""}
          </div>
        </div>
        <div class="container footer-bottom">
          <span>© ${new Date().getFullYear()} ${esc(s.name)}</span>
          <a href="admin.html">Administrar</a>
        </div>
      </div>
      <a class="wa-float" href="${esc(waLink(s.askMessage))}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">${icon("whatsapp")}</a>`;
  }

  /* ---------- Filtro por categoría ---------- */
  function bindChips() {
    const chips = document.querySelectorAll(".chip");
    chips.forEach((chip) => chip.addEventListener("click", () => {
      const cat = chip.dataset.cat;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      document.querySelectorAll(".product-card").forEach((card) => {
        card.hidden = !!cat && card.dataset.cat !== cat;
      });
    }));
  }

  /* ---------- Detalle del producto (ventana) ---------- */
  let lastFocus = null;
  function openProduct(id) {
    const p = products().find((x) => x._id === id);
    if (!p) return closeProduct();
    const imgs = (p.images || []).filter(Boolean);
    if (!imgs.length) imgs.push(firstImage(p));
    const opts = (p.options || []).filter(Boolean);
    const feats = (p.features || []).filter((f) => f.title);
    const soldOut = p.available === false;
    let current = 0, qty = 1;

    const root = document.getElementById("modal-root");
    lastFocus = lastFocus || document.activeElement;
    root.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-backdrop" data-close></div>
        <div class="modal-card">
          <button class="modal-close" type="button" aria-label="Cerrar" data-close>${icon("close")}</button>
          <div class="modal-gallery">
            <div class="modal-main">
              <img src="${esc(imgs[0])}" alt="${esc(p.name)}" id="modal-img">
              ${imgs.length > 1 ? `
                <button type="button" class="gal-nav prev" aria-label="Foto anterior">${icon("left")}</button>
                <button type="button" class="gal-nav next" aria-label="Foto siguiente">${icon("right")}</button>` : ""}
            </div>
            ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((src, i) => `<button type="button" class="thumb" data-i="${i}" aria-label="Foto ${i + 1}" aria-current="${i === 0}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
          </div>
          <div class="modal-info">
            ${p.category ? `<p class="product-cat">${esc(p.category)}</p>` : ""}
            <h2 id="modal-title">${esc(p.name)}</h2>
            ${p.subtitle ? `<p class="product-sub">${esc(p.subtitle)}</p>` : ""}
            ${soldOut ? '<span class="badge badge-dark static">Agotado</span>' : p.badge ? `<span class="badge static">${esc(p.badge)}</span>` : ""}
            ${priceHtml(p, "big")}
            ${p.description ? `<div class="modal-desc">${paragraphs(p.description)}</div>` : ""}
            ${!soldOut && opts.length ? `
              <label class="field"><span>Opción</span>
                <select id="modal-opt">${opts.map((o) => `<option>${esc(o)}</option>`).join("")}</select>
              </label>` : ""}
            ${!soldOut ? `
              <div class="field"><span>Cantidad</span>
                <div class="qty">
                  <button type="button" data-q="-1" aria-label="Menos">${icon("minus")}</button>
                  <output id="modal-qty" aria-live="polite">1</output>
                  <button type="button" data-q="1" aria-label="Más">${icon("plus")}</button>
                </div>
              </div>` : ""}
            <a class="btn btn-gold btn-block" id="modal-buy" target="_blank" rel="noopener" href="#">${icon("whatsapp")} ${soldOut ? "Preguntar disponibilidad" : "Comprar por WhatsApp"}</a>
            <p class="modal-note">Se abrirá WhatsApp con tu pedido escrito. Solo pulsa <em>Enviar</em>.</p>
            ${feats.length ? `<ul class="feature-list compact">${feats.map((f) => `<li>${icon(f.icon)}<div><strong>${esc(f.title)}</strong>${f.text ? `<span>${esc(f.text)}</span>` : ""}</div></li>`).join("")}</ul>` : ""}
          </div>
        </div>
      </div>`;
    document.body.classList.add("no-scroll");

    const modal = root.querySelector(".modal");
    const img = modal.querySelector("#modal-img");
    const buy = modal.querySelector("#modal-buy");
    const updateBuy = () => {
      const opt = modal.querySelector("#modal-opt");
      buy.href = waLink(soldOut ? askText(p) : buyText(p, qty, opt ? opt.value : ""));
    };
    const show = (i) => {
      current = (i + imgs.length) % imgs.length;
      img.src = imgs[current];
      modal.querySelectorAll(".thumb").forEach((t, k) => t.setAttribute("aria-current", String(k === current)));
    };
    modal.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) return closeProduct();
      const t = e.target.closest(".thumb");
      if (t) return show(+t.dataset.i);
      if (e.target.closest(".gal-nav.prev")) return show(current - 1);
      if (e.target.closest(".gal-nav.next")) return show(current + 1);
      const q = e.target.closest("[data-q]");
      if (q) {
        qty = Math.max(1, Math.min(99, qty + +q.dataset.q));
        modal.querySelector("#modal-qty").textContent = qty;
        updateBuy();
      }
    });
    const sel = modal.querySelector("#modal-opt");
    if (sel) sel.addEventListener("change", updateBuy);
    updateBuy();
    modal.querySelector(".modal-close").focus();
  }

  function closeProduct() {
    const root = document.getElementById("modal-root");
    if (!root.innerHTML) return;
    root.innerHTML = "";
    document.body.classList.remove("no-scroll");
    if (location.hash.startsWith("#p/")) history.replaceState(null, "", location.pathname + location.search + "#productos");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  function route() {
    const m = location.hash.match(/^#p\/(.+)$/);
    if (m) openProduct(decodeURIComponent(m[1]));
    else closeProduct();
  }

  document.addEventListener("keydown", (e) => {
    if (!document.querySelector(".modal")) return;
    if (e.key === "Escape") closeProduct();
    if (e.key === "Tab") { // mantiene el foco dentro de la ventana
      const f = [...document.querySelectorAll(".modal a[href], .modal button, .modal select")].filter((x) => x.offsetParent);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Animación de entrada ---------- */
  function reveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Arranque ---------- */
  fetch("data/content.json", { cache: "no-store" })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((data) => {
      C = data;
      const seen = {};
      (C.products || []).forEach((p) => {
        if (!p) return;
        let id = slug(p.name);
        if (seen[id]) id += "-" + (++seen[id]); else seen[id] = 1;
        p._id = id;
      });
      if (C.site.description) document.querySelector('meta[name="description"]').content = C.site.description;
      renderHeader();
      document.getElementById("main").innerHTML =
        heroHtml() + benefitsHtml() + catalogHtml() + spotlightHtml() + trustHtml() + wholesaleHtml();
      renderFooter();
      bindChips();
      reveal();
      window.addEventListener("hashchange", route);
      route();
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("main").innerHTML =
        '<div class="loading">No se pudo cargar el contenido. Recarga la página en unos segundos.</div>';
    });
})();
