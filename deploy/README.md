# Publicación

Dos destinos independientes: GitHub (código y demo pública) y el NAS (copia
propia detrás de Nginx Proxy Manager). No hace falta hacer los dos.

---

## 1. Subir a GitHub

Crea primero un repositorio **vacío** en github.com, sin README ni licencia, para
que no choque con el historial que ya trae esta carpeta.

```bash
cd lab-ondas

# comprueba que el historial está donde esperas
git log --oneline

# sustituye USUARIO por tu cuenta
git remote add origin git@github.com:USUARIO/lab-ondas.git
git push -u origin main
```

Si usas HTTPS en vez de clave SSH, el remoto sería
`https://github.com/USUARIO/lab-ondas.git` y te pedirá usuario y un **token
personal** (Settings → Developer settings → Personal access tokens), no tu
contraseña.

### Publicar la demo con GitHub Pages

Como todo es estático y `index.html` está en la raíz, no hace falta ninguna
configuración:

1. Repositorio → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main`, carpeta `/ (root)` → **Save**

En un par de minutos estará en `https://USUARIO.github.io/lab-ondas/`.

### Rematar el README

Con la URL ya en la mano, en `README.md`:

- Cambia `USUARIO` en la insignia de verificación.
- Añade el enlace a la demo.
- Sustituye el bloque de la captura por una imagen real. Lo más vendedor es un
  GIF corto del generador manual: dibujas y el trazo sale viajando.

Para la captura, crea `docs/` en el repositorio, sube ahí las imágenes y
enlázalas como `![Vista de radiación](docs/radiacion.png)`.

---

## 2. Publicar en el NAS con Nginx Proxy Manager

### Qué hace falta saber de antemano

NPM es un **proxy inverso**: reparte peticiones, pero no sirve ficheros
estáticos. Así que hace falta algo detrás que los sirva. Un `nginx:alpine` de
unos 50 MB sobra.

### Pasos

```bash
# 1. En el NAS, crea la carpeta y deja dentro la aplicación
mkdir -p /volume1/docker/lab-ondas
cp index.html /volume1/docker/lab-ondas/

# 2. Averigua el nombre real de la red de tu NPM
docker network ls | grep -i npm

# 3. Ajusta ese nombre y la ruta del volumen en docker-compose.yml, y arranca
docker compose -f deploy/docker-compose.yml up -d

# 4. Comprueba que responde desde el propio NAS
docker exec lab-ondas wget -qO- localhost | head -5
```

### En la interfaz de NPM

**Hosts → Proxy Hosts → Add Proxy Host**

| Campo | Valor |
|---|---|
| Domain Names | `ondas.tudominio.com` |
| Scheme | `http` |
| Forward Hostname | `lab-ondas` |
| Forward Port | `80` |
| Block Common Exploits | ✔ |
| Websockets Support | no hace falta |

En la pestaña **SSL**: certificado nuevo de Let's Encrypt, y marca *Force SSL* y
*HTTP/2 Support*.

Si el dominio solo resuelve en tu red, necesitarás el desafío **DNS-01** para el
certificado, porque Let's Encrypt no podrá alcanzarte por HTTP.

### Actualizar a una versión nueva

Basta con reemplazar el fichero; no hay que reiniciar el contenedor.

```bash
cp index.html /volume1/docker/lab-ondas/
```

---

## Una advertencia sobre las tipografías

La aplicación carga **Archivo** y **Chivo Mono** desde Google Fonts. Las descarga
el navegador de quien la visita, no el NAS, así que funciona igual aunque el NAS
no tenga salida a internet, siempre que el visitante sí la tenga.

Si la vas a usar en un aula sin conexión, o prefieres no depender de Google,
descarga los `.woff2`, déjalos junto a `index.html` y sustituye el `<link>` de
fuentes por un `@font-face` local. Es el único recurso externo que queda.
