# Laboratorio de ondas electromagnéticas

Herramienta interactiva en 3D para enseñar propagación, polarización y radiación
de antenas. Una sola página, sin dependencias ni compilación: se abre haciendo
doble clic en `index.html`.

![sin capturas en el repositorio — abre index.html](#)

## Qué hace

Dos vistas que comparten el mismo generador de señal:

- **Onda plana.** Una onda avanzando por el eje z con sus campos E y B. Permite
  cambiar las dos componentes transversales y el desfase entre ellas, y ver cómo
  la punta del campo eléctrico pasa de recorrer una recta a una circunferencia o
  una elipse. Incluye la figura vista de frente y la esfera de Poincaré.
- **Radiación 3D.** El campo lejano de una antena real: capas esféricas con el
  signo y la amplitud que les toca, el diagrama de radiación, cortes del campo
  por un plano y una sonda direccional con los vectores E y B.

El **generador** alimenta ambas vistas y admite seis formas de onda predefinidas
o un trazo dibujado a mano con el ratón.

## Cómo usarlo

```
# no hace falta nada: doble clic en index.html
# o, si se prefiere servirlo:
python3 -m http.server 8000     # y abrir http://localhost:8000
```

Para publicarlo basta con subir `index.html` a cualquier alojamiento estático
(GitHub Pages, Netlify, un directorio de Apache). No hay proceso de compilación.

La única petición externa son las tipografías de Google Fonts. Si se necesita
funcionamiento sin red, sustituir el `<link>` de fuentes por copias locales; el
resto ya es autónomo y funciona sin conexión.

## Verificación

La física no se comprueba a ojo. `tools/verify.mjs` lee las funciones
directamente de `index.html` y valida los resultados contra valores de libro:

```
node tools/verify.mjs
```

Comprueba, entre otras cosas:

- que las seis formas de onda tienen valor medio cero (un campo con componente
  continua no se radia) y pico normalizado;
- que el campo propagado coincide con `cos(ωt − kz)` y se repite cada λ;
- que δ = +90° produce giro dextrógiro en el convenio IEEE;
- que los parámetros de Stokes dan s₁ = 1 en lineal horizontal, s₂ = 1 a 45° y
  s₃ = ±1 en circular;
- que las directividades y anchos de haz coinciden con los de Balanis: 1,76 dBi
  el dipolo corto, 2,15 el λ/2 con 78°, 3,82 el de 1λ, 5,15 el monopolo con 39°;
- que E, B y la dirección de propagación son ortogonales y el vector de Poynting
  apunta hacia fuera en toda la esfera;
- que el muestreo espacial de las capas queda por encima del límite de Nyquist.

Si alguien toca una fórmula y rompe algo, el script sale con código 1.

## Convenios adoptados

Los convenios de polarización se contradicen entre disciplinas, así que conviene
tenerlos por escrito. El panel de créditos de la propia aplicación los detalla,
en resumen:

| Asunto | Elección |
| --- | --- |
| Campo eléctrico | `Ex = Ax·cos(kz − ωt)`, `Ey = Ay·cos(kz − ωt + δ)` |
| Campo magnético | `B = (1/c)·ẑ × E`, dibujado multiplicado por c |
| Sentido de giro | IEEE: pulgar derecho hacia +z, los dedos siguen el giro |
| Desfase δ | retardo temporal de la componente y, no una fase |
| Esfera de Poincaré | polo norte = dextrógiro IEEE (uso de la IAU) |
| Unidades | normalizadas: λ = 2 u, periodo 3 s, v = 2/3 u/s |

Dos avisos que merecen recordarse: lo que aquí se llama dextrógiro es levógiro
en el convenio clásico de la óptica, y la norma IEEE 145 dibuja la esfera de
Poincaré con el eje vertical invertido respecto a esta.

## Límites del modelo

- Onda plana monocromática en el vacío, sin dispersión ni atenuación.
- En la vista de radiación, **solo campo lejano**: no hay campo cercano, ni
  acoplo, ni impedancia, ni suelo real. La circunferencia interior marca dónde
  empieza lo representado.
- La velocidad de propagación es una escala de dibujo, no un valor físico, y en
  la vista de radiación se ajusta según la fuente para no caer por debajo del
  límite de muestreo.
- Stokes y la esfera de Poincaré están definidos para ondas monocromáticas. Con
  una triangular, un pulso o un trazo a mano, lo que se muestra es el estado
  medio equivalente, no una descripción completa.

## Estructura

```
index.html          la aplicación entera
tools/verify.mjs    comprobaciones de la física
LICENSE.md          licencia
```

Que sea un único fichero es deliberado: se puede pasar por correo, llevar en un
pendrive y abrir en el ordenador del aula sin instalar nada.

## Licencia

CC BY-SA 4.0. Ver `LICENSE.md`.
