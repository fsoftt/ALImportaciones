/* ==========================================================
   AL Importaciones — Panel de administración
   Edita data/content.json y sube fotos directamente al
   repositorio de GitHub usando la API (sin servidor propio).

   Inicio de sesión con usuario y contraseña: la clave (token)
   de GitHub se guarda en data/access.json cifrada con AES-GCM,
   usando una llave derivada de usuario + contraseña (PBKDF2).
   Sin la contraseña correcta el archivo no sirve de nada.

   Cada "Publicar" crea un único commit; GitHub Pages
   actualiza el sitio en 1–2 minutos.
   ========================================================== */
(function () {
  "use strict";

  const CFG = window.ALI_CONFIG;
  const API = "https://api.github.com";
  const SESSION_KEY = "ali_admin_session";
  const PBKDF2_ITERATIONS = 310000;
  const MIN_PASSWORD = 10;

  /* ---------- Esquema del formulario ---------- */
  const ICON_OPTIONS = [
    ["wave", "Ondas de sonido"], ["user", "Persona"], ["spatial", "Sonido envolvente"], ["touch", "Toque / táctil"],
    ["bluetooth", "Bluetooth"], ["battery", "Batería"], ["bolt", "Rayo / carga rápida"], ["drop", "Gota / resistente al agua"],
    ["phone", "Celular"], ["watch", "Reloj"], ["music", "Nota musical"], ["truck", "Camión / envío"],
    ["shield", "Escudo / garantía"], ["card", "Tarjeta / pago"], ["headset", "Diadema / atención"], ["diamond", "Diamante"],
    ["star", "Estrella"], ["gift", "Regalo"], ["clock", "Reloj / tiempo"], ["box", "Caja"], ["check", "Visto bueno"]
  ];
  const featureFields = [
    { key: "icon", label: "Ícono", type: "select", options: ICON_OPTIONS },
    { key: "title", label: "Título" },
    { key: "text", label: "Texto" }
  ];

  const TABS = [
    {
      id: "productos", label: "Productos", intro: "Agrega, edita, ordena o quita productos. El primero marcado como «destacado» aparece en la sección grande de la página.",
      root: (c) => c,
      fields: [
        { key: "products", label: "Productos", type: "list", collapsible: true, addFirst: true,
          itemTitle: (it) => [it.name || "Producto nuevo", it.available === false ? "(agotado)" : "", it.featured ? "★" : ""].filter(Boolean).join(" "),
          itemThumb: (it) => (it.images || []).find(Boolean),
          newItem: { name: "", subtitle: "", category: "", price: "", oldPrice: "", badge: "", available: true, featured: false,
            description: "", images: [], options: [], features: [], highlights: [] },
          fields: [
            { key: "name", label: "Nombre" },
            { key: "subtitle", label: "Subtítulo", help: "Ej: Calidad 1.1 Premium" },
            { key: "category", label: "Categoría", help: "Ej: Audífonos, Relojes, Baterías y cargadores. Los productos se filtran por categoría." },
            { type: "row", fields: [
              { key: "price", label: "Precio", help: "Solo números. Ej: 89900. Vacío = «Consultar precio»." },
              { key: "oldPrice", label: "Precio anterior (opcional)", help: "Se muestra tachado." }
            ] },
            { key: "badge", label: "Etiqueta (opcional)", help: "Ej: Precio especial, Nuevo, Más vendido" },
            { key: "available", label: "Disponible (desmárcalo si está agotado)", type: "checkbox" },
            { key: "featured", label: "★ Producto destacado (sección grande de la página)", type: "checkbox" },
            { key: "description", label: "Descripción", type: "textarea" },
            { key: "images", label: "Fotos", type: "strings", of: "image", help: "La primera es la foto principal." },
            { key: "options", label: "Opciones para elegir (opcional)", type: "strings", of: "text", help: "Colores, tallas o modelos. El cliente elige una antes de comprar." },
            { key: "features", label: "Características (con ícono)", type: "list", itemTitle: (it) => it.title, newItem: { icon: "star", title: "", text: "" }, fields: featureFields },
            { key: "highlights", label: "Tarjetas con foto (solo en el producto destacado)", type: "list", itemTitle: (it) => it.title,
              newItem: { image: "", title: "", text: "" },
              fields: [{ key: "image", label: "Foto", type: "image" }, { key: "title", label: "Título" }, { key: "text", label: "Texto" }] }
          ] }
      ]
    },
    {
      id: "general", label: "General", intro: "Datos de la tienda, WhatsApp y redes sociales.",
      root: (c) => c.site,
      fields: [
        { key: "whatsapp", label: "Número de WhatsApp que recibe los pedidos", help: "Con indicativo del país, solo números. Ej: 573001234567" },
        { key: "name", label: "Nombre de la tienda" },
        { key: "tagline", label: "Lema", help: "Ej: Tecnología • Estilo • Para ti" },
        { key: "logo", label: "Logo", type: "image" },
        { key: "description", label: "Descripción (pie de página y buscadores)", type: "textarea" },
        { key: "instagram", label: "Enlace de Instagram", type: "url" },
        { key: "instagramHandle", label: "Usuario de Instagram", help: "Ej: @alimportaciones" },
        { key: "buyMessage", label: "Mensaje de compra por WhatsApp", type: "textarea",
          help: "Se reemplazan: {producto}, {opcion}, {cantidad}, {precio} y {enlace} (link al producto)." },
        { key: "askMessage", label: "Mensaje del botón general de WhatsApp", type: "textarea" },
        { key: "footerText", label: "Frase del pie de página" }
      ]
    },
    {
      id: "portada", label: "Portada", intro: "Lo primero que ve la gente al entrar.",
      root: (c) => c,
      fields: [
        { type: "group", key: "hero", label: "Encabezado", fields: [
          { key: "eyebrow", label: "Texto pequeño superior" },
          { key: "script", label: "Frase en letra cursiva" },
          { key: "title", label: "Título" },
          { key: "text", label: "Texto", type: "textarea" },
          { key: "button", label: "Texto del botón" },
          { key: "image", label: "Imagen principal", type: "image" }
        ] },
        { key: "benefits", label: "Beneficios (franja bajo la portada)", type: "list", itemTitle: (it) => it.title,
          newItem: { icon: "star", title: "" },
          fields: [{ key: "icon", label: "Ícono", type: "select", options: ICON_OPTIONS }, { key: "title", label: "Texto" }], cols: 2 },
        { type: "group", key: "catalog", label: "Encabezado del catálogo", fields: [
          { key: "eyebrow", label: "Texto pequeño superior" },
          { key: "title", label: "Título" },
          { key: "text", label: "Texto", type: "textarea" }
        ] },
        { type: "group", key: "spotlight", label: "Sección del producto destacado", help: "Muestra el primer producto marcado con ★ en la pestaña Productos.", fields: [
          { key: "show", label: "Mostrar la sección", type: "checkbox" },
          { key: "script", label: "Frase en cursiva superior" },
          { key: "secondScript", label: "Frase en cursiva junto al precio" }
        ] }
      ]
    },
    {
      id: "confianza", label: "Garantía", intro: "Garantía, envíos, pagos y compras al por mayor.",
      root: (c) => c,
      fields: [
        { type: "group", key: "trust", label: "Garantía y confianza", fields: [
          { key: "items", label: "Tarjetas", type: "list", itemTitle: (it) => it.title,
            newItem: { icon: "shield", title: "", text: "" }, fields: featureFields },
          { key: "slogan", label: "Frase en la cinta dorada" }
        ] },
        { type: "group", key: "wholesale", label: "Al por mayor", fields: [
          { key: "show", label: "Mostrar la sección", type: "checkbox" },
          { key: "script", label: "Frase en cursiva" },
          { key: "title", label: "Título" },
          { key: "text", label: "Texto", type: "textarea" },
          { key: "button", label: "Texto del botón" },
          { key: "message", label: "Mensaje de WhatsApp del botón", type: "textarea" }
        ] }
      ]
    },
    { id: "usuarios", label: "Usuarios", intro: "Personas que pueden entrar a este panel.", custom: () => usersPanel() }
  ];

  /* ---------- Estado ---------- */
  let token = null;
  let currentUser = "";
  let content = null;       // copia de trabajo
  let loadedSha = null;     // sha del content.json cargado
  let access = { users: [] };
  let accessDirty = false;
  let dirty = false;
  let currentTab = TABS[0].id;
  const pendingUploads = new Map(); // ruta -> base64
  const previews = new Map();       // ruta -> objectURL

  const $ = (s, el = document) => el.querySelector(s);
  const fill = (el, ...kids) => el.replaceChildren(...kids.filter((k) => k != null && k !== false));
  const h = (tag, attrs = {}, ...children) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "style") el.style.cssText = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k in el && k !== "list") el[k] = v;
      else el.setAttribute(k, v);
    }
    for (const c of children.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
    return el;
  };

  /* ---------- base64 ---------- */
  function bytesToB64(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function b64ToBytes(b64) {
    const bin = atob(String(b64).replace(/\s/g, ""));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  const toBase64Utf8 = (str) => bytesToB64(new TextEncoder().encode(str));
  const fromBase64Utf8 = (b64) => new TextDecoder().decode(b64ToBytes(b64));

  /* ---------- Cifrado de la clave de GitHub ---------- */
  const normUser = (u) => String(u || "").trim().toLowerCase();

  async function deriveKey(user, pass, salt, iterations) {
    const enc = new TextEncoder();
    const base = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
    const fullSalt = new Uint8Array([...salt, ...enc.encode(normUser(user))]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: fullSalt, iterations, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }

  async function sealToken(user, pass, tok) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(user, pass, salt, PBKDF2_ITERATIONS);
    const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(tok)));
    return { user: normUser(user), iterations: PBKDF2_ITERATIONS, salt: bytesToB64(salt), iv: bytesToB64(iv), data: bytesToB64(data) };
  }

  async function openToken(entry, pass) {
    const key = await deriveKey(entry.user, pass, b64ToBytes(entry.salt), entry.iterations || PBKDF2_ITERATIONS);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(entry.iv) }, key, b64ToBytes(entry.data));
    return new TextDecoder().decode(plain);
  }

  /* Lista pública de usuarios (cifrada). Primero la API (lo más reciente),
     si falla, la copia publicada en el sitio. */
  async function fetchPublicAccess() {
    try {
      const r = await fetch(`${API}/repos/${CFG.owner}/${CFG.repo}/contents/${CFG.accessPath}?ref=${encodeURIComponent(CFG.branch)}`,
        { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" });
      if (r.ok) return JSON.parse(fromBase64Utf8((await r.json()).content));
    } catch (_) {}
    try {
      const r = await fetch(`${CFG.accessPath}?t=${Date.now()}`, { cache: "no-store" });
      if (r.ok) return await r.json();
    } catch (_) {}
    return { users: [] };
  }

  /* ---------- API de GitHub ---------- */
  async function gh(path, opts = {}) {
    const res = await fetch(API + path, {
      ...opts,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(opts.body ? { "Content-Type": "application/json" } : {})
      },
      cache: "no-store"
    });
    if (!res.ok) {
      let msg = "";
      try { msg = (await res.json()).message; } catch (_) {}
      const err = new Error(msg || res.statusText);
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }
  const repoPath = `/repos/${CFG.owner}/${CFG.repo}`;
  const contentsUrl = (path) => `${repoPath}/contents/${path}?ref=${encodeURIComponent(CFG.branch)}`;

  function explain(err) {
    if (err.code === "badlogin") return "Usuario o contraseña incorrectos.";
    if (err.status === 401) return "La clave de GitHub guardada no es válida o expiró. Usa «Configurar acceso» con una clave nueva.";
    if (err.status === 403) return "La clave de GitHub no tiene permiso para escribir en el repositorio (Contents: Read and write).";
    if (err.status === 404) return `La clave no tiene acceso al repositorio ${CFG.owner}/${CFG.repo}, o la rama "${CFG.branch}" no existe.`;
    if (err.status === 409 || err.status === 422) return "Alguien más publicó cambios al mismo tiempo. Intenta de nuevo.";
    return "Error: " + err.message;
  }

  /* ---------- Sesión ---------- */
  async function verifyToken() {
    const repo = await gh(repoPath);
    if (repo.permissions && repo.permissions.push === false) {
      const e = new Error("sin permiso"); e.status = 403; throw e;
    }
  }

  async function startSession(tok, user, remember) {
    token = tok;
    currentUser = normUser(user);
    await verifyToken();
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify({ token, user: currentUser }));
    $("#user-name").textContent = `Sesión: ${currentUser}`;
    await loadContent();
    $("#login").classList.add("hidden");
    $("#editor").classList.remove("hidden");
    renderTabs();
    renderPanel();
  }

  async function loginWithPassword(user, pass, remember) {
    const list = await fetchPublicAccess();
    const entry = (list.users || []).find((u) => u.user === normUser(user));
    const bad = () => { const e = new Error("bad"); e.code = "badlogin"; return e; };
    if (!entry) throw bad();
    let tok;
    try { tok = await openToken(entry, pass); } catch (_) { throw bad(); }
    await startSession(tok, user, remember);
  }

  async function setupAccess(tok, user, pass) {
    token = tok.trim();
    await verifyToken();
    let sha;
    let current = { users: [] };
    try {
      const file = await gh(contentsUrl(CFG.accessPath));
      sha = file.sha;
      current = JSON.parse(fromBase64Utf8(file.content));
    } catch (err) { if (err.status !== 404) throw err; }
    if (!Array.isArray(current.users)) current.users = [];
    const entry = await sealToken(user, pass, token);
    current.users = current.users.filter((u) => u.user !== entry.user).concat(entry);
    await gh(`${repoPath}/contents/${CFG.accessPath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Configurar acceso al panel para ${entry.user}`,
        content: toBase64Utf8(JSON.stringify(current, null, 2) + "\n"),
        branch: CFG.branch,
        ...(sha ? { sha } : {})
      })
    });
    await startSession(token, user, false);
  }

  function logout() {
    if (dirty && !confirm("Tienes cambios sin publicar. ¿Salir de todas formas?")) return;
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    dirty = false;
    location.reload();
  }

  async function loadContent() {
    const file = await gh(contentsUrl(CFG.contentPath));
    loadedSha = file.sha;
    content = JSON.parse(fromBase64Utf8(file.content));
    try {
      const a = await gh(contentsUrl(CFG.accessPath));
      access = JSON.parse(fromBase64Utf8(a.content));
    } catch (err) { if (err.status !== 404) throw err; access = { users: [] }; }
    if (!Array.isArray(access.users)) access.users = [];
    accessDirty = false;
  }

  /* ---------- Publicar (un solo commit) ---------- */
  async function publish() {
    const btn = $("#publish");
    btn.disabled = true;
    setStatus("Publicando…");
    try {
      const latest = await gh(contentsUrl(CFG.contentPath));
      if (latest.sha !== loadedSha &&
          !confirm("El contenido fue modificado desde otro dispositivo después de que abriste el panel. ¿Reemplazarlo con tu versión?")) {
        setStatus("Publicación cancelada");
        btn.disabled = false;
        return;
      }
      const ref = await gh(`${repoPath}/git/ref/heads/${encodeURIComponent(CFG.branch)}`);
      const baseCommit = await gh(`${repoPath}/git/commits/${ref.object.sha}`);

      // Solo se suben las fotos que siguen en uso.
      const json = JSON.stringify(content, null, 2) + "\n";
      const files = [...pendingUploads.entries()].filter(([path]) => json.includes(JSON.stringify(path))).map(([path, b64]) => ({ path, b64 }));
      const nImages = files.length;
      files.push({ path: CFG.contentPath, b64: toBase64Utf8(json) });
      if (accessDirty) files.push({ path: CFG.accessPath, b64: toBase64Utf8(JSON.stringify(access, null, 2) + "\n") });

      const tree = [];
      let contentBlobSha = null;
      for (const f of files) {
        const blob = await gh(`${repoPath}/git/blobs`, { method: "POST", body: JSON.stringify({ content: f.b64, encoding: "base64" }) });
        tree.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
        if (f.path === CFG.contentPath) contentBlobSha = blob.sha;
      }
      const newTree = await gh(`${repoPath}/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree }) });
      const commit = await gh(`${repoPath}/git/commits`, {
        method: "POST",
        body: JSON.stringify({
          message: `Actualizar contenido desde el panel (${currentUser})${nImages ? ` (+${nImages} imagen${nImages > 1 ? "es" : ""})` : ""}`,
          tree: newTree.sha,
          parents: [ref.object.sha]
        })
      });
      await gh(`${repoPath}/git/refs/heads/${encodeURIComponent(CFG.branch)}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });

      loadedSha = contentBlobSha;
      pendingUploads.clear();
      accessDirty = false;
      setDirty(false);
      setStatus("Publicado ✓");
      toast("¡Publicado! La tienda se actualizará en 1–2 minutos.");
      renderPanel();
    } catch (err) {
      console.error(err);
      setStatus("Error al publicar");
      toast(explain(err), true);
      btn.disabled = false;
    }
  }

  /* ---------- Imágenes ---------- */
  const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "imagen";

  function readAsBase64(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1]);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  async function prepareImage(file) {
    const MAX = 1600;
    const keepOriginal = /image\/(png|gif|svg\+xml|webp)/.test(file.type) && file.size < 600 * 1024;
    if (keepOriginal) {
      const ext = { "image/png": "png", "image/gif": "gif", "image/svg+xml": "svg", "image/webp": "webp" }[file.type];
      return { blob: file, ext };
    }
    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap) {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
      return drawToJpeg(img, img.naturalWidth, img.naturalHeight, MAX);
    }
    return drawToJpeg(bitmap, bitmap.width, bitmap.height, MAX);
  }
  function drawToJpeg(src, w, hgt, max) {
    const scale = Math.min(1, max / Math.max(w, hgt));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(hgt * scale);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => canvas.toBlob((blob) => resolve({ blob, ext: "jpg" }), "image/jpeg", 0.85));
  }

  async function handleUpload(file) {
    if (!file || !file.type.startsWith("image/")) { toast("Selecciona un archivo de imagen.", true); return null; }
    const { blob, ext } = await prepareImage(file);
    const name = slug(file.name.replace(/\.[^.]+$/, ""));
    const path = `${CFG.uploadsDir}/${Date.now()}-${name}.${ext}`;
    pendingUploads.set(path, await readAsBase64(blob));
    previews.set(path, URL.createObjectURL(blob));
    return path;
  }

  const previewUrl = (path) => previews.get(path) || path;

  /* ---------- Constructor de formularios ---------- */
  function setDirty(v) {
    dirty = v;
    $("#publish").disabled = !v;
    setStatus(v ? "Cambios sin publicar" : "");
  }
  function setStatus(text) {
    const s = $("#status");
    s.textContent = text;
    s.classList.toggle("dirty", dirty);
  }
  function changed() { if (!dirty) setDirty(true); }

  function field(obj, def) {
    const type = def.type || "text";
    const help = def.help ? h("small", {}, def.help) : null;

    if (type === "group") {
      if (!obj[def.key]) obj[def.key] = {};
      return h("div", { class: "group" },
        h("h3", {}, def.label),
        def.help ? h("p", { class: "help-text" }, def.help) : null,
        def.fields.map((f) => field(obj[def.key], f)));
    }
    if (type === "row") return h("div", { class: "grid-2" }, def.fields.map((f) => field(obj, f)));
    if (type === "list") return listField(obj, def);
    if (type === "strings") return stringsField(obj, def);
    if (type === "image") return imageField(obj, def.key, def.label, help);

    if (type === "checkbox") {
      return h("label", { class: "check" },
        h("input", { type: "checkbox", checked: obj[def.key] !== false && !!obj[def.key], onchange: (e) => { obj[def.key] = e.target.checked; changed(); } }),
        def.label);
    }
    let input;
    if (type === "textarea") {
      input = h("textarea", { value: obj[def.key] || "", oninput: (e) => { obj[def.key] = e.target.value; changed(); } });
    } else if (type === "select") {
      input = h("select", { onchange: (e) => { obj[def.key] = e.target.value; changed(); } },
        def.options.map(([v, l]) => h("option", { value: v, selected: obj[def.key] === v }, l)));
    } else {
      input = h("input", { type: type === "url" ? "url" : "text", value: obj[def.key] || "", placeholder: type === "url" ? "https://…" : "",
        oninput: (e) => { obj[def.key] = e.target.value; changed(); } });
    }
    return h("label", { class: "field" }, h("span", {}, def.label), input, help);
  }

  function imageField(obj, key, label, help) {
    const preview = h("div", { class: "image-preview" });
    const pathEl = h("div", { class: "path" });
    const update = () => {
      const v = obj[key];
      preview.style.backgroundImage = v ? `url("${previewUrl(v)}")` : "";
      preview.textContent = v ? "" : "Sin imagen";
      pathEl.textContent = v ? (pendingUploads.has(v) ? "Nueva imagen (se sube al publicar)" : v) : "";
      pathEl.classList.toggle("pending", pendingUploads.has(v));
    };
    const fileInput = h("input", {
      type: "file", accept: "image/*",
      onchange: async (e) => {
        const f = e.target.files[0];
        e.target.value = "";
        if (!f) return;
        setStatus("Procesando imagen…");
        const path = await handleUpload(f);
        if (path) { obj[key] = path; changed(); update(); }
        setStatus(dirty ? "Cambios sin publicar" : "");
      }
    });
    update();
    return h("div", { class: "field" },
      h("span", {}, label),
      h("div", { class: "image-field" }, preview,
        h("div", { class: "image-controls" },
          h("div", { class: "row" },
            h("span", { class: "btn btn-outline btn-sm file-btn" }, "Subir foto", fileInput),
            h("button", { type: "button", class: "btn btn-ghost btn-sm", onclick: () => { obj[key] = ""; changed(); update(); } }, "Quitar")),
          pathEl)),
      help);
  }

  function itemTools(arr, i, rerender) {
    const stop = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); fn(); };
    const move = (d) => { const [x] = arr.splice(i, 1); arr.splice(i + d, 0, x); changed(); rerender(); };
    return h("div", { class: "item-tools" },
      h("button", { type: "button", class: "icon-btn", title: "Subir", "aria-label": "Mover arriba", disabled: i === 0, onclick: stop(() => move(-1)) }, "↑"),
      h("button", { type: "button", class: "icon-btn", title: "Bajar", "aria-label": "Mover abajo", disabled: i === arr.length - 1, onclick: stop(() => move(1)) }, "↓"),
      h("button", { type: "button", class: "icon-btn danger", title: "Eliminar", "aria-label": "Eliminar",
        onclick: stop(() => { if (confirm("¿Eliminar este elemento?")) { arr.splice(i, 1); changed(); rerender(); } }) }, "✕"));
  }

  function listField(obj, def) {
    if (!Array.isArray(obj[def.key])) obj[def.key] = [];
    const arr = obj[def.key];
    const wrap = h("div", { class: "group" });
    let openItem = null; // elemento recién agregado: se abre
    const render = () => {
      fill(wrap,
        h("h3", {}, def.label),
        def.help ? h("p", { class: "help-text" }, def.help) : null,
        def.addFirst ? addButton() : null,
        h("div", { class: "list-items" + (def.grid ? " gallery-list" : "") },
          arr.map((item, i) => {
            const body = h("div", { class: def.cols === 2 ? "grid-2" : "" }, def.fields.map((f) => field(item, f)));
            if (!def.collapsible) {
              return h("div", { class: "list-item" },
                h("div", { class: "list-item-head" }, h("strong", {}, (def.itemTitle && def.itemTitle(item)) || `#${i + 1}`), itemTools(arr, i, render)),
                body);
            }
            const thumb = def.itemThumb && def.itemThumb(item);
            const titleEl = h("strong", {}, def.itemTitle(item));
            // Actualiza el título mientras se escribe.
            body.addEventListener("input", () => { titleEl.textContent = def.itemTitle(item); });
            body.addEventListener("change", () => { titleEl.textContent = def.itemTitle(item); });
            return h("details", { class: "list-item", open: item === openItem },
              h("summary", {},
                h("div", { class: "list-item-head" },
                  h("div", { class: "title" },
                    h("span", { class: "chev", "aria-hidden": "true" }, "▸"),
                    h("span", { class: "thumb-sm", style: thumb ? `background-image:url("${previewUrl(thumb)}")` : "" }),
                    titleEl),
                  itemTools(arr, i, render))),
              body);
          })),
        def.addFirst ? null : addButton());
    };
    const addButton = () => h("button", { type: "button", class: "btn btn-outline btn-sm add-btn",
      onclick: () => {
        const it = JSON.parse(JSON.stringify(def.newItem));
        def.addFirst ? arr.unshift(it) : arr.push(it);
        openItem = it;
        changed(); render();
      } }, "+ Agregar");
    render();
    return wrap;
  }

  function stringsField(obj, def) {
    if (!Array.isArray(obj[def.key])) obj[def.key] = [];
    const arr = obj[def.key];
    const wrap = h("div", { class: "group" });
    const render = () => {
      fill(wrap,
        h("h3", {}, def.label),
        def.help ? h("p", { class: "help-text" }, def.help) : null,
        h("div", { class: "list-items" },
          arr.map((_, i) => h("div", { class: "list-item" },
            h("div", { class: "list-item-head" }, h("strong", {}, `#${i + 1}`), itemTools(arr, i, render)),
            def.of === "image"
              ? imageField(arr, i, "Imagen")
              : h("label", { class: "field" }, h("input", { type: "text", value: arr[i] || "", oninput: (e) => { arr[i] = e.target.value; changed(); } }))))),
        def.max && arr.length >= def.max ? null :
          h("button", { type: "button", class: "btn btn-outline btn-sm add-btn", onclick: () => { arr.push(""); changed(); render(); } }, "+ Agregar"));
    };
    render();
    return wrap;
  }

  /* ---------- Usuarios del panel ---------- */
  function passwordInputs() {
    const p1 = h("input", { type: "password", autocomplete: "new-password", minLength: MIN_PASSWORD });
    const p2 = h("input", { type: "password", autocomplete: "new-password", minLength: MIN_PASSWORD });
    const check = () => {
      if (p1.value.length < MIN_PASSWORD) return `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
      if (p1.value !== p2.value) return "Las contraseñas no coinciden.";
      return "";
    };
    return { p1, p2, check };
  }

  function usersPanel() {
    const usersMarkChanged = () => { accessDirty = true; changed(); renderPanel(); };

    const list = h("div", { class: "list-items" }, access.users.map((u) => {
      const isMe = u.user === currentUser;
      return h("div", { class: "list-item" },
        h("div", { class: "user-row" },
          h("div", {}, h("strong", {}, u.user), isMe ? h("span", { class: "you" }, "(tú)") : null),
          h("div", { class: "row" },
            h("button", { type: "button", class: "btn btn-outline btn-sm", onclick: () => changePassword(u) }, "Cambiar contraseña"),
            isMe ? null : h("button", { type: "button", class: "btn btn-ghost btn-sm", onclick: () => {
              if (!confirm(`¿Quitar el acceso de «${u.user}»?`)) return;
              access.users = access.users.filter((x) => x !== u);
              usersMarkChanged();
            } }, "Quitar"))));
    }));

    async function changePassword(u) {
      const pass = prompt(`Nueva contraseña para «${u.user}» (mínimo ${MIN_PASSWORD} caracteres):`);
      if (pass == null) return;
      if (pass.length < MIN_PASSWORD) return toast(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`, true);
      if (prompt("Repite la contraseña:") !== pass) return toast("Las contraseñas no coinciden.", true);
      const entry = await sealToken(u.user, pass, token);
      access.users = access.users.map((x) => (x === u ? entry : x));
      usersMarkChanged();
      toast("Contraseña cambiada. Pulsa «Publicar cambios» para guardarla.");
    }

    const userInput = h("input", { type: "text", autocomplete: "off", autocapitalize: "none", spellcheck: false });
    const { p1, p2, check } = passwordInputs();
    const err = h("p", { class: "help-text", style: "color:#ff8a8a" });
    const addForm = h("form", { class: "group", onsubmit: async (e) => {
      e.preventDefault();
      const name = normUser(userInput.value);
      const problem = !name ? "Escribe un nombre de usuario." : !/^[a-z0-9._@-]+$/.test(name) ? "Usa solo letras, números, punto, guion o @ (sin espacios)." : check();
      if (problem) { err.textContent = problem; return; }
      const entry = await sealToken(name, p1.value, token);
      const exists = access.users.some((x) => x.user === name);
      if (exists && !confirm(`El usuario «${name}» ya existe. ¿Reemplazar su contraseña?`)) return;
      access.users = access.users.filter((x) => x.user !== name).concat(entry);
      usersMarkChanged();
      toast(`Usuario «${name}» listo. Pulsa «Publicar cambios» para guardarlo.`);
    } },
      h("h3", {}, "Agregar usuario"),
      h("label", { class: "field" }, h("span", {}, "Usuario"), userInput),
      h("div", { class: "grid-2" },
        h("label", { class: "field" }, h("span", {}, "Contraseña"), p1, h("small", {}, `Mínimo ${MIN_PASSWORD} caracteres.`)),
        h("label", { class: "field" }, h("span", {}, "Repite la contraseña"), p2)),
      err,
      h("button", { type: "submit", class: "btn btn-gold btn-sm" }, "Agregar usuario"));

    return [
      h("div", { class: "group" }, h("h3", {}, "Usuarios con acceso"), list),
      addForm,
      h("div", { class: "group" },
        h("h3", {}, "Si cambias la clave de GitHub"),
        h("p", { class: "help-text" },
          "Cada usuario guarda una copia cifrada de la clave de GitHub. Cuando la clave venza o la cambies, " +
          "entra con «Configurar acceso» en la pantalla de inicio usando la clave nueva, y luego vuelve a " +
          "crear aquí los demás usuarios (o cámbiales la contraseña) para que reciban la clave nueva."))
    ];
  }

  /* ---------- Pestañas ---------- */
  function renderTabs() {
    const nav = $("#tabs");
    nav.setAttribute("role", "tablist");
    nav.replaceChildren(...TABS.map((t) => h("button", {
      type: "button", role: "tab", "aria-selected": String(t.id === currentTab),
      onclick: () => { currentTab = t.id; renderTabs(); renderPanel(); window.scrollTo({ top: 0 }); }
    }, t.label)));
  }

  function renderPanel() {
    const tab = TABS.find((t) => t.id === currentTab);
    $("#panel").replaceChildren(
      h("h2", { class: "gold-text" }, tab.label),
      h("p", { class: "intro" }, tab.intro),
      ...(tab.custom ? tab.custom() : tab.fields.map((f) => field(tab.root(content), f))));
  }

  /* ---------- Avisos ---------- */
  let toastTimer;
  function toast(msg, isError) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.toggle("error", !!isError);
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), isError ? 7000 : 4500);
  }

  /* ---------- Arranque ---------- */
  document.querySelectorAll(".repo-name").forEach((el) => { el.textContent = `${CFG.owner}/${CFG.repo}`; });

  const showSetup = (show, note) => {
    $("#login-form").classList.toggle("hidden", show);
    $("#setup-form").classList.toggle("hidden", !show);
    if (note) $("#setup-note").innerHTML = note;
    (show ? $("#setup-token") : $("#user")).focus();
  };
  $("#to-setup").addEventListener("click", () => showSetup(true,
    "Úsalo la <strong>primera vez</strong> o cuando la clave de GitHub cambie. Si el usuario ya existe, se reemplaza su contraseña."));
  $("#to-login").addEventListener("click", () => showSetup(false));

  async function busy(btn, label, fn) {
    const old = btn.textContent;
    btn.disabled = true;
    btn.textContent = label;
    try { await fn(); } finally { btn.disabled = false; btn.textContent = old; }
  }

  $("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#login-error").textContent = "";
    busy($("#login-btn"), "Verificando…", async () => {
      try {
        await loginWithPassword($("#user").value, $("#pass").value, $("#remember").checked);
      } catch (err) {
        console.error(err);
        token = null;
        $("#login-error").textContent = explain(err);
      }
    });
  });

  $("#setup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const out = $("#setup-error");
    out.textContent = "";
    const user = normUser($("#setup-user").value);
    const pass = $("#setup-pass").value;
    if (!/^[a-z0-9._@-]+$/.test(user)) { out.textContent = "Usuario: usa solo letras, números, punto, guion o @ (sin espacios)."; return; }
    if (pass.length < MIN_PASSWORD) { out.textContent = `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`; return; }
    if (pass !== $("#setup-pass2").value) { out.textContent = "Las contraseñas no coinciden."; return; }
    busy($("#setup-btn"), "Guardando…", async () => {
      try {
        await setupAccess($("#setup-token").value, user, pass);
        toast(`¡Listo! Desde ahora entras con el usuario «${user}» y tu contraseña.`);
      } catch (err) {
        console.error(err);
        token = null;
        out.textContent = err.status === 401 ? "La clave de GitHub no es válida o expiró." : explain(err);
      }
    });
  });

  $("#publish").addEventListener("click", publish);
  $("#logout").addEventListener("click", logout);
  window.addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

  if (!window.crypto || !crypto.subtle) {
    $("#login-error").textContent = "Este navegador no permite iniciar sesión de forma segura. Abre el panel con https:// en un navegador actualizado.";
  }

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || "null"); } catch (_) {}
  if (saved && saved.token) {
    startSession(saved.token, saved.user, !!localStorage.getItem(SESSION_KEY)).catch((err) => {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      token = null;
      $("#login-error").textContent = explain(err);
    });
  } else {
    // Sin usuarios todavía: abre directamente la configuración inicial.
    fetchPublicAccess().then((a) => { if (!(a.users || []).length) showSetup(true); });
  }
})();
