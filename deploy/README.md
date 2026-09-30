# Publicación

Wavrr se sirve únicamente desde el NAS, detrás de Nginx Proxy Manager.

## Publicar en el NAS con Nginx Proxy Manager

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

Si `docker network ls` no muestra una red propia de NPM y este está en la red
`bridge` por defecto (típico en Unraid), no puedes reenviar por nombre de
contenedor. Publica un puerto en el compose (`ports: - "8089:80"`) y en NPM usa
como Forward Hostname la IP del NAS y como puerto ese `8089`.

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
