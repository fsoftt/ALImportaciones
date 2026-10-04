# AL Importaciones — tienda web

Tienda de **AL Importaciones** (tecnología, estilo, para ti), publicada con GitHub Pages. Funciona igual que el sitio `ngl`: es una página estática, el contenido vive en un JSON y hay un panel para editarlo sin tocar código.

- `index.html`: la tienda (portada, beneficios, catálogo con filtro por categoría, producto destacado, garantía, al por mayor)
- `admin.html`: **panel de administración** con usuario y contraseña

Cada producto tiene un botón **Comprar** que abre WhatsApp con el pedido ya escrito (producto, opción, cantidad y precio). La persona solo pulsa *Enviar*. En el detalle del producto se pueden elegir la opción (color o modelo) y la cantidad.

## 1. Publicar en GitHub Pages (una sola vez)

1. Asegúrate de que estos archivos estén en la rama `main`.
2. En GitHub ve a **Settings → Pages**, elige **Deploy from a branch**, rama **`main`**, carpeta **`/ (root)`** y guarda.
3. En 1 o 2 minutos el sitio queda en `https://fsoftt.github.io/ALImportaciones/`.

> ¿Dominio propio? Configúralo en la misma pantalla, en *Custom domain*.

## 2. Primer ingreso al panel: crear usuario y contraseña

1. Crea una clave de GitHub en <https://github.com/settings/personal-access-tokens/new>:
   - *Expiration*: la fecha más lejana posible.
   - *Repository access*: **Only select repositories** → `ALImportaciones`.
   - *Repository permissions*: **Contents: Read and write**.
2. Entra a `https://fsoftt.github.io/ALImportaciones/admin.html`. Como todavía no hay usuarios, se abre **Configurar acceso**.
3. Pega la clave, escribe un usuario y una contraseña (mínimo 10 caracteres) y pulsa *Guardar y entrar*.

Desde ese momento se entra solo con **usuario y contraseña**. En la pestaña **Usuarios** puedes agregar más personas, cambiar contraseñas o quitar accesos.

### ¿Cómo funciona el usuario y la contraseña sin servidor?

La clave de GitHub se guarda en `data/access.json` **cifrada** (AES-GCM). La llave se deriva del usuario y la contraseña con PBKDF2-SHA256 (310.000 iteraciones). Al iniciar sesión, el navegador descifra la clave. Si la contraseña es incorrecta, no se puede descifrar.

- El archivo cifrado es público, igual que el resto del repositorio. Por eso la seguridad depende de la contraseña: usa una **frase larga** y no la repitas en otros sitios.
- La clave de GitHub solo puede editar este repositorio. Si sospechas que alguien la tiene, bórrala en GitHub y vuelve a hacer *Configurar acceso* con una nueva.
- **Cuando la clave venza**, entra con *Configurar acceso* y una clave nueva. Luego, en **Usuarios**, vuelve a crear a los demás usuarios o cámbiales la contraseña.

## 3. Editar la tienda

- **Productos**: nombre, subtítulo, categoría, precio (solo números, ej. `89900`; vacío = «Consultar precio»), precio anterior, etiqueta, fotos, opciones (colores o modelos), características con ícono y tarjetas con foto. También puedes marcarlo como *agotado* o como *★ destacado*.
- **General**: número de WhatsApp que recibe los pedidos, Instagram y los mensajes que se envían por WhatsApp.
- **Portada**, **Garantía**: textos, imágenes, beneficios y la sección de compras al por mayor.

Pulsa **Publicar cambios**. Cada publicación queda como un commit, así que todo cambio se puede deshacer desde el historial de GitHub. Las fotos se reducen a un máximo de 1600 px y se guardan en `assets/uploads/`.

## Pendientes

- [ ] **Número de WhatsApp** (pestaña General). Mientras esté vacío, el botón abre WhatsApp para que la persona elija el contacto.
- [ ] Precios del reloj y las baterías. Hoy dicen «Consultar precio».
- [ ] Fotos y logo originales. Las actuales son recortes de las piezas publicitarias.

## Estructura

```
index.html, admin.html
data/content.json        ← todo el contenido de la tienda
data/access.json         ← usuarios del panel (clave cifrada)
assets/css/styles.css    ← estilos de la tienda
assets/css/admin.css     ← estilos del panel
assets/js/main.js        ← pinta la tienda a partir del JSON
assets/js/admin.js       ← panel (inicio de sesión, edición, API de GitHub)
assets/js/config.js      ← repositorio y rama que edita el panel
assets/img/              ← logo, banner e imágenes de productos
assets/uploads/          ← fotos subidas desde el panel
```

Para verlo en tu computador: `python3 -m http.server` en esta carpeta y abre <http://localhost:8000>.
