<div align="center">

# 🌀 Wavrr

### Laboratorio de ondas electromagnéticas

**Una onda de radio, por dentro.** Propagación, polarización y radiación de antenas
en 3D, en el navegador, sin instalar nada.

[![Verificación de la física](https://github.com/modulati0ns/Wavrr/actions/workflows/verificacion.yml/badge.svg)](https://github.com/modulati0ns/Wavrr/actions/workflows/verificacion.yml)
![Sin dependencias](https://img.shields.io/badge/dependencias-ninguna-1f8a62?style=flat-square)
![Un solo fichero](https://img.shields.io/badge/un_solo-fichero_HTML-2f6fd0?style=flat-square)
![Comprobado](https://img.shields.io/badge/física-46_comprobaciones-8f5506?style=flat-square)
![Licencia](https://img.shields.io/badge/licencia-CC_BY--SA_4.0-6b6254?style=flat-square)

**[▶ Abrir la demo](https://modulati0ns.github.io/Wavrr/)** · [wavrr.modulati0ns.es](https://wavrr.modulati0ns.es)

</div>

---

> 📸 *Sustituye este bloque por una captura o un GIF de la aplicación en marcha.*
> Con una de la vista de radiación y otra del generador manual basta.

---

## ✨ Qué es

Casi todos los applets de ondas electromagnéticas dibujan la misma sinusoide de
siempre. Este hace tres cosas que no suelen verse juntas:

| | |
|---|---|
| 🎛️ **Genera la onda tú** | Arrastra una bolita y tu gesto sale emitido y viaja. El campo en cualquier punto es lo que hizo la fuente hace `distancia/v` segundos: eso es toda la física que hay detrás de una onda. |
| 📡 **No solo un rayo** | Una segunda vista muestra cómo esa misma onda sale al espacio desde una antena real, con capas esféricas, diagrama de radiación y sonda direccional. |
| 🔬 **Los números son de verdad** | La polarización se calcula por matriz de coherencia armónico a armónico. Una onda cuadrada sale **74 % polarizada**, no «circular perfecta». |

## 🚀 Empezar

```bash
git clone https://github.com/modulati0ns/Wavrr.git
cd Wavrr
# y ya está: doble clic en index.html
```

Sin build, sin `npm install`, sin servidor. Para publicarlo tienes las
instrucciones en [`deploy/`](deploy/README.md): GitHub Pages sin configurar nada,
o un contenedor mínimo detrás de Nginx Proxy Manager.

## 🧭 Un recorrido de dos minutos

1. **Onda plana.** Sube el desfase δ hasta 90° con amplitudes iguales y mira cómo
   la recta se abre hasta convertirse en un círculo.
2. Pulsa **pausa** y gira la escena: una onda *dextrógira* en el tiempo dibuja una
   hélice *levógira* en el espacio. Son dos cosas distintas y se confunden mucho.
3. Cambia la forma de onda a **cuadrada**. El panel deja de decir «circular» y pasa
   a «parcialmente polarizada, 74 %», con el desglose por armónicos.
4. **Generador manual.** Arrastra la bolita y observa salir tu trazo.
5. **Radiación 3D.** Elige un dipolo λ/2 y fíjate en el nulo justo sobre su eje:
   una antena no radia hacia donde «apunta».

## 🎓 La parte que más nos gusta

Una onda cuadrada no es *una* onda: es la suma de muchas sinusoides. Y un retardo
en el tiempo desfasa al armónico `n` en `n·ω·τ`, no en `ω·τ`. Con un cuarto de
periodo, el fundamental gira hacia un lado, el tercer armónico hacia el contrario
y el quinto otra vez al primero.

Resultado: **la señal deja de estar totalmente polarizada**. No porque haya nada
desordenado —cada armónico por separado está polarizado al 100 %— sino porque no
se ponen de acuerdo entre ellos.

| Forma de onda | Grado de polarización |
|---|---|
| Sinusoidal | 100 % |
| Triangular | 97,5 % |
| Cuadrada | 74,4 % |
| Diente de sierra | 57,2 % |
| Monociclo | 2,8 % |

En la esfera de Poincaré se ve de un vistazo: los estados totalmente polarizados
están en la superficie y los parciales **se hunden hacia el centro**.

## ✅ Verificación

La física no se comprueba a ojo. `tools/verify.mjs` lee las funciones
directamente de `index.html` y las valida contra valores de libro:

```bash
node tools/verify.mjs
```

<details>
<summary><b>Las 46 comprobaciones</b></summary>

<br>

- Las seis formas de onda tienen **valor medio cero** (un campo con componente
  continua no se radia) y pico normalizado.
- El campo propagado coincide con `cos(ωt − kz)` y se repite cada λ.
- `δ = +90°` produce giro **dextrógiro** en el convenio IEEE.
- Stokes y grado de polarización coinciden con un cálculo independiente por
  análisis armónico, y con una sinusoide se reducen exactamente a las fórmulas
  clásicas `s₂ = 2·Ax·Ay·cos δ / s₀` y `s₃ = 2·Ax·Ay·sin δ / s₀`.
- Directividades y anchos de haz contra Balanis: **1,76 dBi** el dipolo corto,
  **2,15** el λ/2 con 78°, **3,82** el de 1λ, **5,15** el monopolo con 39°.
- `E ⊥ B ⊥ k` y el vector de Poynting apunta hacia fuera en toda la esfera.
- El muestreo espacial queda por encima del límite de Nyquist.

</details>

## 📐 Convenios adoptados

Los convenios de polarización se contradicen entre disciplinas, así que están por
escrito. El panel de créditos de la aplicación los detalla.

| Asunto | Elección |
|---|---|
| Campo eléctrico | `Ex = Ax·cos(kz − ωt)`, `Ey = Ay·cos(kz − ωt + δ)` |
| Campo magnético | `B = (1/c)·ẑ × E`, dibujado multiplicado por c |
| Sentido de giro | **IEEE**: pulgar derecho hacia +z, los dedos siguen el giro |
| Desfase δ | retardo temporal de la componente y, no una fase |
| Esfera de Poincaré | polo norte = dextrógiro IEEE (uso de la IAU) |
| Unidades | normalizadas: λ = 2 u, periodo 3 s, v = 2/3 u/s |

> ⚠️ Dos avisos que conviene recordar: lo que aquí se llama **dextrógiro** es
> levógiro en el convenio clásico de la óptica, y la norma **IEEE 145** dibuja la
> esfera de Poincaré con el eje vertical invertido respecto a esta.

## 🚧 Límites del modelo

- Onda plana monocromática en el vacío, sin dispersión ni atenuación.
- En la vista de radiación, **solo campo lejano**: sin campo cercano, acoplo,
  impedancia ni suelo real.
- Los **diagramas de antena son monocromáticos**. Cada armónico de una señal no
  sinusoidal vería una antena distinta —un «dipolo λ/2» es un dipolo de 1,5 λ para
  su tercer armónico— y la interfaz lo avisa con cifras concretas. Sumar los
  diagramas de todos los armónicos queda como mejora pendiente.
- La velocidad de propagación es una **escala de dibujo**, no un valor físico.

## 🗺️ Mejoras pendientes

- [ ] Diagrama de antena de banda ancha, sumando armónicos
- [ ] Plano de tierra real con el rayo reflejado
- [ ] Array orientable por desfase, para ver el *beamforming*
- [ ] Pérdida por desajuste de polarización entre transmisor y receptor

## 📦 Estructura

```
index.html                    la aplicación entera
tools/verify.mjs              comprobaciones de la física
deploy/                       GitHub Pages y NAS con Nginx Proxy Manager
.github/workflows/            la verificación se ejecuta en cada push
LICENSE.md                    CC BY-SA 4.0
```

Que sea un único fichero es deliberado: se puede pasar por correo, llevar en un
pendrive y abrir en el ordenador del aula sin instalar nada.

## 📚 Fuentes

IEEE Std 145 · Balanis, *Antenna Theory* y *Advanced Engineering Electromagnetics* ·
Ellingson, *Electromagnetics* (LibreTexts, en abierto) · Born & Wolf, *Principles of
Optics* · Robishaw & Heiles, [arXiv:1806.07391](https://arxiv.org/abs/1806.07391)
sobre convenios en polarimetría.

---

<div align="center">
<sub>Hecho para enseñar. Si encuentras un error de física o de convenio, abre un issue:
la parte de convenios es donde más fácil es colarse.</sub>
</div>
