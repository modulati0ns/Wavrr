# Publicación

Wavrr se sirve únicamente desde un NAS (Unraid), detrás de Nginx Proxy Manager
y Cloudflare, en **https://wavrr.modulati0ns.es**.

```
visitante ──HTTPS──▶ Cloudflare ──▶ NPM (dominio, certificado, cabeceras)
                                     └──▶ nginx:alpine :8089 ──▶ index.html + fonts/
```

## Qué hace falta saber de antemano

NPM es un **proxy inverso**: reparte peticiones, pero no sirve ficheros
estáticos. Por eso hay un `nginx:alpine` detrás que los sirve; con unos 50 MB
sobra.

La aplicación no hace ninguna petición a terceros: las tipografías (Archivo y
Chivo Mono, licencia SIL OFL) van en `fonts/` junto a `index.html`.

## Pasos

```bash
# 1. En el NAS, crea la carpeta y deja dentro la aplicación
mkdir -p /mnt/user/appdata/wavrr
cd /mnt/user/appdata/wavrr
curl -fsSL https://github.com/modulati0ns/Wavrr/archive/refs/heads/main.tar.gz \
  | tar -xz --strip-components=1 Wavrr-main/index.html Wavrr-main/fonts

# 2. Arranca el contenedor con deploy/docker-compose.yml
#    (en Unraid, como stack de Dockge o del plugin Compose Manager)
docker compose -f docker-compose.yml up -d

# 3. Comprueba que responde desde el propio NAS antes de tocar NPM
docker exec wavrr wget -qO- localhost | head -5
```

## En la interfaz de NPM

**Hosts → Proxy Hosts → Add Proxy Host**

| Pestaña | Campo | Valor |
|---|---|---|
| Details | Domain Names | `wavrr.modulati0ns.es` |
| | Scheme | `http` |
| | Forward Hostname / IP | la IP del NAS en la red local |
| | Forward Port | `8089` |
| | Cache Assets, Block Common Exploits | ✔ |
| SSL | Certificado | el comodín `*.modulati0ns.es` |
| | Force SSL, HTTP/2 Support, HSTS Enabled | ✔ |

### Cabeceras de seguridad

Van en **Custom Locations**: una location `/` con el mismo destino y, en la
rueda dentada, estas líneas. **No** en la pestaña *Advanced*: allí quedan a
nivel `server`, y como NPM añade su propio `add_header` dentro de `location /`,
nginx las descarta todas.

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:" always;
```

`'unsafe-inline'` hace falta porque estilos y script van dentro de
`index.html`, y `data:` en `img-src` por el favicon. HSTS ya lo pone el
interruptor *HSTS Enabled*; no hace falta repetirlo aquí.

### Cloudflare

Registro `CNAME wavrr` con proxy activado (nube naranja), y en
**SSL/TLS → Edge Certificates** activar **Always Use HTTPS** para que las
visitas por `http://` se redirijan en Cloudflare.

## Actualizar a una versión nueva

Basta con reemplazar los ficheros; no hay que reiniciar el contenedor.

```bash
cd /mnt/user/appdata/wavrr
curl -fsSL https://github.com/modulati0ns/Wavrr/archive/refs/heads/main.tar.gz \
  | tar -xz --strip-components=1 Wavrr-main/index.html Wavrr-main/fonts
```

Después, en Cloudflare, **Caching → Purge Cache** (o purgar solo
`https://wavrr.modulati0ns.es/`) si no se ve el cambio al momento.
